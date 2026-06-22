import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
    createAnnouncement,
    getAnnouncements,
    getMyAnnouncements,
    getCourseAnnouncements,
    deleteAnnouncement
} from "../controllers/announcementController.js";

const router = express.Router();

// Student gets all announcements
router.get("/", protect, getAnnouncements);

// Instructor gets their own announcements
router.get("/my-announcements", protect, getMyAnnouncements);

// Get announcements for a specific course
router.get("/course/:courseId", protect, getCourseAnnouncements);

// Create announcement
router.post("/", protect, createAnnouncement);

// Delete announcement
router.delete("/:id", protect, deleteAnnouncement);

export default router;