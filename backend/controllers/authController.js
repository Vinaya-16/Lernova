import jwt from "jsonwebtoken";
import Instructor from "../models/Instructor.js";
import Student from "../models/Student.js";

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new instructor or student
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // Check if user already exists in either collection
    const instructorExists = await Instructor.findOne({ email });
    const studentExists = await Student.findOne({ email });
    if (instructorExists || studentExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    if (role === "student") {
      // Create the student
      const student = await Student.create({
        name,
        email,
        password,
      });

      if (student) {
        return res.status(201).json({
          token: generateToken(student._id),
          user: {
            id: student._id,
            name: student.name,
            email: student.email,
          },
          role: student.role,
        });
      } else {
        return res.status(400).json({ message: "Invalid student data" });
      }
    } else {
      // Create the instructor
      const instructor = await Instructor.create({
        name,
        email,
        password,
      });

      if (instructor) {
        return res.status(201).json({
          token: generateToken(instructor._id),
          user: {
            id: instructor._id,
            name: instructor.name,
            email: instructor.email,
          },
          role: instructor.role,
        });
      } else {
        return res.status(400).json({ message: "Invalid instructor data" });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server Error" });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    // 1. Check Instructor collection
    const instructor = await Instructor.findOne({ email });
    if (instructor) {
      if (await instructor.matchPassword(password)) {
        return res.json({
          token: generateToken(instructor._id),
          user: {
            id: instructor._id,
            name: instructor.name,
            email: instructor.email,
          },
          role: instructor.role,
        });
      } else {
        return res.status(401).json({ message: "Invalid email or password" });
      }
    }

    // 2. Check Student collection (Note: this collection also includes custom roles like 'admin')
    const student = await Student.findOne({ email });
    if (student) {
      if (await student.matchPassword(password)) {
        return res.json({
          token: generateToken(student._id),
          user: {
            id: student._id,
            name: student.name,
            email: student.email,
          },
          role: student.role,
        });
      } else {
        return res.status(401).json({ message: "Invalid email or password" });
      }
    }

    // If not found in either
    return res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server Error" });
  }
};
