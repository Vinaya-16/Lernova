import Assignment from "../models/AssignmentModel.js";
import Student from "../models/Student.js";

export const createAssignment = async (req, res) => {
    try {
        const {
            title,
            description,
            courseId,
            dueDate,
            maxMarks,
        } = req.body;

        const assignment = await Assignment.create({
            title,
            description,
            courseId,
            dueDate,
            maxMarks,
            instructorId: req.user.id,
        });

        res.status(201).json({
            success: true,
            assignment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMyAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({
            instructorId: req.user.id,
        }).populate("courseId", "title");

        res.status(200).json({
            success: true,
            assignments,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getStudentAssignments = async (req, res) => {
    try {
        const studentId = req.user.id;
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        const enrolledCourseIds = student.enrolledCourses || [];

        const assignments = await Assignment.find({
            courseId: { $in: enrolledCourseIds },
        }).populate("courseId", "title");

        res.status(200).json({
            success: true,
            assignments,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateAssignment = async (req, res) => {
    try {
        const assignment =
            await Assignment.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }

        res.status(200).json({
            success: true,
            assignment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteAssignment = async (req, res) => {
    try {
        const assignment =
            await Assignment.findByIdAndDelete(
                req.params.id
            );

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Assignment deleted",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

import Submission from "../models/SubmissionModel.js";

export const getAssignmentSubmissions = async (
    req,
    res
) => {
    try {
        const submissions =
            await Submission.find({
                assignmentId: req.params.id,
            }).populate(
                "studentId",
                "name email"
            );

        res.status(200).json({
            success: true,
            submissions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};