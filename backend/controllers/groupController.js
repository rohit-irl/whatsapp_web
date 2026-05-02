import mongoose from "mongoose";
import Group from "../models/Group.js";
import User from "../models/User.js";

export const createGroup = async (req, res, next) => {
  try {
    const { name, memberIds = [], avatar = "", description = "", createdBy } = req.body;
    if (!name?.trim() || !createdBy) {
      return res.status(400).json({ message: "Name and createdBy are required" });
    }
    const creator = await User.findById(createdBy);
    if (!creator) return res.status(404).json({ message: "User not found" });

    const members = [...new Set([String(createdBy), ...memberIds.map(String)])]
      .filter((id) => mongoose.isValidObjectId(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const group = await Group.create({
      name: name.trim(),
      description: description || "",
      avatar: avatar || "",
      members,
      admins: [createdBy],
      createdBy,
    });

    const populated = await Group.findById(group._id).populate("members", "username avatar isOnline lastSeen");
    const io = req.app.get("io");
    members.forEach((mid) => {
      io?.to(String(mid)).emit("group_created", { groupId: String(group._id) });
    });

    return res.status(201).json(populated);
  } catch (error) {
    return next(error);
  }
};

export const listGroups = async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "userId query required" });

    const groups = await Group.find({ members: userId })
      .populate("members", "username avatar isOnline lastSeen")
      .sort({ updatedAt: -1 });

    return res.status(200).json(groups);
  } catch (error) {
    return next(error);
  }
};
