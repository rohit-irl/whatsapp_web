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
    const users = await User.find().sort({ username: 1 });
    return res.status(200).json(users);
  } catch (error) {
    return next(error);
  }
};
