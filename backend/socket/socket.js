import User from "../models/User.js";

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

const configureSocket = (io) => {
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

    socket.on("disconnect", async () => {
      const uid = socket.data.userId;
      if (uid) await setOffline(io, uid);
    });
  });
};

export default configureSocket;
