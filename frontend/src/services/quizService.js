import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Axios instance with auth token interceptor — mirrors courseService pattern
const api = axios.create({ baseURL: `${API_BASE}/api/quizzes` });

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("instructorToken") ||
    localStorage.getItem("studentToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Instructor ────────────────────────────────────────────────────────────

/**
 * Create a new quiz (draft).
 * @param {{ title, description, courseId, questions, duration }} data
 */
export const createQuiz = async (data) => {
  const res = await api.post("/create", data);
  return res.data;
};

/**
 * Publish a quiz so enrolled students can see it.
 * @param {string} quizId
 */
export const publishQuiz = async (quizId) => {
  const res = await api.put(`/publish/${quizId}`);
  return res.data;
};

/**
 * Get all quizzes created by the logged-in instructor.
 */
export const getMyQuizzes = async () => {
  const res = await api.get("/myQuizzes");
  return res.data;
};

// ── Student ───────────────────────────────────────────────────────────────

/**
 * Get all published quizzes for the student's enrolled courses.
 * Includes `attempted` flag and `score` if already submitted.
 */
export const getStudentQuizzes = async () => {
  const res = await api.get("/student");
  return res.data;
};

/**
 * Submit answers for a quiz.
 * @param {string} quizId
 * @param {{ answers: Array<{ questionIndex: number, selectedOption: number }> }} payload
 */
export const submitQuiz = async (quizId, payload) => {
  const res = await api.post(`/submit/${quizId}`, payload);
  return res.data;
};

/**
 * Get the result of a submitted quiz (score + correct answers).
 * @param {string} quizId
 */
export const getQuizResult = async (quizId) => {
  const res = await api.get(`/result/${quizId}`);
  return res.data;
};

export const quizService = {
  createQuiz,
  publishQuiz,
  getMyQuizzes,
  getStudentQuizzes,
  submitQuiz,
  getQuizResult,
};