import mongoose from "mongoose";
import User from "../models/User.js";

const toggleId = (arr, idStr) => {
  if (!mongoose.isValidObjectId(idStr)) {
    throw new Error("Invalid id");
  }
  const id = new mongoose.Types.ObjectId(idStr);
  const list = arr || [];
  const s = list.map(String);
  const i = s.indexOf(idStr);
  if (i >= 0) {
    list.splice(i, 1);
    return false;
  }
  list.push(id);
  return true;
};

export const toggleArchive = async (req, res, next) => {
  try {
    const { userId, kind = "user" } = req.body;
    const { peerId } = req.params;
    if (!userId || !peerId) return res.status(400).json({ message: "userId and peer required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const field = kind === "group" ? "archivedGroupIds" : "archivedUserIds";
    if (!user[field]) user[field] = [];
    const on = toggleId(user[field], String(peerId));
    await user.save();

    return res.status(200).json({ archived: on, field });
  } catch (error) {
    return next(error);
  }
};

export const chatContextAction = async (req, res, next) => {
  try {
    const { userId, action, kind = "user" } = req.body;
    const { peerId } = req.params;
    if (!userId || !peerId || !action) {
      return res.status(400).json({ message: "userId, peerId, action required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const map = {
      archive: kind === "group" ? "archivedGroupIds" : "archivedUserIds",
      mute: kind === "group" ? "mutedGroupIds" : "mutedUserIds",
      pin: kind === "group" ? "pinnedGroupIds" : "pinnedUserIds",
      delete: kind === "group" ? "hiddenGroupIds" : "hiddenUserIds",
    };
    const field = map[action];
    if (!field) return res.status(400).json({ message: "Invalid action" });

    if (!user[field]) user[field] = [];
    const on = toggleId(user[field], String(peerId));
    await user.save();

    return res.status(200).json({ [action]: on, field });
  } catch (error) {
    return next(error);
  }
};

export const getArchivedLists = async (req, res, next) => {
  try {
    const { forUserId } = req.query;
    if (!forUserId) return res.status(400).json({ message: "forUserId required" });

    const user = await User.findById(forUserId)
      .populate({
        path: "archivedUserIds",
        select: "username avatar isOnline lastSeen",
      })
      .populate({
        path: "archivedGroupIds",
        populate: { path: "members", select: "username avatar" },
      });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      users: user.archivedUserIds || [],
      groups: user.archivedGroupIds || [],
    });
  } catch (error) {
    return next(error);
  }
};
