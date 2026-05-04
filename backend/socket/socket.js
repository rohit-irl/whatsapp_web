import User from "../models/User.js";
import Message from "../models/Message.js";
import Call from "../models/Call.js";

const setOffline = async (io, userId) => {
  if (!userId) return;
  const now = new Date();
  await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: now });
  io.emit("user_status_change", {
    userId: String(userId),
    isOnline: false,
    lastSeen: now.toISOString(),
  });
};

const activeCalls = new Map();

const configureSocket = (io) => {
  console.log(">>> [SERVER] v3.0: CALL SYSTEM LOADED WITH STRING IDs");
  io.on("connection", (socket) => {
    socket.on("join", async (userId) => {
      if (!userId) return;
      const id = String(userId);
      socket.data.userId = id;
      socket.join(id);
      try {
        const now = new Date();
        await User.findByIdAndUpdate(id, { isOnline: true, lastSeen: now });
        io.emit("user_status_change", {
          userId: id,
          isOnline: true,
          lastSeen: now.toISOString(),
        });
      } catch (e) {
        console.error("socket join", e);
      }
    });

    socket.on("join_groups", (groupIds) => {
      if (!Array.isArray(groupIds)) return;
      groupIds.forEach((gid) => {
        if (gid) socket.join(`group:${gid}`);
      });
    });

    socket.on("user_offline", async (userId) => {
      const id = userId || socket.data.userId;
      await setOffline(io, id);
    });

    socket.on("sendMessage", (message) => {
      const receiverId = message?.receiver?._id || message?.receiver;
      const groupId = message?.groupId;
      const ioRef = io;
      if (groupId) {
        ioRef.to(`group:${groupId}`).emit("receiveMessage", message);
        return;
      }
      if (!receiverId) return;
      ioRef.to(String(receiverId)).emit("receiveMessage", message);
    });

    // ── Typing indicators ──────────────────────────────────
    // Relay typing events to the receiver so they see "typing..." in real-time.
    // { senderId, receiverId } for DMs; { senderId, groupId } for groups.
    socket.on("typing", ({ senderId, receiverId, groupId, username }) => {
      if (groupId) {
        socket.to(`group:${groupId}`).emit("typing", { senderId, groupId, username });
      } else if (receiverId) {
        io.to(String(receiverId)).emit("typing", { senderId, username });
      }
    });

    socket.on("stop_typing", ({ senderId, receiverId, groupId }) => {
      if (groupId) {
        socket.to(`group:${groupId}`).emit("stop_typing", { senderId, groupId });
      } else if (receiverId) {
        io.to(String(receiverId)).emit("stop_typing", { senderId });
      }
    });

    // ── Read receipts ──────────────────────────────────────
    // Receiver tells sender that messages have been seen.
    // { readerId, senderId } — forward to sender's room so their tick turns blue.
    socket.on("mark_seen", ({ readerId, senderId, chatId }) => {
      if (senderId) {
        io.to(String(senderId)).emit("messages_seen", { readerId, chatId });
      }
    });

    socket.on("message_delivered", async ({ messageId, senderId, chatId }) => {
      try {
        if (messageId) {
          const updatedMsg = await Message.findByIdAndUpdate(messageId, { status: "delivered" });
          console.log("[SOCKET] Marking delivered, messageId: " + messageId + " result: " + (updatedMsg ? "success" : "failed"));
        }
        if (senderId) {
          io.to(String(senderId)).emit("message_status_update", { messageId, chatId, status: "delivered" });
        }
      } catch (err) {
        console.error("Error in message_delivered:", err);
      }
    });

    // ── Call signaling ─────────────────────────────────────

    socket.on("call_user", async ({ callerId, callerName, callerAvatar, receiverId, type }) => {
      console.log(">>> [SOCKET] call_user RECEIVED", { callerId, receiverId, type });
      try {
        if (!callerId || !receiverId) {
          console.error(">>> [SOCKET] FAILED: Missing IDs");
          return;
        }

        console.log(">>> [SOCKET] Attempting to create Call document...");
        const newCall = new Call({
          caller: String(callerId),
          receiver: String(receiverId),
          type: type || "voice",
          status: "missed",
        });

        console.log(">>> [SOCKET] Attempting to save Call document...");
        const savedCall = await newCall.save();
        console.log(">>> [SOCKET] SUCCESS: Call saved with ID:", savedCall._id);

        socket.data.activeCallId = savedCall._id;
        socket.emit("call_initiated", { callId: savedCall._id });

        console.log(">>> [SOCKET] Emitting incoming_call to receiver:", receiverId);
        io.to(String(receiverId)).emit("incoming_call", {
          callerId,
          callerName,
          callerAvatar,
          type,
          callId: savedCall._id
        });
      } catch (err) {
        console.error(">>> [SOCKET] CRITICAL SAVE ERROR:", err.message);
        console.error(err);
      }
    });

    socket.on("accept_call", async ({ callerId, receiverId, callId }) => {
      try {
        await Call.findByIdAndUpdate(callId, { status: "accepted" });
        activeCalls.set(String(callId), { startTime: Date.now() });
        io.to(String(callerId)).emit("call_accepted", { receiverId, callId });
      } catch (err) {
        console.error("Error in accept_call:", err);
      }
    });

    socket.on("reject_call", async ({ callerId, receiverId, callId }) => {
      try {
        await Call.findByIdAndUpdate(callId, { status: "rejected" });
        io.to(String(callerId)).emit("call_rejected", { receiverId, callId });
      } catch (err) {
        console.error("Error in reject_call:", err);
      }
    });

    socket.on("end_call", async ({ receiverId, callerId, callId }) => {
      try {
        const callDoc = await Call.findById(callId);
        let duration = 0;
        const activeCall = activeCalls.get(String(callId));
        if (activeCall) {
          duration = Math.floor((Date.now() - activeCall.startTime) / 1000);
          activeCalls.delete(String(callId));
        }

        // Update call status if it was 'missed' and ended by someone
        const finalStatus = callDoc?.status === "accepted" ? "completed" : callDoc?.status || "missed";
        await Call.findByIdAndUpdate(callId, { duration, status: finalStatus });

        if (receiverId) io.to(String(receiverId)).emit("call_ended");
        if (callerId) io.to(String(callerId)).emit("call_ended");

        // Create Chat Message
        const isVideo = callDoc?.type === "video";
        const callMsg = new Message({
          sender: callerId,
          receiver: receiverId,
          type: "call",
          text: `${isVideo ? "Video" : "Voice"} call ${finalStatus}`,
          durationSec: duration
        });
        await callMsg.save();

        io.to(String(callerId)).emit("receiveMessage", callMsg);
        io.to(String(receiverId)).emit("receiveMessage", callMsg);
      } catch (err) {
        console.error("Error in end_call:", err);
      }
    });

    socket.on("disconnect", async () => {
      const uid = socket.data.userId;
      if (uid) await setOffline(io, uid);
    });
  });
};

export default configureSocket;
