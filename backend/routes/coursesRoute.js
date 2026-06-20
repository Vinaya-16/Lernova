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
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/createCourse", protect, createCourse);
router.get("/course", protect, getMyCourse);
router.put("/updateCourse/:id", protect, updateCourse);
router.delete("/deleteCourse/:id", protect, deleteCourse);
router.put("/updateCourseStatus/:id", updateCourseStatus);
router.get("/allCourses", getAllCourses);

router.get("/courses", getCourses); 

export default router;