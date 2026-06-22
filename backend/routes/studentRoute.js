import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
    getStudentsProgress,
    getStudentProgress,
    getCourseStudents
} from "../controllers/studentController.js";

const router = express.Router();

// Get all students progress (for instructor dashboard)
router.get("/progress", protect, getStudentsProgress);

// Get a specific student's progress
router.get("/progress/:studentId", protect, getStudentProgress);

// Get all students in a specific course
router.get("/course/:courseId", protect, getCourseStudents);

export default router;