import { Quiz, QuizAttempt } from "../models/QuizModel.js";
import Course from "../models/coursesModel.js";

// ── Instructor: Create Quiz (status = draft) ─────────────────────────────
export const createQuiz = async (req, res) => {
  try {
    const { title, description, courseId, questions, duration } = req.body;
    const instructorId = req.user._id;

    // Verify the course belongs to this instructor
    const course = await Course.findOne({ _id: courseId, instructorId });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or not yours" });
    }

    const quiz = new Quiz({
      title,
      description,
      courseId,
      instructorId,
      questions: questions || [],
      duration,
      status: "draft",
    });

    await quiz.save();

    return res.status(201).json({ success: true, message: "Quiz created as draft", quiz });
  } catch (error) {
    console.error("createQuiz error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── Instructor: Publish Quiz ──────────────────────────────────────────────
export const publishQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user._id;

    const quiz = await Quiz.findOne({ _id: id, instructorId });
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found or not yours" });
    }

    if (quiz.questions.length === 0) {
      return res.status(400).json({ success: false, message: "Cannot publish a quiz with no questions" });
    }

    quiz.status = "published";
    await quiz.save();

    return res.status(200).json({ success: true, message: "Quiz published successfully", quiz });
  } catch (error) {
    console.error("publishQuiz error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── Instructor: Get My Quizzes ────────────────────────────────────────────
export const getMyQuizzes = async (req, res) => {
  try {
    const instructorId = req.user._id;

    const quizzes = await Quiz.find({ instructorId })
      .populate("courseId", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, quizzes });
  } catch (error) {
    console.error("getMyQuizzes error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── Student: Get Quizzes for Enrolled Courses ─────────────────────────────
export const getStudentQuizzes = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Find all courses the student is enrolled in
    const enrolledCourses = await Course.find({ studentsEnrolled: studentId }).select("_id");
    const courseIds = enrolledCourses.map((c) => c._id);

    // Get published quizzes for those courses
    const quizzes = await Quiz.find({ courseId: { $in: courseIds }, status: "published" })
      .populate("courseId", "title")
      .select("-questions.correctAnswer") // don't expose answers upfront
      .sort({ createdAt: -1 });

    // Attach attempt info (score) if the student already attempted
    const quizIds = quizzes.map((q) => q._id);
    const attempts = await QuizAttempt.find({ studentId, quizId: { $in: quizIds } });
    const attemptMap = {};
    attempts.forEach((a) => { attemptMap[a.quizId.toString()] = a; });

    const enriched = quizzes.map((q) => {
      const attempt = attemptMap[q._id.toString()];
      return {
        ...q.toObject(),
        attempted: !!attempt,
        score: attempt ? attempt.score : null,
        totalMarks: q.totalMarks,
      };
    });

    return res.status(200).json({ success: true, quizzes: enriched });
  } catch (error) {
    console.error("getStudentQuizzes error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── Student: Submit Quiz (auto-graded) ───────────────────────────────────
export const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params; // quizId
    const studentId = req.user._id;
    const { answers } = req.body; // [{ questionIndex, selectedOption }]

    // Prevent re-submission
    const existing = await QuizAttempt.findOne({ quizId: id, studentId });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already attempted this quiz" });
    }

    const quiz = await Quiz.findOne({ _id: id, status: "published" });
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found or not published" });
    }

    // Auto-grade
    let score = 0;
    const gradedAnswers = (answers || []).map((ans) => {
      const question = quiz.questions[ans.questionIndex];
      if (question && ans.selectedOption === question.correctAnswer) {
        score += question.marks;
      }
      return { questionIndex: ans.questionIndex, selectedOption: ans.selectedOption };
    });

    const attempt = new QuizAttempt({
      quizId: id,
      studentId,
      answers: gradedAnswers,
      score,
      totalMarks: quiz.totalMarks,
      status: "attempted",
      submittedAt: new Date(),
    });

    await attempt.save();

    return res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",
      score,
      totalMarks: quiz.totalMarks,
      attempt,
    });
  } catch (error) {
    console.error("submitQuiz error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── Student: Get Quiz Result (score + correct answers) ───────────────────
export const getQuizResult = async (req, res) => {
  try {
    const { id } = req.params; // quizId
    const studentId = req.user._id;

    const attempt = await QuizAttempt.findOne({ quizId: id, studentId });
    if (!attempt) {
      return res.status(404).json({ success: false, message: "No attempt found for this quiz" });
    }

    // Now we expose correctAnswer so the student can see what they got right/wrong
    const quiz = await Quiz.findById(id).populate("courseId", "title");
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    return res.status(200).json({
      success: true,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      submittedAt: attempt.submittedAt,
      answers: attempt.answers,
      quiz: quiz.toObject(), // includes correctAnswer for result review
    });
  } catch (error) {
    console.error("getQuizResult error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};