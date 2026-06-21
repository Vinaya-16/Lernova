import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
    createAnnouncement,
    getAnnouncements,
    deleteAnnouncement,
    getCourseAnnouncements
} from "../controllers/announcementController.js";

const router = express.Router();

router.get("/", protect, getAnnouncements);

router.post(
    "/",
    protect,
    createAnnouncement
);

router.delete(
    "/:id",
    protect,
    deleteAnnouncement
);

router.get(
    "/course/:courseId",
    protect,
    getCourseAnnouncements
);

export default router;