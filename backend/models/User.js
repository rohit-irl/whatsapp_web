import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, trim: true, default: "" },
    avatar: { type: String, default: "" },
    about: { type: String, default: "Hey there! I am using WhatsApp." },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    archivedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    archivedGroupIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    pinnedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    pinnedGroupIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    mutedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    mutedGroupIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    hiddenUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    hiddenGroupIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
