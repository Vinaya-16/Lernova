import coursesModel from "../models/coursesModel.js";
import Student from "../models/Student.js";
import Enrollment from "../models/Enrollment.js";


export const createCourse = async (req, res) => {
    try {
        const courseData = {
            ...req.body,
            instructorId: req.user.id,
            status: "pending",
            complexity: "Beginner",
        };

        const course = await coursesModel.create(courseData);

        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        console.error("Error on creating course", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getMyCourse = async (req, res) => {
    try {
        const course = await coursesModel.find({ instructorId: req.user.id });

        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        console.error("error on getting my courses");
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const course = await coursesModel.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "No such course to update"
            });
        }

        if (course.instructorId && course.instructorId.toString() != req.user.id.toString()) {
            console.log("Permission Denied");
            console.log("Unauthorized Updation Detected !!");
            return res.status(201).json({
                success: false,
                message: "You can Update only your courses",
            });
        }

        const updateCourse = await coursesModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(201).json({
            success: true,
            updateCourse,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const course = await coursesModel.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "No such course to delete"
            });
        }

        if (course.instructorId && course.instructorId.toString() != req.user.id.toString()) {
            console.log("Permission Denied");
            console.log("Unauthorized Updation Detected !!");
            return res.status(403).json({
                success: false,
                message: "You can Delete only your courses",
            });
        }

        await coursesModel.findByIdAndDelete(req.params.id);

        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Students Panel
export const getCourses = async (req, res) => {
    try {
        const course = await coursesModel.find({ status: "approved" });

        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        console.error("Not Getting approved courses");
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Admin panel
export const getAllCourses = async (req, res) => {
    try {
        const courses = await coursesModel.find();

        res.status(200).json({
            success: true,
            course: courses,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateCourseStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const course = await coursesModel.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        res.status(200).json({
            success: true,
            course,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ── Enrollment ────────────────────────────────────────────────────────────────

// POST /api/courses/:id/enroll
// Enrolls the logged-in student into a course
export const enrollCourse = async (req, res) => {
    try {
        const course = await coursesModel.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        const price = course.price || 0;
        const isPaid = price > 0;

        // Check if student is already enrolled (via Enrollment collection)
        const existingEnrollment = await Enrollment.findOne({
            studentId: req.user.id,
            courseId: course._id,
        });

        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: "You are already enrolled in this course",
            });
        }

        let enrollmentData = {
            studentId: req.user.id,
            courseId: course._id,
            price,
            paymentStatus: isPaid ? "paid" : "free",
        };

        if (isPaid) {
            const {
                fullName,
                email,
                phoneNumber,
                address,
                city,
                state,
                zipCode,
                paymentMethod,
                cardholderName,
                transactionId,
            } = req.body;

            // Simple validation of required fields
            if (!fullName || !email || !phoneNumber || !address || !city || !state || !zipCode || !paymentMethod) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide all required billing and payment fields.",
                });
            }

            enrollmentData = {
                ...enrollmentData,
                fullName,
                email,
                phoneNumber,
                address,
                city,
                state,
                zipCode,
                paymentMethod,
                cardholderName,
                transactionId: transactionId || `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
            };
        }

        // Create the enrollment document in the 'enrollment' collection
        const enrollment = await Enrollment.create(enrollmentData);

        // Prevent duplicate enrolment in the course's student list
        if (!course.enrolledStudents.includes(req.user.id)) {
            await coursesModel.findByIdAndUpdate(
                course._id,
                {
                    $addToSet: { enrolledStudents: req.user.id },
                    $inc: { studentsEnrolled: 1 },
                }
            );
        }

        // Prevent duplicate enrolment in the student's course list
        await Student.findByIdAndUpdate(
            req.user.id,
            { $addToSet: { enrolledCourses: course._id } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Enrolled successfully",
            courseId: course._id,
            enrollment,
        });
    } catch (error) {
        console.error("Enroll error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET /api/courses/enrolled
// Returns all courses the logged-in student is enrolled in
export const getEnrolledCourses = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id).populate("enrolledCourses");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        res.status(200).json({
            success: true,
            courses: student.enrolledCourses,
        });
    } catch (error) {
        console.error("Get enrolled courses error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};