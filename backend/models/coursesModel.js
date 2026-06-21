import mongoose from "mongoose";

// ADD THIS - video sub-schema
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
            type: String,   // Cloudinary public ID — needed to delete the video from Cloudinary
            default: "",
        },

        duration: {
            type: String,
            default: "",
        },

        order: {
            type: Number,   // controls the display order of videos in the course
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
                "Personal Development"
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

        // ADD THIS - videos array
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