import express from "express";
import { getAllInstructors, updateInstructorStatus } from "../controllers/instructorController.js";

const router = express.Router();

router.get("/allInstructors", getAllInstructors);
router.put(
    "/updateInstructorStatus/:id",
    updateInstructorStatus
);

export default router;