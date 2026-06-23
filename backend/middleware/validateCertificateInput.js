import mongoose from "mongoose";

/**
 * Validates the request body for POST /api/certificates/generate.
 * Ensures studentId and courseId are present and are valid Mongo ObjectIds
 * before the request reaches the controller.
 */
export const validateGenerateCertificateInput = (req, res, next) => {
  const { studentId, courseId } = req.body;

  if (!studentId || !courseId) {
    return res.status(400).json({ message: "studentId and courseId are required." });
  }

  if (
    !mongoose.Types.ObjectId.isValid(studentId) ||
    !mongoose.Types.ObjectId.isValid(courseId)
  ) {
    return res.status(400).json({ message: "studentId or courseId is not a valid ID." });
  }

  return next();
};
