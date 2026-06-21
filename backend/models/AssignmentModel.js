import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Instructor",
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    maxMarks: {
        type: Number,
        default: 100,
    },
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "published",
    },
},
{
    timestamps: true,
}
);

export default mongoose.model(
    "Assignment",
    assignmentSchema
);