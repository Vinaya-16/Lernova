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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/students  — all students with enrollment count & status
// ─────────────────────────────────────────────────────────────────────────────
export const getAllStudents = async (req, res) => {
  try {
    const { search = "" } = req.query;

    // Build optional search filter
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Fetch all matching students
    const studentDocs = await Student.find(filter)
      .select("_id name email createdAt")
      .sort({ createdAt: -1 })
      .lean();

    if (studentDocs.length === 0) {
      return res.status(200).json({ success: true, students: [], total: 0 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Aggregate enrollment count + last activity per student in one query
    const studentIds = studentDocs.map((s) => s._id);
    const enrollmentStats = await Enrollment.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      {
        $group: {
          _id: "$studentId",
          count: { $sum: 1 },
          lastActivity: { $max: "$lastActivity" },
        },
      },
    ]);

    // Build a fast lookup map
    const statsMap = {};
    enrollmentStats.forEach((e) => {
      statsMap[e._id.toString()] = { count: e.count, lastActivity: e.lastActivity };
    });

    // Compose final list
    const students = studentDocs.map((s) => {
      const sid = s._id.toString();
      const stats = statsMap[sid];
      const coursesEnrolled = stats ? stats.count : 0;
      const lastActivity   = stats ? stats.lastActivity : null;

      let status = "Inactive";
      if (lastActivity && new Date(lastActivity) >= thirtyDaysAgo) {
        status = "Active";
      }

      return {
        _id: s._id,
        name: s.name,
        email: s.email,
        coursesEnrolled,
        joined: s.createdAt,
        status,
        lastActivity,
      };
    });

    res.status(200).json({ success: true, students, total: students.length });
  } catch (error) {
    console.error("Error in getAllStudents:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/students/:id  — delete student + cascade enrollments
// ─────────────────────────────────────────────────────────────────────────────
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Cascade: remove all enrollments belonging to this student
    await Enrollment.deleteMany({ studentId: id });

    // Delete the student account
    await Student.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Student "${student.name}" and all their enrollments have been deleted.`,
    });
  } catch (error) {
    console.error("Error in deleteStudent:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/enrollment-report  — per-course enrollment breakdown
// Only approved courses; revenue in USD cents (number).
// ─────────────────────────────────────────────────────────────────────────────
export const getEnrollmentReport = async (req, res) => {
  try {
    // ── 1. All approved courses with instructor name ───────────────────────
    const courses = await Course.find({ status: "approved" })
      .populate("instructorId", "name")
      .select("_id title category instructorId ratings studentsEnrolled")
      .lean();

    if (courses.length === 0) {
      return res.status(200).json({
        success: true,
        summary: { totalEnrollments: 0, paidEnrollments: 0, freeEnrollments: 0, avgCompletionRate: 0 },
        courses: [],
      });
    }

    const courseIds = courses.map((c) => c._id);

    // ── 2. Enrollment aggregation per course ──────────────────────────────
    const enrollmentStats = await Enrollment.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      {
        $group: {
          _id: "$courseId",
          totalEnrolled: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$progress", 100] }, 1, 0] },
          },
          paidCount: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] },
          },
          freeCount: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "free"] }, 1, 0] },
          },
          revenue: { $sum: "$price" },
          avgProgress: { $avg: "$progress" },
        },
      },
    ]);

    // ── 3. Average rating per course from reviews ─────────────────────────
    const reviewStats = await Review.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      {
        $group: {
          _id: "$courseId",
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    // ── 4. Build lookup maps ───────────────────────────────────────────────
    const enrollMap = {};
    enrollmentStats.forEach((e) => { enrollMap[e._id.toString()] = e; });

    const reviewMap = {};
    reviewStats.forEach((r) => { reviewMap[r._id.toString()] = r; });

    // ── 5. Compose per-course result ──────────────────────────────────────
    const courseReport = courses.map((c) => {
      const cid = c._id.toString();
      const enroll = enrollMap[cid] || { totalEnrolled: 0, completed: 0, paidCount: 0, freeCount: 0, revenue: 0, avgProgress: 0 };
      const review = reviewMap[cid] || { avgRating: 0, reviewCount: 0 };
      const completionRate = enroll.totalEnrolled > 0
        ? parseFloat(((enroll.completed / enroll.totalEnrolled) * 100).toFixed(1))
        : 0;

      return {
        _id: c._id,
        title: c.title,
        category: c.category,
        instructorName: c.instructorId?.name || "Unknown",
        totalEnrolled: enroll.totalEnrolled,
        completed: enroll.completed,
        completionRate,
        avgProgress: parseFloat((enroll.avgProgress || 0).toFixed(1)),
        avgRating: parseFloat((review.avgRating || 0).toFixed(1)),
        reviewCount: review.reviewCount,
        revenue: enroll.revenue,
      };
    });

    // Sort by most enrolled first
    courseReport.sort((a, b) => b.totalEnrolled - a.totalEnrolled);

    // ── 6. Platform-level summary ─────────────────────────────────────────
    const totalEnrollments = enrollmentStats.reduce((s, e) => s + e.totalEnrolled, 0);
    const paidEnrollments  = enrollmentStats.reduce((s, e) => s + e.paidCount, 0);
    const freeEnrollments  = enrollmentStats.reduce((s, e) => s + e.freeCount, 0);
    const totalProgress    = enrollmentStats.reduce((s, e) => s + (e.avgProgress || 0) * e.totalEnrolled, 0);
    const avgCompletionRate = totalEnrollments > 0
      ? parseFloat(((totalProgress / totalEnrollments)).toFixed(1))
      : 0;

    res.status(200).json({
      success: true,
      summary: { totalEnrollments, paidEnrollments, freeEnrollments, avgCompletionRate },
      courses: courseReport,
    });
  } catch (error) {
    console.error("Error in getEnrollmentReport:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
