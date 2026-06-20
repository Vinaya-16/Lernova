import jwt from "jsonwebtoken";
import Instructor from "../models/Instructor.js";

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new instructor
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // Check if instructor already exists
    const instructorExists = await Instructor.findOne({ email });
    if (instructorExists) {
      return res.status(400).json({ message: "Instructor already exists with this email" });
    }

    // Create the instructor
    const instructor = await Instructor.create({
      name,
      email,
      password,
    });

    if (instructor) {
      res.status(201).json({
        token: generateToken(instructor._id),
        user: {
          id: instructor._id,
          name: instructor.name,
          email: instructor.email,
        },
        role: instructor.role,
      });
    } else {
      res.status(400).json({ message: "Invalid instructor data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// @desc    Authenticate instructor & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    // Find instructor by email
    const instructor = await Instructor.findOne({ email });

    // Validate credentials
    if (instructor && (await instructor.matchPassword(password))) {
      res.json({
        token: generateToken(instructor._id),
        user: {
          id: instructor._id,
          name: instructor.name,
          email: instructor.email,
        },
        role: instructor.role,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};
