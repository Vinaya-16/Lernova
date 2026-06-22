import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createQuiz,
  publishQuiz,
  getMyQuizzes,
  getStudentQuizzes,
  submitQuiz,
  getQuizResult,
} from "../controllers/quizController.js";

const router = express.Router();

// ── Role guards (inline — matches your existing pattern) ─────────────────
const instructorOnly = (req, res, next) => {
  // req.user is set by protect; Instructor docs have a 'role' field or live in Instructor collection
  // We detect by checking the constructor name or a role field
  const isInstructor =
    req.user?.role === "instructor" ||
    req.user?.constructor?.modelName === "Instructor";
  if (!isInstructor) {
    return res.status(403).json({ success: false, message: "Instructor access only" });
  }
  next();
};

const studentOnly = (req, res, next) => {
  const isStudent =
    req.user?.role === "student" ||
    req.user?.constructor?.modelName === "Student";
  if (!isStudent) {
    return res.status(403).json({ success: false, message: "Student access only" });
  }
  next();
};

// ── Instructor routes ─────────────────────────────────────────────────────
router.post("/create", protect, instructorOnly, createQuiz);
router.put("/publish/:id", protect, instructorOnly, publishQuiz);
router.get("/myQuizzes", protect, instructorOnly, getMyQuizzes);

// ── Student routes ────────────────────────────────────────────────────────
router.get("/student", protect, studentOnly, getStudentQuizzes);
router.post("/submit/:id", protect, studentOnly, submitQuiz);
router.get("/result/:id", protect, studentOnly, getQuizResult);

export default router;