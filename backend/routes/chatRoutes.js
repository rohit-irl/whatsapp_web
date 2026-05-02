import express from "express";
import { chatContextAction, getArchivedLists, toggleArchive } from "../controllers/chatController.js";

const router = express.Router();

router.get("/archived", getArchivedLists);
router.put("/archive/:peerId", toggleArchive);
router.put("/context/:peerId", chatContextAction);

export default router;
