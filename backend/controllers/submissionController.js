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

export const submitAssignment = async (
    req,
    res
) => {
    try {
        const {
            assignmentId,
            submissionText,
            fileUrl,
        } = req.body;

        const submission =
            await Submission.create({
                assignmentId,
                studentId: req.user.id,
                submissionText,
                fileUrl,
                status: "submitted",
            });

        res.status(201).json({
            success: true,
            submission,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMySubmissions = async (
    req,
    res
) => {
    try {
        const submissions =
            await Submission.find({
                studentId: req.user.id,
            }).populate(
                "assignmentId",
                "title"
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

export const gradeSubmission = async (
    req,
    res
) => {
    try {
        const {
            marks,
            feedback,
        } = req.body;

        const submission =
            await Submission.findByIdAndUpdate(
                req.params.id,
                {
                    marks,
                    feedback,
                    status: "graded",
                },
                {
                    new: true,
                }
            );

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Submission not found",
            });
        }

        res.status(200).json({
            success: true,
            submission,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};