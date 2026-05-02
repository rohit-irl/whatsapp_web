import express from "express";
import { createStatus, deleteStatus, listStatuses, myStatusViewers, recordStatusView } from "../controllers/statusController.js";

const router = express.Router();

router.post("/", createStatus);
router.get("/", listStatuses);
router.put("/view/:statusId", recordStatusView);
router.get("/:statusId/viewers", myStatusViewers);
router.post("/delete/:statusId", deleteStatus);

export default router;
