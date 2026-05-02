import bcrypt from "bcryptjs";
import User from "../models/User.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  username: user.username,
  avatar: user.avatar || "",
  about: user.about || "",
  isOnline: user.isOnline,
  lastSeen: user.lastSeen,
});

const broadcastStatus = (req, payload) => {
  const io = req.app?.get?.("io");
  io?.emit("user_status_change", payload);
};

export const signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !username.trim() || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedUsername = username.trim();
    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: normalizedUsername,
      password: passwordHash,
    });

    const fresh = await User.findById(user._id);
    return res.status(201).json({
      message: "Signup successful",
      user: sanitizeUser(fresh || user),
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !username.trim() || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username: username.trim() });
    if (!user?.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const now = new Date();
    user.isOnline = true;
    user.lastSeen = now;
    await user.save();

    broadcastStatus(req, {
      userId: String(user._id),
      isOnline: true,
      lastSeen: now.toISOString(),
    });

    return res.status(200).json({
      message: "Login successful",
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const now = new Date();
    await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: now });

    broadcastStatus(req, {
      userId: String(userId),
      isOnline: false,
      lastSeen: now.toISOString(),
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return next(error);
  }
};
