// controllers/studentController.js
import Student from "../models/Student.js";
import Course from "../models/coursesModel.js";
import Enrollment from "../models/Enrollment.js";

// Get student's progress for a specific course
// controllers/studentController.js - Fix getCourseProgress

// Get student's progress for a specific course
export const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user._id;

        console.log('📚 Getting progress for course:', courseId, 'student:', studentId);

        const enrollment = await Enrollment.findOne({
            studentId: studentId,
            courseId: courseId
        });

        if (!enrollment) {
            return res.status(200).json({
                success: true,
                enrollment: {
                    progress: 0,
                    completedVideos: [],
                    totalVideos: 0,
                    totalWatchTime: 0,
                    lastActivity: null,
                    completedAt: null,
                    status: 'Not Started'
                }
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Convert completedVideos to strings for comparison
        const completedVideoIds = (enrollment.completedVideos || []).map(id => id.toString());

        res.status(200).json({
            success: true,
            enrollment: {
                progress: enrollment.progress || 0,
                completedVideos: completedVideoIds,
                totalVideos: course.videos?.length || 0,
                totalWatchTime: enrollment.totalWatchTime || 0,
                lastActivity: enrollment.lastActivity,
                completedAt: enrollment.completedAt,
                status: enrollment.progress === 100 ? 'Completed' :
                    enrollment.progress > 0 ? 'In Progress' : 'Not Started'
            }
        });
    } catch (error) {
        console.error('❌ Error getting course progress:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all students with their progress for a specific instructor
export const getStudentsProgress = async (req, res) => {
    try {
        const instructorId = req.user._id;
        console.log('📊 Instructor ID:', instructorId);

        // Get all courses taught by this instructor
        const instructorCourses = await Course.find({
            instructorId: instructorId
        }).select('_id title');

        console.log('📚 Courses found:', instructorCourses.length);

        if (instructorCourses.length === 0) {
            return res.status(200).json({
                success: true,
                students: [],
                totalStudents: 0,
                message: "No courses found for this instructor"
            });
        }

        const courseIds = instructorCourses.map(c => c._id);

        // Get all enrollments for these courses
        const enrollments = await Enrollment.find({
            courseId: { $in: courseIds }
        }).populate('studentId', 'name email');

        console.log('👨‍🎓 Enrollments found:', enrollments.length);

        if (enrollments.length === 0) {
            return res.status(200).json({
                success: true,
                students: [],
                totalStudents: 0,
                message: "No students enrolled in your courses"
            });
        }

        // --- FIX: Group by UNIQUE student ---
        const studentMap = {};
        enrollments.forEach(enrollment => {

            // Skip orphaned enrollments (student was deleted but enrollment remains)
            if (!enrollment.studentId) return;


         

            const studentId = enrollment.studentId._id.toString();
            if (!studentMap[studentId]) {
                studentMap[studentId] = {
                    id: studentId,
                    name: enrollment.studentId.name || 'Unknown',
                    email: enrollment.studentId.email || 'No email',
                    coursesEnrolled: 0,
                    totalProgress: 0,
                    completedCourses: 0,
                    totalWatchTime: 0,
                    lastActivity: null,
                    enrolledCourses: []
                };
            }
            
            // Increment course count
            studentMap[studentId].coursesEnrolled++;
            
            // Add progress from this enrollment
            const progress = enrollment.progress || 0;
            studentMap[studentId].totalProgress += progress;
            
            // Check if course is completed
            if (progress === 100) {
                studentMap[studentId].completedCourses++;
            }
            
            // Add watch time
            studentMap[studentId].totalWatchTime += enrollment.totalWatchTime || 0;
            
            // Track last activity
            if (enrollment.lastActivity) {
                if (!studentMap[studentId].lastActivity || 
                    enrollment.lastActivity > studentMap[studentId].lastActivity) {
                    studentMap[studentId].lastActivity = enrollment.lastActivity;
                }
            }
            
            // Store enrolled course info
            studentMap[studentId].enrolledCourses.push({
                courseId: enrollment.courseId,
                progress: progress,
                lastActivity: enrollment.lastActivity
            });
        });

        // Calculate average progress for each student
        const students = Object.values(studentMap).map(student => {
            const avgProgress = student.coursesEnrolled > 0
                ? Math.round(student.totalProgress / student.coursesEnrolled)
                : 0;
            
            let status = 'Not Started';
            if (avgProgress === 100) {
                status = 'Completed';
            } else if (avgProgress > 0) {
                status = 'In Progress';
            }
            
            // Check if student is active (recent activity within 30 days)
            if (student.lastActivity) {
                const daysSinceLastActivity = Math.floor(
                    (Date.now() - new Date(student.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
                );
                if (daysSinceLastActivity > 30 && status !== 'Completed') {
                    status = 'Inactive';
                }
            }

            return {
                id: student.id,
                name: student.name,
                email: student.email,
                coursesEnrolled: student.coursesEnrolled,
                progress: avgProgress,
                status: status,
                completedCourses: student.completedCourses,
                totalWatchTime: student.totalWatchTime,
                lastActivity: student.lastActivity,
                enrolledCourses: student.enrolledCourses
            };
        });

        // Sort by progress (highest first)
        students.sort((a, b) => b.progress - a.progress);

        console.log('👨‍🎓 Unique students found:', students.length);

        res.status(200).json({
            success: true,
            students: students,
            totalStudents: students.length,
            instructorCourses: instructorCourses.map(c => ({
                id: c._id,
                title: c.title
            }))
        });
    } catch (error) {
        console.error('❌ Error fetching students progress:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get detailed progress for a specific student
export const getStudentDetailedProgress = async (req, res) => {
    try {
        const { studentId } = req.params;
        const instructorId = req.user._id;

        const student = await Student.findById(studentId).select('name email');
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const instructorCourses = await Course.find({
            instructorId: instructorId
        }).select('_id title category complexity videos');

        const courseIds = instructorCourses.map(c => c._id);

        const enrollments = await Enrollment.find({
            studentId: studentId,
            courseId: { $in: courseIds }
        });

        if (enrollments.length === 0) {
            return res.status(200).json({
                success: true,
                student: {
                    id: student._id,
                    name: student.name,
                    email: student.email,
                    coursesEnrolled: 0,
                    completedCourses: 0,
                    progress: 0,
                    totalWatchTime: 0,
                    status: 'Not Enrolled',
                    courseProgress: []
                }
            });
        }

        // Build course progress
        const courseProgress = enrollments.map(enrollment => {
            const course = instructorCourses.find(c =>
                c._id.toString() === enrollment.courseId.toString()
            );

            return {
                courseId: enrollment.courseId,
                title: course?.title || 'Unknown Course',
                category: course?.category || 'General',
                complexity: course?.complexity || 'Beginner',
                progress: enrollment.progress || 0,
                completedVideos: enrollment.completedVideos?.length || 0,
                totalVideos: course?.videos?.length || 0,
                totalWatchTime: enrollment.totalWatchTime || 0,
                lastActivity: enrollment.lastActivity,
                status: enrollment.progress === 100 ? 'Completed' :
                    enrollment.progress > 0 ? 'In Progress' : 'Not Started'
            };
        });

        const totalCourses = enrollments.length;
        const completedCourses = enrollments.filter(e => e.progress === 100).length;
        const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
        const avgProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;
        const totalWatchTime = enrollments.reduce((sum, e) => sum + (e.totalWatchTime || 0), 0);

        res.status(200).json({
            success: true,
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                coursesEnrolled: totalCourses,
                completedCourses: completedCourses,
                progress: avgProgress,
                totalWatchTime: totalWatchTime,
                status: avgProgress === 100 ? 'Completed' :
                    avgProgress > 0 ? 'In Progress' : 'Not Started',
                courseProgress: courseProgress
            }
        });
    } catch (error) {
        console.error('❌ Error fetching student details:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update video progress
export const updateVideoProgress = async (req, res) => {
    try {
        const { courseId, videoId, watchTime, videoDuration, isComplete } = req.body;
        const studentId = req.user._id;

        console.log('📝 Updating progress:', { studentId, courseId, videoId, watchTime, videoDuration, isComplete });

        let enrollment = await Enrollment.findOne({
            studentId: studentId,
            courseId: courseId
        });

        if (!enrollment) {
            console.log('❌ No enrollment found, creating one...');
            enrollment = new Enrollment({
                studentId: studentId,
                courseId: courseId,
                price: 0,
                paymentStatus: "free",
                progress: 0,
                completedVideos: [],
                totalWatchTime: 0,
                videoProgress: new Map(),
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Update watch time
        enrollment.totalWatchTime = (enrollment.totalWatchTime || 0) + (watchTime || 0);

        // Update video progress
        if (videoId) {
            const videoProgressMap = enrollment.videoProgress || new Map();
            const watchedPercent = Math.min(Math.round((watchTime / videoDuration) * 100), 100);
            videoProgressMap.set(videoId.toString(), watchedPercent);
            enrollment.videoProgress = videoProgressMap;
            
            // Mark as completed if 90%+ watched OR isComplete flag is true
            const isVideoComplete = isComplete || watchedPercent >= 90;
            if (isVideoComplete) {
                const videoIdStr = videoId.toString();
                // Check if video is already completed
                const alreadyCompleted = (enrollment.completedVideos || []).some(
                    id => id.toString() === videoIdStr
                );
                if (!alreadyCompleted) {
                    enrollment.completedVideos.push(videoId);
                    console.log('✅ Video marked as completed:', videoIdStr);
                }
            }
            
            enrollment.lastWatchedVideo = videoId;
        }

        // Calculate overall progress
        const totalVideos = course.videos.length;
        const completedCount = (enrollment.completedVideos || []).length;
        const newProgress = totalVideos > 0 
            ? Math.round((completedCount / totalVideos) * 100) 
            : 0;
        
        enrollment.progress = Math.min(newProgress, 100);
        enrollment.lastActivity = new Date();
        
        if (enrollment.progress === 100) {
            enrollment.completedAt = new Date();
        }
        
        await enrollment.save();

        console.log('✅ Progress updated:', enrollment.progress, '% for student:', studentId);
        console.log('✅ Completed videos:', (enrollment.completedVideos || []).length, 'of', totalVideos);

        res.status(200).json({
            success: true,
            progress: enrollment.progress,
            completedVideos: (enrollment.completedVideos || []).map(id => id.toString()),
            totalVideos: totalVideos,
            totalWatchTime: enrollment.totalWatchTime,
            completed: enrollment.progress === 100,
            lastWatchedVideo: enrollment.lastWatchedVideo,
        });
    } catch (error) {
        console.error('❌ Error updating video progress:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};