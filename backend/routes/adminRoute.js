import express from "express";
import { getDashboardStats, getAllStudents, deleteStudent } from "../controllers/adminController.js";

const router = express.Router();

// Dashboard
router.get("/dashboard", getDashboardStats);

// Manage Students
router.get("/students", getAllStudents);
router.delete("/students/:id", deleteStudent);

export default router;
