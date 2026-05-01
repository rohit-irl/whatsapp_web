import Message from "../models/Message.js";

export const sendMessage = async (req, res, next) => {
  try {
    const { sender, receiver, text } = req.body;

    if (!sender || !receiver) {
      return res.status(400).json({ message: "Sender and receiver are required" });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text cannot be empty" });
    }

    const message = await Message.create({
      sender,
      receiver,
      text: text.trim(),
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username")
      .populate("receiver", "username");

    return res.status(201).json(populatedMessage);
  } catch (error) {
    return next(error);
  }
};

export const getMessagesBetweenUsers = async (req, res, next) => {
  try {
    const { user1, user2 } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    })
      .sort({ timestamp: 1 })
      .populate("sender", "username")
      .populate("receiver", "username");

    return res.status(200).json(messages);
  } catch (error) {
    return next(error);
  }
};
