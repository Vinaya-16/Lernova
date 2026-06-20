import Instructor from "../models/Instructor.js";
import Course from "../models/coursesModel.js";

export const getAllInstructors = async (req, res) => {
    try {
        const instructors = await Instructor.find().select("-password");

        const data = await Promise.all(
            instructors.map(async (instructor) => {
                const coursesCount = await Course.countDocuments({
                    instructorID: instructor._id,
                });

                return {
                    ...instructor.toObject(),
                    courses: coursesCount,
                    students: 0,
                    status: instructor.status,
                };
            })
        );

        res.status(200).json({
            success: true,
            instructors: data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateInstructorStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const instructor = await Instructor.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: "Instructor not found",
            });
        }

        res.status(200).json({
            success: true,
            instructor,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};