import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    type: [String],
    validate: [(arr) => arr.length === 4, "Each question must have exactly 4 options"],
    required: true,
  },
  correctAnswer: { type: Number, min: 0, max: 3, required: true }, // index 0-3
  marks: { type: Number, required: true, default: 1 },
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", required: true },
    questions: [questionSchema],
    duration: { type: Number, required: true }, // minutes
    totalMarks: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { timestamps: true }
);

// Auto-calculate totalMarks before saving
quizSchema.pre("save", function (next) {
  this.totalMarks = this.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  next();
});

const answerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  selectedOption: { type: Number, min: 0, max: 3, required: true },
});

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    answers: [answerSchema],
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    status: { type: String, enum: ["attempted"], default: "attempted" },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Quiz = mongoose.model("Quiz", quizSchema);
export const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);