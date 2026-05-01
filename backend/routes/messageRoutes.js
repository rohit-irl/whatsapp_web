import express from "express";
import { getMessagesBetweenUsers, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", sendMessage);
router.get("/:user1/:user2", getMessagesBetweenUsers);

export default router;
