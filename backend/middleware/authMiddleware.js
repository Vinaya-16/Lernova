import jwt from "jsonwebtoken";
import Instructor from "../models/Instructor.js";
import Student from "../models/Student.js";

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await Instructor.findById(decoded.id).select("-password");
      if (!req.user) {
        req.user = await Student.findById(decoded.id).select("-password");
      }

      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      success: false,
      message: "Token failed",
    });
  }
};

export default protect;