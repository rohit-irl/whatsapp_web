import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    caller: { type: mongoose.Schema.Types.Mixed, required: true },
    receiver: { type: mongoose.Schema.Types.Mixed, required: true },
    type: { type: String, enum: ["voice", "video"], default: "voice" },
    status: { type: String, default: "missed" },
    durationSec: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Call = mongoose.model("CallLog", callSchema, "call_logs");
export default Call;
