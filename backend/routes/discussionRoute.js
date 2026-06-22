import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
    askQuestion,
    getStudentDiscussions,
    getInstructorDiscussions,
    answerQuestion,
} from "../controllers/discussionController.js";

const router = express.Router();

// Student asks a question
router.post("/", protect, askQuestion);

// Student gets their discussions
router.get("/student", protect, getStudentDiscussions);

// Instructor gets discussions for their courses
router.get("/instructor", protect, getInstructorDiscussions);

// Instructor answers a question
router.put("/:id/answer", protect, answerQuestion);

export default router;
