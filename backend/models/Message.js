import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
    text: { type: String, default: "", trim: true },
    type: {
      type: String,
      enum: ["text", "image", "document", "audio"],
      default: "text",
    },
    fileUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },
    durationSec: { type: Number, default: 0 },
    starredBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deletedForEveryone: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

messageSchema.index({ sender: 1, receiver: 1, timestamp: 1 });
messageSchema.index({ groupId: 1, timestamp: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
