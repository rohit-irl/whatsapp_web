import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import configureSocket from "./socket/socket.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const clientUrl = process.env.CLIENT_URL;

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (origin === clientUrl) return true;
  return /^http:\/\/localhost:51\d{2}$/.test(origin);
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
  },
});

configureSocket(io);

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Backend scaffold is running" });
});

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
