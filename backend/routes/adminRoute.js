import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";

const router = express.Router();

// Public route — no auth middleware (no Admin model exists yet)
router.get("/dashboard", getDashboardStats);

export default router;
