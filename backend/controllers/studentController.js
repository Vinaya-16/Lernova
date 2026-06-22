import Student from "../models/Student.js";
import Course from "../models/coursesModel.js";
import Enrollment from "../models/Enrollment.js";

// Get all students with their progress for a specific instructor
export const getStudentsProgress = async (req, res) => {
    try {
        const instructorId = req.user._id;
        console.log('📊 Instructor ID:', instructorId);

        // Step 1: Get all courses taught by this instructor
        const instructorCourses = await Course.find({
            instructorId: instructorId
        }).select('_id title');

        console.log('📚 Courses found for instructor:', instructorCourses.length);

        if (instructorCourses.length === 0) {
            return res.status(200).json({
                success: true,
                students: [],
                message: "No courses found for this instructor"
            });
        }

        const courseIds = instructorCourses.map(c => c._id);
        console.log('📚 Course IDs:', courseIds);

        // Step 2: Get all enrollments for THESE SPECIFIC courses only
        const enrollments = await Enrollment.find({
            courseId: { $in: courseIds }
        }).populate('studentId', 'name email');

        console.log('👨‍🎓 Enrollments found:', enrollments.length);

        if (enrollments.length === 0) {
            return res.status(200).json({
                success: true,
                students: [],
                message: "No students enrolled in your courses"
            });
        }

        // Step 3: Group by student and calculate progress
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
                    completedCourses: 0,
                    totalWatchTime: 0,
                    lastActivity: null,
                    enrollments: [],
                };
            }
            studentMap[studentId].coursesEnrolled++;
            studentMap[studentId].totalProgress += enrollment.progress || 0;
            studentMap[studentId].totalWatchTime += enrollment.totalWatchTime || 0;
            
            if (enrollment.progress === 100) {
                studentMap[studentId].completedCourses++;
            }
            
            if (enrollment.lastActivity) {
                if (!studentMap[studentId].lastActivity || 
                    enrollment.lastActivity > studentMap[studentId].lastActivity) {
                    studentMap[studentId].lastActivity = enrollment.lastActivity;
                }
            }
            
            studentMap[studentId].enrollments.push({
                courseId: enrollment.courseId,
                progress: enrollment.progress,
                lastActivity: enrollment.lastActivity,
            });
        });

        // Step 4: Calculate average progress and determine status
        const students = Object.values(studentMap).map(student => {
            const avgProgress = student.coursesEnrolled > 0
                ? Math.round(student.totalProgress / student.coursesEnrolled)
                : 0;
            
            const avgWatchTime = student.coursesEnrolled > 0
                ? Math.round(student.totalWatchTime / student.coursesEnrolled)
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
                totalWatchTime: avgWatchTime,
                lastActivity: student.lastActivity,
                enrollments: student.enrollments,
            };
        });

        // Step 5: Sort by progress (highest first)
        students.sort((a, b) => b.progress - a.progress);

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

