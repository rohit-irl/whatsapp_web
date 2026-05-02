import User from "../models/User.js";

export const createUser = async (req, res, next) => {
  try {
    const { username } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ message: "Username is required" });
    }

    const normalizedUsername = username.trim();
    let user = await User.findOne({ username: normalizedUsername });

    if (!user) {
      user = await User.create({ username: normalizedUsername });
      return res.status(201).json(user);
    }

    return res.status(200).json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Username already exists" });
    }
    return next(error);
  }
};

export const getUsers = async (_req, res, next) => {
  try {
    const users = await User.find({})
      .select("username avatar about isOnline lastSeen")
      .sort({ username: 1 })
      .lean();
    return res.status(200).json(users);
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { avatar, about, username } = req.body;
    const updates = {};
    if (avatar !== undefined) updates.avatar = typeof avatar === "string" ? avatar : "";
    if (about !== undefined) updates.about = String(about);
    if (username !== undefined && String(username).trim()) updates.username = String(username).trim();

    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select(
      "username avatar about isOnline lastSeen"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const io = req.app.get("io");
    io?.emit("profile_updated", {
      userId: String(userId),
      avatar: user.avatar || "",
      username: user.username,
      about: user.about,
    });

    return res.status(200).json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Username already taken" });
    }
    return next(error);
  }
};

export const getUserSettings = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select(
      "archivedUserIds archivedGroupIds pinnedUserIds pinnedGroupIds mutedUserIds mutedGroupIds hiddenUserIds hiddenGroupIds"
    );
    if (!user) return res.status(404).json({ message: "Not found" });
    return res.status(200).json({
      archivedUserIds: user.archivedUserIds || [],
      archivedGroupIds: user.archivedGroupIds || [],
      pinnedUserIds: user.pinnedUserIds || [],
      pinnedGroupIds: user.pinnedGroupIds || [],
      mutedUserIds: user.mutedUserIds || [],
      mutedGroupIds: user.mutedGroupIds || [],
      hiddenUserIds: user.hiddenUserIds || [],
      hiddenGroupIds: user.hiddenGroupIds || [],
    });
  } catch (error) {
    return next(error);
  }
};
