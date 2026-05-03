import Call from "../models/Call.js";

export const getCallLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(">>> [API] Fetching calls for userId:", userId);
    const calls = await Call.find({
      $or: [{ caller: String(userId) }, { receiver: String(userId) }],
    })
      .sort({ timestamp: -1 })
      .populate({ path: "caller", model: "User", select: "username avatar" })
      .populate({ path: "receiver", model: "User", select: "username avatar" });

    console.log(">>> [API] Found calls count:", calls.length);
    res.status(200).json(calls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCallLog = async (req, res) => {
  try {
    const { caller, receiver, type, status, durationSec } = req.body;
    const newCall = new Call({ caller, receiver, type, status, durationSec });
    await newCall.save();
    res.status(201).json(newCall);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
