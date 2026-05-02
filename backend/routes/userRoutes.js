import express from "express";
import { createUser, getUserSettings, getUsers, updateProfile } from "../controllers/userController.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", getUsers);
router.get("/:userId/settings", getUserSettings);
router.put("/:userId/profile", updateProfile);

export default router;
