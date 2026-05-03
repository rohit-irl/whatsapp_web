import express from "express";
import { getCallLogs, createCallLog } from "../controllers/callController.js";

const router = express.Router();

router.get("/:userId", getCallLogs);
router.post("/", createCallLog);

export default router;
