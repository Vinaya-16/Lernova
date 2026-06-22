import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        url: {
            type: String,
            required: true,
        },

        publicId: {
            type: String,
            default: "",
        },

        duration: {
            type: String,
            default: "",
        },

        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const CourseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            enum: [
                "Web Development",
                "Mobile Development",
                "Programming",
                "Data Science",
                "Artificial Intelligence",
                "Cyber Security",
                "Cloud Computing",
                "DevOps",
                "UI/UX Design",
                "Graphic Design",
                "Digital Marketing",
                "Business",
                "Finance",
                "Photography",
                "Personal Development",
                "Marketing"
            ],
            required: true,
        },

        instructorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Instructor",
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        image: {
            type: String,
            default: "",
        },

        description: {
            type: String,
            default: ""
        },

        price: {
            type: Number,
            default: 0
        },

        studentsEnrolled: {
            type: Number,
            default: 0
        },

        // Array of student ObjectIds who have enrolled
        enrolledStudents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student",
            },
        ],

        language: {
            type: String,
            default: "English"
        },

        views: {
            type: Number,
            min: 0,
            default: 0,
        },

        ratings: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },

        complexity: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            required: true,
        },

        duration: {
            type: String,
            default: "",
        },

        videos: {
            type: [VideoSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Course", CourseSchema);