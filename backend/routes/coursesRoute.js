import express from "express";
import {
    createCourse,
    getCourses,
    getMyCourse,
    updateCourse,
    deleteCourse,
    updateCourseStatus,
    getAllCourses,
} from "../controllers/coursesController.js";

import {
    uploadCourseVideo,
    getCourseVideos,
    deleteCourseVideo,
} from "../controllers/videoController.js";

import { uploadVideo } from "../config/cloudinary.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/createCourse", protect, createCourse);
router.get("/course", protect, getMyCourse);
router.put("/updateCourse/:id", protect, updateCourse);
router.delete("/deleteCourse/:id", protect, deleteCourse);
router.put("/updateCourseStatus/:id", updateCourseStatus);
router.get("/allCourses", getAllCourses);
router.get("/courses", getCourses);

router.post("/:courseId/videos", protect, uploadVideo.single("video"), uploadCourseVideo);
router.get("/:courseId/videos", protect, getCourseVideos);
router.delete("/:courseId/videos/:videoId", protect, deleteCourseVideo);

export default router;