// Update student progress when watching a video
export const updateVideoProgress = async (req, res) => {
    try {
        const { courseId, videoId, watchTime, videoDuration } = req.body;
        const studentId = req.user._id;

        // Find enrollment
        let enrollment = await Enrollment.findOne({
            studentId: studentId,
            courseId: courseId
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "You are not enrolled in this course"
            });
        }

        // Find the course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Update watch time
        enrollment.totalWatchTime = (enrollment.totalWatchTime || 0) + watchTime;

        // Update video progress (percentage watched)
        if (videoId) {
            const videoProgressMap = enrollment.videoProgress || new Map();
            const watchedPercent = Math.min(Math.round((watchTime / videoDuration) * 100), 100);
            videoProgressMap.set(videoId.toString(), watchedPercent);
            enrollment.videoProgress = videoProgressMap;
            
            // If video is 90%+ watched, mark as completed
            if (watchedPercent >= 90) {
                if (!enrollment.completedVideos.includes(videoId)) {
                    enrollment.completedVideos.push(videoId);
                }
            }
            
            // Update last watched video
            enrollment.lastWatchedVideo = videoId;
        }

        // Calculate overall progress
        const totalVideos = course.videos.length;
        const completedCount = enrollment.completedVideos.length;
        const newProgress = totalVideos > 0 
            ? Math.round((completedCount / totalVideos) * 100) 
            : 0;
        
        enrollment.progress = Math.min(newProgress, 100);
        enrollment.lastActivity = new Date();
        
        // Check if course is completed
        if (enrollment.progress === 100) {
            enrollment.completedAt = new Date();
        }
        
        await enrollment.save();

        res.status(200).json({
            success: true,
            progress: enrollment.progress,
            completedVideos: enrollment.completedVideos.length,
            totalVideos: totalVideos,
            totalWatchTime: enrollment.totalWatchTime,
            completed: enrollment.progress === 100,
            lastWatchedVideo: enrollment.lastWatchedVideo,
        });
    } catch (error) {
        console.error('Error updating video progress:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get student's progress for a specific course
export const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user._id;

        const enrollment = await Enrollment.findOne({
            studentId: studentId,
            courseId: courseId
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "You are not enrolled in this course"
            });
        }

        const course = await Course.findById(courseId).populate('videos');
        
        // Get video progress details
        const videoProgressMap = enrollment.videoProgress || new Map();
        const videosWithProgress = course.videos.map(video => ({
            id: video._id,
            title: video.title,
            progress: videoProgressMap.get(video._id.toString()) || 0,
            completed: enrollment.completedVideos.includes(video._id),
        }));

        res.status(200).json({
            success: true,
            enrollment: {
                courseId: enrollment.courseId,
                progress: enrollment.progress,
                completedVideos: enrollment.completedVideos.length,
                totalVideos: course.videos.length,
                completedAt: enrollment.completedAt,
                lastActivity: enrollment.lastActivity,
                totalWatchTime: enrollment.totalWatchTime,
                lastWatchedVideo: enrollment.lastWatchedVideo,
                status: enrollment.progress === 100 ? 'Completed' : 
                        enrollment.progress > 0 ? 'In Progress' : 'Not Started',
                videos: videosWithProgress,
            }
        });
    } catch (error) {
        console.error('Error getting course progress:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getStudentDetailedProgress = async (req, res) => {
    try {
        const { studentId } = req.params;
        const instructorId = req.user._id;

        // Step 1: Verify student exists
        const student = await Student.findById(studentId).select('name email');
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Step 2: Get all courses taught by this instructor
        const instructorCourses = await Course.find({
            instructorId: instructorId
        }).select('_id title category');

        const courseIds = instructorCourses.map(c => c._id);

        // Step 3: Get enrollments for this student in instructor's courses
        const enrollments = await Enrollment.find({
            studentId: studentId,
            courseId: { $in: courseIds }
        }).populate('courseId', 'title category complexity');

        if (enrollments.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Student is not enrolled in any of your courses",
                student: {
                    id: student._id,
                    name: student.name,
                    email: student.email,
                    coursesEnrolled: 0,
                    progress: 0,
                    status: 'Not Enrolled'
                }
            });
        }

        // Step 4: Calculate progress
        const totalCourses = enrollments.length;
        const completedCourses = enrollments.filter(e => e.progress === 100).length;
        const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
        const avgProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;
        const totalWatchTime = enrollments.reduce((sum, e) => sum + (e.totalWatchTime || 0), 0);

        // Step 5: Get course-wise progress
        const courseProgress = enrollments.map(e => ({
            courseId: e.courseId._id,
            title: e.courseId.title,
            category: e.courseId.category,
            complexity: e.courseId.complexity,
            progress: e.progress || 0,
            completedVideos: e.completedVideos?.length || 0,
            totalVideos: e.courseId.videos?.length || 0,
            totalWatchTime: e.totalWatchTime || 0,
            lastActivity: e.lastActivity,
            status: e.progress === 100 ? 'Completed' : 'In Progress'
        }));

        res.status(200).json({
            success: true,
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                coursesEnrolled: totalCourses,
                completedCourses: completedCourses,
                progress: avgProgress,
                status: avgProgress === 100 ? 'Completed' : 'In Progress',
                totalWatchTime: totalWatchTime,
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

// Get student dashboard stats
export const getStudentDashboard = async (req, res) => {
    try {
        const studentId = req.user._id;

        // Get all enrollments for this student
        const enrollments = await Enrollment.find({
            studentId: studentId
        }).populate('courseId', 'title image category complexity');

        const totalCourses = enrollments.length;
        const completedCourses = enrollments.filter(e => e.progress === 100).length;
        const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
        const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
        const avgProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;
        const totalWatchTime = enrollments.reduce((sum, e) => sum + (e.totalWatchTime || 0), 0);

        // Get recent courses
        const recentCourses = enrollments
            .sort((a, b) => b.lastActivity - a.lastActivity)
            .slice(0, 5)
            .map(e => ({
                courseId: e.courseId._id,
                title: e.courseId.title,
                image: e.courseId.image,
                progress: e.progress,
                lastActivity: e.lastActivity,
                status: e.progress === 100 ? 'Completed' : 'In Progress'
            }));

        res.status(200).json({
            success: true,
            dashboard: {
                totalCourses,
                completedCourses,
                inProgressCourses,
                avgProgress,
                totalWatchTime,
                recentCourses,
            }
        });
    } catch (error) {
        console.error('Error getting student dashboard:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

