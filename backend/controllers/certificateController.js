import mongoose from "mongoose";
import Certificate from "../models/Certificate.js";
import Student from "../models/Student.js";
import Course from "../models/coursesModel.js";
import generateCertificateId from "../utils/generateCertificateId.js";

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "https://yourdomain.com";

export const generateCertificateHandler = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    const existingCertificate = await Certificate.findOne({ studentId, courseId });
    if (existingCertificate) {
      return res.status(200).json(existingCertificate);
    }

    const [student, course] = await Promise.all([
      Student.findById(studentId),
      Course.findById(courseId),
    ]);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const isEnrolled = course.enrolledStudents.some(
      (id) => id.toString() === studentId.toString()
    );

    if (!isEnrolled) {
      return res.status(400).json({ message: "Student is not enrolled in this course." });
    }

    const certificateId = await generateCertificateId();
    const verificationUrl = `${FRONTEND_BASE_URL}/verify/${certificateId}`;
    const completionDate = new Date();

    const certificate = await Certificate.create({
      studentId,
      courseId,
      studentName: student.name,
      courseName: course.title,
      completionDate,
      certificateId,
      verificationUrl,
    });

    return res.status(201).json(certificate);
  } catch (error) {
    console.error("Error generating certificate:", error);

    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Certificate already exists or ID collision occurred. Please retry." });
    }

    return res.status(500).json({ message: "Internal server error while generating certificate." });
  }
};

export const getCertificatesByStudentHandler = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "studentId is not a valid ID." });
    }

    const certificates = await Certificate.find({ studentId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(
      certificates.map((cert) => ({
        studentName: cert.studentName,
        courseName: cert.courseName,
        completionDate: cert.completionDate,
        certificateId: cert.certificateId,
        verificationUrl: cert.verificationUrl,
      }))
    );
  } catch (error) {
    console.error("Error fetching student certificates:", error);
    return res.status(500).json({ message: "Internal server error while fetching certificates." });
  }
};

export const getCertificateHandler = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId }).lean();

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found." });
    }

    return res.status(200).json({
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      completionDate: certificate.completionDate,
      certificateId: certificate.certificateId,
      verificationUrl: certificate.verificationUrl,
    });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    return res.status(500).json({ message: "Internal server error while fetching certificate." });
  }
};