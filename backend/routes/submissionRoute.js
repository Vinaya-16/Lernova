import express from "express";
import protect from "../middleware/authMiddleware.js";

import {
    submitAssignment,
    getMySubmissions,
    gradeSubmission,
} from "../controllers/submissionController.js";

const router = express.Router();

router.post(
    "/",
    protect,
    submitAssignment
);

router.get(
    "/my",
    protect,
    getMySubmissions
);

router.put(
    "/:id/grade",
    protect,
    gradeSubmission
);

export default router;