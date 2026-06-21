import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
{
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
    },
    submissionText: String,
    fileUrl: String,
    marks: Number,
    feedback: String,
    status: {
        type: String,
        enum: [
            "pending",
            "submitted",
            "graded",
        ],
        default: "submitted",
    },
},
{
    timestamps: true,
}
);

export default mongoose.model(
    "Submission",
    submissionSchema
);