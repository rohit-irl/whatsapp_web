import mongoose from "mongoose";
import Group from "../models/Group.js";
import Message from "../models/Message.js";

export const shapeMessage = (doc) => {
  if (!doc) return null;
  const m = doc.toObject ? doc.toObject() : { ...doc };
  const fileType =
    m.type === "image" ? "image" : m.type === "audio" ? "audio" : m.type === "document" ? "document" : null;
  return {
    ...m,
    status: m.status || "sent",
    fileType,
  };
};

export const sendMessage = async (req, res, next) => {
  try {
    const io = req.app.get("io");
    const {
      sender,
      receiver,
      text = "",
      type = "text",
      fileUrl = "",
      fileName = "",
      groupId,
      durationSec = 0,
    } = req.body;

    if (!sender) {
      return res.status(400).json({ message: "Sender is required" });
    }

    const msgType = ["text", "image", "document", "audio"].includes(type) ? type : "text";

    if (msgType === "text" && !String(text || "").trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }
    if (msgType === "audio" && !fileUrl) {
      return res.status(400).json({ message: "Audio data required" });
    }
    if ((msgType === "image" || msgType === "document") && !fileUrl) {
      return res.status(400).json({ message: "File required" });
    }

    if (groupId) {
      if (!mongoose.isValidObjectId(String(groupId))) {
        return res.status(400).json({ message: "Invalid group" });
      }
      const group = await Group.findById(groupId);
      if (!group || !group.members.some((mid) => String(mid) === String(sender))) {
        return res.status(403).json({ message: "Not a group member" });
      }

      const doc = await Message.create({
        sender,
        groupId,
        receiver: null,
        text: String(text || "").trim(),
        type: msgType,
        fileUrl,
        fileName: fileName || (msgType === "audio" ? "voice-note.ogg" : ""),
        durationSec: Number(durationSec) || 0,
      });

      const populated = await Message.findById(doc._id)
        .populate({ path: "sender", model: "User", select: "username avatar" })
        .populate("groupId", "name members");

      const payload = shapeMessage(populated);
      io?.to(`group:${groupId}`).emit("receiveMessage", payload);
      return res.status(201).json(payload);
    }

    if (!receiver) {
      return res.status(400).json({ message: "Receiver is required for direct messages" });
    }

    const doc = await Message.create({
      sender,
      receiver,
      text: String(text || "").trim(),
      type: msgType,
      fileUrl,
      fileName: fileName || (msgType === "audio" ? "voice-note.ogg" : ""),
      durationSec: Number(durationSec) || 0,
    });

    const populated = await Message.findById(doc._id)
      .populate({ path: "sender", model: "User", select: "username avatar" })
      .populate({ path: "receiver", model: "User", select: "username avatar" });

    const payload = shapeMessage(populated);
    console.log("[SOCKET] Emitting new_message to receiver: " + receiver);
    io?.to(String(receiver)).emit("receiveMessage", payload);
    return res.status(201).json(payload);
  } catch (error) {
    return next(error);
  }
};

export const getMessagesBetweenUsers = async (req, res, next) => {
  try {
    const { user1, user2 } = req.params;

    const u1Arr = [user1];
    if (mongoose.isValidObjectId(String(user1))) u1Arr.push(new mongoose.Types.ObjectId(String(user1)));
    const u2Arr = [user2];
    if (mongoose.isValidObjectId(String(user2))) u2Arr.push(new mongoose.Types.ObjectId(String(user2)));

    const query = {
      $and: [
        { $or: [{ groupId: null }, { groupId: { $exists: false } }] },
        {
          $or: [
            { sender: { $in: u1Arr }, receiver: { $in: u2Arr } },
            { sender: { $in: u2Arr }, receiver: { $in: u1Arr } }
          ]
        },
        { deletedFor: { $nin: u1Arr } }
      ]
    };

    const docs = await Message.find(query).sort({ timestamp: 1, createdAt: 1 });
    const results = [];
    for (const doc of docs) {
      const sId = doc.sender;
      const rId = doc.receiver;
      
      // Only populate if it looks like a real database ID
      if (mongoose.isValidObjectId(String(sId))) {
        await doc.populate({ path: "sender", model: "User", select: "username avatar" });
      }
      if (rId && mongoose.isValidObjectId(String(rId))) {
        await doc.populate({ path: "receiver", model: "User", select: "username avatar" });
      }

      // If population failed (user deleted or mock ID), restore the original ID
      const m = doc.toObject();
      if (!m.sender) m.sender = sId;
      if (rId && !m.receiver) m.receiver = rId;

      results.push(shapeMessage(m));
    }

    return res.status(200).json(results);
  } catch (error) {
    return next(error);
  }
};

