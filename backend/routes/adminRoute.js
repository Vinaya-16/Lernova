import express from "express";
import { getDashboardStats, getAllStudents, deleteStudent, getEnrollmentReport, getLearningAnalytics } from "../controllers/adminController.js";

const router = express.Router();

// Dashboard
router.get("/dashboard", getDashboardStats);

// Manage Students
router.get("/students", getAllStudents);
router.delete("/students/:id", deleteStudent);

// Enrollment Report
router.get("/enrollment-report", getEnrollmentReport);

// Learning Analytics
router.get("/learning-analytics", getLearningAnalytics);

export default router;
