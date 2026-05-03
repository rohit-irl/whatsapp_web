import mongoose from "mongoose";
import dotenv from "dotenv";
import Call from "./models/Call.js";

dotenv.config();

const checkCalls = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/whatsapp_clone");
    console.log("Connected to DB");
    const calls = await Call.find().populate("caller receiver", "username");
    console.log("Total calls in DB:", calls.length);
    calls.forEach(c => {
      console.log(`Call: ${c.caller?.username} -> ${c.receiver?.username}, Status: ${c.status}, CreatedAt: ${c.createdAt}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkCalls();
