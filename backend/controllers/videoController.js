import cloudinary from "../config/cloudinary.js";
import Course from "../models/coursesModel.js";
// Upload a video
export const uploadCourseVideo = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // make sure the instructor owns this course
        if (course.instructorId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const newVideo = {
            title:    req.body.title || req.file.originalname,
            url:      req.file.path,        // Cloudinary hosted URL
            publicId: req.file.filename,    // needed for deletion later
            duration: req.body.duration || "",
            order:    course.videos.length, // appended at the end
        };

        course.videos.push(newVideo);
        await course.save();

        res.status(201).json({ message: "Video uploaded successfully", video: newVideo });
    } catch (error) {
        console.error("Video upload error:", error);
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
};

// Get all videos for a course
export const getCourseVideos = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId).select("videos");

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json({ videos: course.videos });
    } catch (error) {
        console.error("Get videos error:", error);
        res.status(500).json({ message: "Failed to fetch videos", error: error.message });
    }
};

// Delete a video
export const deleteCourseVideo = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // make sure the instructor owns this course
        if (course.instructorId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const video = course.videos.id(req.params.videoId);

        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        // delete from Cloudinary first
        if (video.publicId) {
            await cloudinary.uploader.destroy(video.publicId, { resource_type: "video" });
        }

        video.deleteOne();
        await course.save();

        res.status(200).json({ message: "Video deleted successfully" });
    } catch (error) {
        console.error("Delete video error:", error);
        res.status(500).json({ message: "Delete failed", error: error.message });
    }
};