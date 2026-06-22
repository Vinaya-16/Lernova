import Review from "../models/Review.js";
import Course from "../models/coursesModel.js";
import Enrollment from "../models/Enrollment.js";
import Student from "../models/Student.js";

// Student adds or updates a review for a course
export const addReview = async (req, res) => {
    try {
        const { courseId, rating, comment } = req.body;
        const studentId = req.user._id;

        if (!courseId || rating === undefined || !comment) {
            return res.status(400).json({
                success: false,
                message: "courseId, rating, and comment are required",
            });
        }

        const ratingNum = Number(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be a number between 1 and 5",
            });
        }

        // Verify enrollment: check Student document enrolledCourses or Enrollment collection
        const enrolledStudent = await Student.findOne({ _id: studentId, enrolledCourses: courseId });
        const enrollment = await Enrollment.findOne({ studentId, courseId });
        if (!enrolledStudent && !enrollment) {
            return res.status(403).json({
                success: false,
                message: "You must be enrolled in this course to leave a review",
            });
        }

        // Check if review already exists to update it (upsert)
        let review = await Review.findOne({ studentId, courseId });
        if (review) {
            review.rating = ratingNum;
            review.comment = comment.trim();
            await review.save();
        } else {
            review = new Review({
                studentId,
                courseId,
                rating: ratingNum,
                comment: comment.trim(),
            });
            await review.save();
        }

        // Recalculate course average rating
        const reviews = await Review.find({ courseId });
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = reviews.length > 0 ? parseFloat((totalRating / reviews.length).toFixed(1)) : 0;
        await Course.findByIdAndUpdate(courseId, { ratings: avgRating });

        const populated = await Review.findById(review._id)
            .populate("studentId", "name email")
            .populate("courseId", "title image");

        res.status(200).json({
            success: true,
            review: populated,
            avgRating,
        });
    } catch (error) {
        console.error("Error in addReview:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all reviews in the system
export const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate("studentId", "name email")
            .populate("courseId", "title image")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            reviews: reviews || [],
        });
    } catch (error) {
        console.error("Error in getReviews:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Instructor gets reviews for their courses
export const getInstructorReviews = async (req, res) => {
    try {
        const instructorId = req.user._id;

        // Find all courses taught by this instructor
        const courses = await Course.find({ instructorId }).select("_id");
        if (courses.length === 0) {
            return res.status(200).json({
                success: true,
                reviews: [],
            });
        }

        const courseIds = courses.map((c) => c._id);

        const reviews = await Review.find({ courseId: { $in: courseIds } })
            .populate("studentId", "name email")
            .populate("courseId", "title image")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            reviews: reviews || [],
        });
    } catch (error) {
        console.error("Error in getInstructorReviews:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
