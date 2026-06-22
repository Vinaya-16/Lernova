import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
    getStudentsProgress,
    updateVideoProgress,
    getCourseProgress,
    getStudentDashboard,
    getStudentDetailedProgress
} from "../controllers/studentController.js";

const router = express.Router();

// Get all students progress for this instructor's courses only
router.get("/progress", protect, getStudentsProgress);

// Get detailed progress for a specific student in instructor's courses
router.get("/progress/student/:studentId", protect, getStudentDetailedProgress);

// Update video progress (when student watches a video)
router.post("/progress/video", protect, updateVideoProgress);

// Get student's progress for a specific course
router.get("/progress/course/:courseId", protect, getCourseProgress);

// Get student dashboard stats
router.get("/dashboard", protect, getStudentDashboard);

export default router;