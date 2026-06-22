import Discussion from "../models/Discussion.js";
import Course from "../models/coursesModel.js";
import Enrollment from "../models/Enrollment.js";
import Student from "../models/Student.js";

// Student asks a question under a course
export const askQuestion = async (req, res) => {
    try {
        const { question, courseId } = req.body;
        const studentId = req.user._id;

        if (!question || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Question and courseId are required",
            });
        }

        // Verify the student is enrolled in this course (either via Enrollment collection or enrolledCourses array on Student model)
        const enrolledStudent = await Student.findOne({ _id: studentId, enrolledCourses: courseId });
        const enrollment = await Enrollment.findOne({ studentId, courseId });
        if (!enrolledStudent && !enrollment) {
            return res.status(403).json({
                success: false,
                message: "You must be enrolled in this course to ask a question",
            });
        }

        // Get the course to find the instructor
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        const discussion = new Discussion({
            question: question.trim(),
            courseId,
            studentId,
            instructorId: course.instructorId,
        });

        const saved = await discussion.save();

        // Populate before returning
        const populated = await Discussion.findById(saved._id)
            .populate("courseId", "title image")
            .populate("studentId", "name email")
            .populate("instructorId", "name email");

        res.status(201).json({
            success: true,
            discussion: populated,
        });
    } catch (error) {
        console.error("Error in askQuestion:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Student fetches all their questions + answers
export const getStudentDiscussions = async (req, res) => {
    try {
        const studentId = req.user._id;

        const discussions = await Discussion.find({ studentId })
            .populate("courseId", "title image")
            .populate("instructorId", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            discussions: discussions || [],
        });
    } catch (error) {
        console.error("Error in getStudentDiscussions:", error);
        res.status(200).json({
            success: true,
            discussions: [],
        });
    }
};

// Instructor fetches all questions directed to them
export const getInstructorDiscussions = async (req, res) => {
    try {
        const instructorId = req.user._id;

        const discussions = await Discussion.find({ instructorId })
            .populate("courseId", "title image")
            .populate("studentId", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            discussions: discussions || [],
        });
    } catch (error) {
        console.error("Error in getInstructorDiscussions:", error);
        res.status(200).json({
            success: true,
            discussions: [],
        });
    }
};

// Instructor answers a question
export const answerQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { answer } = req.body;
        const instructorId = req.user._id;

        if (!answer || !answer.trim()) {
            return res.status(400).json({
                success: false,
                message: "Answer is required",
            });
        }

        const discussion = await Discussion.findById(id);

        if (!discussion) {
            return res.status(404).json({
                success: false,
                message: "Discussion not found",
            });
        }

        // Verify the instructor owns this question
        if (discussion.instructorId.toString() !== instructorId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to answer this question",
            });
        }

        discussion.answer = answer.trim();
        discussion.answeredAt = new Date();
        await discussion.save();

        const populated = await Discussion.findById(discussion._id)
            .populate("courseId", "title image")
            .populate("studentId", "name email")
            .populate("instructorId", "name email");

        res.status(200).json({
            success: true,
            discussion: populated,
        });
    } catch (error) {
        console.error("Error in answerQuestion:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
