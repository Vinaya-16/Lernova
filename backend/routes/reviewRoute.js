import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
    addReview,
    getReviews,
    getInstructorReviews
} from "../controllers/reviewController.js";

const router = express.Router();

// Student leaves or updates a review
router.post("/", protect, addReview);

// Get all reviews in the system
router.get("/", protect, getReviews);

// Instructor gets reviews for their courses
router.get("/instructor", protect, getInstructorReviews);

export default router;
