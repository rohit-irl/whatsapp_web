import express from "express";
import { createGroup, listGroups } from "../controllers/groupController.js";

const router = express.Router();

router.post("/create", createGroup);
router.get("/", listGroups);

export default router;
