import Student from "../models/Student.js";
import Course from "../models/coursesModel.js";
import Enrollment from "../models/Enrollment.js";

// Get all students with their progress for a specific instructor
export const getStudentsProgress = async (req, res) => {
    try {
        const instructorId = req.user._id;

        // Get all courses taught by this instructor
        const instructorCourses = await Course.find({
            instructorId: instructorId
        }).select('_id title');

        if (instructorCourses.length === 0) {
            return res.status(200).json({
                success: true,
                students: [],
                message: "No courses found for this instructor"
            });
        }

        const courseIds = instructorCourses.map(c => c._id);

        // Get all enrollments for these courses
        const enrollments = await Enrollment.find({
            courseId: { $in: courseIds }
        }).populate('studentId', 'name email');

        if (enrollments.length === 0) {
            return res.status(200).json({
                success: true,
                students: [],
                message: "No students enrolled in your courses"
            });
        }

        // Group by student
        const studentMap = {};
        enrollments.forEach(enrollment => {
            const studentId = enrollment.studentId._id.toString();
            if (!studentMap[studentId]) {
                studentMap[studentId] = {
                    id: studentId,
                    name: enrollment.studentId.name,
                    email: enrollment.studentId.email,
                    coursesEnrolled: 0,
                    totalProgress: 0,
                    status: 'Active'
                };
            }
            studentMap[studentId].coursesEnrolled++;
            // Since there's no progress field in enrollment, we'll use a default
            // You can add a progress field to enrollment model if needed
            studentMap[studentId].totalProgress += 50; // Default progress for demo
        });

        // Calculate average progress
        const students = Object.values(studentMap).map(student => {
            const avgProgress = student.coursesEnrolled > 0
                ? Math.round(student.totalProgress / student.coursesEnrolled)
                : 0;
            return {
                ...student,
                progress: avgProgress,
                status: avgProgress >= 80 ? 'Active' : 'In Progress'
            };
        });

        res.status(200).json({
            success: true,
            students,
            totalStudents: students.length
        });
    } catch (error) {
        console.error('Error fetching students progress:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get a single student's detailed progress
export const getStudentProgress = async (req, res) => {
    try {
        const { studentId } = req.params;
        const instructorId = req.user._id;

        // Verify student exists
        const student = await Student.findById(studentId).select('name email');
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Get all courses taught by this instructor
        const instructorCourses = await Course.find({
            instructorId: instructorId
        }).select('_id title');

        const courseIds = instructorCourses.map(c => c._id);

        // Get enrollments for this student in instructor's courses
        const enrollments = await Enrollment.find({
            studentId: studentId,
            courseId: { $in: courseIds }
        }).populate('courseId', 'title category complexity');

        const totalCourses = enrollments.length;
        const completedCourses = enrollments.filter(e => e.progress === 100).length;
        const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
        const avgProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;

        res.status(200).json({
            success: true,
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                coursesEnrolled: totalCourses,
                completedCourses: completedCourses,
                progress: avgProgress,
                status: avgProgress === 100 ? 'Completed' : avgProgress > 0 ? 'In Progress' : 'Not Started',
                enrollments: enrollments.map(e => ({
                    courseId: e.courseId._id,
                    courseTitle: e.courseId.title,
                    category: e.courseId.category,
                    complexity: e.courseId.complexity,
                    progress: e.progress || 0,
                    status: e.progress === 100 ? 'Completed' : 'In Progress'
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching student progress:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all students enrolled in a specific course
export const getCourseStudents = async (req, res) => {
    try {
        const { courseId } = req.params;
        const instructorId = req.user._id;

        // Verify course belongs to instructor
        const course = await Course.findOne({
            _id: courseId,
            instructorId: instructorId
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found or you don't have access"
            });
        }

        // Get enrollments for this course
        const enrollments = await Enrollment.find({
            courseId: courseId
        }).populate('studentId', 'name email');

        const students = enrollments.map(e => ({
            id: e.studentId._id,
            name: e.studentId.name,
            email: e.studentId.email,
            enrolledAt: e.createdAt,
            paymentStatus: e.paymentStatus
        }));

        res.status(200).json({
            success: true,
            course: {
                id: course._id,
                title: course.title
            },
            students: students,
            totalStudents: students.length
        });
    } catch (error) {
        console.error('Error fetching course students:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};