export const getGroupMessages = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.query;
    if (!mongoose.isValidObjectId(String(groupId))) {
      return res.status(400).json({ message: "Invalid group" });
    }
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (memberId && !group.members.some((m) => String(m) === String(memberId))) {
      return res.status(403).json({ message: "Not a member" });
    }

    const memberIds = [memberId];
    if (memberId && mongoose.isValidObjectId(String(memberId))) {
      memberIds.push(new mongoose.Types.ObjectId(String(memberId)));
    }

    const filter = { 
      groupId, 
      ...(memberId ? { deletedFor: { $nin: memberIds } } : {}) 
    };

    const messages = await Message.find(filter)
      .sort({ timestamp: 1, createdAt: 1 })
      .populate({ path: "sender", model: "User", select: "username avatar" });

    return res.status(200).json(messages.map(shapeMessage));
  } catch (error) {
    return next(error);
  }
};

export const toggleStarMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;
    if (!userId || !mongoose.isValidObjectId(messageId)) {
      return res.status(400).json({ message: "Invalid request" });
    }
    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    const uid = new mongoose.Types.ObjectId(String(userId));
    const idx = msg.starredBy.findIndex((id) => String(id) === String(userId));
    if (idx >= 0) msg.starredBy.splice(idx, 1);
    else msg.starredBy.push(uid);
    await msg.save();

    return res.status(200).json({ starred: idx < 0, message: shapeMessage(msg) });
  } catch (error) {
    return next(error);
  }
};

export const getStarredMessages = async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const messages = await Message.find({ starredBy: userId })
      .sort({ timestamp: -1 })
      .populate({ path: "sender", model: "User", select: "username avatar" })
      .populate({ path: "receiver", model: "User", select: "username avatar" })
      .populate("groupId", "name");

    return res.status(200).json(messages.map(shapeMessage));
  } catch (error) {
    return next(error);
  }
};

// DELETE FOR ME — soft delete: adds userId to deletedFor array
export const deleteForMe = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;
    if (!userId || !mongoose.isValidObjectId(messageId)) {
      return res.status(400).json({ message: "Invalid request" });
    }
    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    const uid = new mongoose.Types.ObjectId(String(userId));
    if (!msg.deletedFor.some((id) => String(id) === String(userId))) {
      msg.deletedFor.push(uid);
      await msg.save();
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

// DELETE FOR EVERYONE — soft tombstone, only sender may do this
export const deleteForEveryone = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;
    if (!userId || !mongoose.isValidObjectId(messageId)) {
      return res.status(400).json({ message: "Invalid request" });
    }
    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    if (String(msg.sender) !== String(userId)) {
      return res.status(403).json({ message: "Only sender can delete for everyone" });
    }

    // Soft-delete: mark as deleted, wipe content so it persists as tombstone
    await Message.findByIdAndUpdate(messageId, {
      $set: {
        deletedForEveryone: true,
        text: "",
        fileUrl: "",
        fileName: ""
      }
    });

    const io = req.app.get("io");
    const payload = { messageId, deletedForEveryone: true };

    // Notify all participants in real time
    if (msg.groupId) {
      io?.to(`group:${msg.groupId}`).emit("messageUpdated", payload);
    } else {
      io?.to(String(msg.receiver)).emit("messageUpdated", payload);
      io?.to(String(msg.sender)).emit("messageUpdated", payload);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

export const markMessagesSeen = async (req, res, next) => {
  try {
    const { senderId, receiverId } = req.body;
    if (senderId && receiverId) {
      const updateRes = await Message.updateMany(
        { sender: senderId, receiver: receiverId, status: { $ne: "seen" } },
        { $set: { status: "seen" } }
      );
      console.log("[SOCKET] Marking seen, senderId: " + senderId + " updated count: " + updateRes.modifiedCount);
      const io = req.app.get("io");
      io?.to(String(senderId)).emit("messages_seen", { readerId: receiverId, chatId: senderId });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    return next(err);
  }
};

