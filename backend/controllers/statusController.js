import mongoose from "mongoose";
import Status from "../models/Status.js";
import User from "../models/User.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export const createStatus = async (req, res, next) => {
  try {
    const { userId, mediaUrl, mediaType, caption = "" } = req.body;
    if (!userId || !mediaUrl || !["image", "video"].includes(mediaType)) {
      return res.status(400).json({ message: "userId, mediaUrl, mediaType required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const expiresAt = new Date(Date.now() + DAY_MS);
    const status = await Status.create({
      userId,
      mediaUrl,
      mediaType,
      caption: String(caption || ""),
      expiresAt,
    });

    const populated = await Status.findById(status._id).populate("userId", "username avatar");
    const io = req.app.get("io");
    io?.emit("new_status", {
      status: populated,
      userId: String(userId),
    });

    return res.status(201).json(populated);
  } catch (error) {
    return next(error);
  }
};

export const listStatuses = async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const now = new Date();
    const me = await User.findById(userId);
    if (!me) return res.status(404).json({ message: "User not found" });

    const allUsers = await User.find({ _id: { $ne: userId } }).select("_id");
    const contactIds = allUsers.map((u) => u._id);

    const rows = await Status.find({
      userId: { $in: [...contactIds, userId] },
      expiresAt: { $gt: now },
    })
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
};

export const recordStatusView = async (req, res, next) => {
  try {
    const { statusId } = req.params;
    const { userId } = req.body;
    if (!userId || !mongoose.isValidObjectId(statusId)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const status = await Status.findById(statusId);
    if (!status) return res.status(404).json({ message: "Status not found" });

    const uid = new mongoose.Types.ObjectId(String(userId));
    if (!status.views.some((v) => String(v) === String(userId))) {
      status.views.push(uid);
      await status.save();
    }

    return res.status(200).json({ views: status.views.length });
  } catch (error) {
    return next(error);
  }
};

export const myStatusViewers = async (req, res, next) => {
  try {
    const { statusId } = req.params;
    const { ownerId } = req.query;
    const status = await Status.findById(statusId).populate("views", "username avatar");
    if (!status) return res.status(404).json({ message: "Not found" });
    if (String(status.userId) !== String(ownerId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return res.status(200).json({ views: status.views });
  } catch (error) {
    return next(error);
  }
};

export const deleteStatus = async (req, res, next) => {
  try {
    const { statusId } = req.params;
    const { userId } = req.body;
    if (!userId || !mongoose.isValidObjectId(statusId)) {
      return res.status(400).json({ message: "Invalid request" });
    }
    const status = await Status.findById(statusId);
    if (!status) return res.status(404).json({ message: "Status not found" });
    if (String(status.userId) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await Status.findByIdAndDelete(statusId);
    const io = req.app.get("io");
    io?.emit("new_status", { userId: String(userId) }); // trigger refresh
    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};
