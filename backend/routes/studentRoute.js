// routes/studentRoutes.js
import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
    getStudentsProgress,
    getStudentDetailedProgress,
    updateVideoProgress,
    getCourseProgress
} from "../controllers/studentController.js";

const router = express.Router();

// Instructor routes
router.get("/progress", protect, getStudentsProgress);
router.get("/progress/student/:studentId", protect, getStudentDetailedProgress);

// Student routes - video progress tracking
router.get("/progress/course/:courseId", protect, getCourseProgress);
router.post("/progress/video", protect, updateVideoProgress);

export default router;