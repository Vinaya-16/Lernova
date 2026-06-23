import express from "express";
import {
  generateCertificateHandler,
  getCertificateHandler,
  getCertificatesByStudentHandler,
} from "../controllers/certificateController.js";
import { validateGenerateCertificateInput } from "../middleware/validateCertificateInput.js";

const router = express.Router();

// POST /api/certificates/generate
router.post("/generate", validateGenerateCertificateInput, generateCertificateHandler);

// GET /api/certificates/student/:studentId — must come before the :certificateId route below
router.get("/student/:studentId", getCertificatesByStudentHandler);

// GET /api/certificates/:certificateId
router.get("/:certificateId", getCertificateHandler);

export default router;