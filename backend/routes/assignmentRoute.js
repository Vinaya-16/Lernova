import express from "express";
import protect from "../middleware/authMiddleware.js";

import {
    createAssignment,
    getMyAssignments,
    updateAssignment,
    deleteAssignment,
    getAssignmentSubmissions,
} from "../controllers/assignmentController.js";

const router = express.Router();

router.post("/", protect, createAssignment);

router.get(
    "/my",
    protect,
    getMyAssignments
);

router.put(
    "/:id",
    protect,
    updateAssignment
);

router.delete(
    "/:id",
    protect,
    deleteAssignment
);

router.get(
    "/:id/submissions",
    protect,
    getAssignmentSubmissions
);

export default router;