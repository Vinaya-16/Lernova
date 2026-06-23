import Student from "../models/Student.js";
import Instructor from "../models/Instructor.js";
import Course from "../models/coursesModel.js";
import Enrollment from "../models/Enrollment.js";
import Review from "../models/Review.js";

// GET /api/admin/dashboard  (public — no Admin model yet)
export const getDashboardStats = async (req, res) => {
  try {
    // ── 1. Total Users (students + instructors) ───────────────────────────
    const [studentCount, instructorCount] = await Promise.all([
      Student.countDocuments(),
      Instructor.countDocuments(),
    ]);
    const totalUsers = studentCount + instructorCount;

    // ── 2. Total Courses ──────────────────────────────────────────────────
    const totalCourses = await Course.countDocuments();

    // ── 3. Active Enrollments ─────────────────────────────────────────────
    const activeEnrollments = await Enrollment.countDocuments();

    // ── 4. Completion Rate ────────────────────────────────────────────────
    const completedEnrollments = await Enrollment.countDocuments({ progress: 100 });
    const completionRate =
      activeEnrollments > 0
        ? parseFloat(((completedEnrollments / activeEnrollments) * 100).toFixed(1))
        : 0;

    // ── 5. Monthly Growth (new enrollments over last 6 months) ────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRaw = await Enrollment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Build a full 6-month array (fill 0 for months with no enrollments)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyGrowth = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1-indexed
      const found = monthlyRaw.find(
        (r) => r._id.year === year && r._id.month === month
      );
      monthlyGrowth.push({
        month: monthNames[month - 1],
        users: found ? found.count : 0,
      });
    }

    // ── 6. Top 3 Instructors by Average Rating ────────────────────────────
    /*
      Pipeline:
        reviews  →  group by courseId (avg rating per course)
                 →  lookup courses (get instructorId & studentsEnrolled)
                 →  group by instructorId (avg of course ratings + total students)
                 →  lookup instructors (get name)
                 →  sort desc → limit 3
    */
    const topInstructors = await Review.aggregate([
      // Step 1: average rating per course
      {
        $group: {
          _id: "$courseId",
          avgCourseRating: { $avg: "$rating" },
        },
      },
      // Step 2: join with courses to get instructorId & studentsEnrolled
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      // Step 3: group by instructor
      {
        $group: {
          _id: "$course.instructorId",
          avgRating: { $avg: "$avgCourseRating" },
          totalStudents: { $sum: "$course.studentsEnrolled" },
        },
      },
      // Step 4: join with instructors to get name
      {
        $lookup: {
          from: "instructors",
          localField: "_id",
          foreignField: "_id",
          as: "instructor",
        },
      },
      { $unwind: "$instructor" },
      // Step 5: project clean shape
      {
        $project: {
          _id: 0,
          name: "$instructor.name",
          rating: { $round: ["$avgRating", 1] },
          students: "$totalStudents",
        },
      },
      // Step 6: sort by rating desc, take top 3
      { $sort: { rating: -1 } },
      { $limit: 3 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        activeEnrollments,
        completionRate,
        monthlyGrowth,
        topInstructors,
      },
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
