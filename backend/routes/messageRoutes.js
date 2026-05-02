import express from "express";
import {
  deleteForEveryone,
  deleteForMe,
  getGroupMessages,
  getMessagesBetweenUsers,
  getStarredMessages,
  sendMessage,
  toggleStarMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/starred", getStarredMessages);
router.put("/star/:messageId", toggleStarMessage);
router.patch("/delete-for-me/:messageId", deleteForMe);
router.patch("/delete-for-everyone/:messageId", deleteForEveryone);
router.get("/group/:groupId", getGroupMessages);
router.post("/", sendMessage);
router.get("/:user1/:user2", getMessagesBetweenUsers);

export default router;
