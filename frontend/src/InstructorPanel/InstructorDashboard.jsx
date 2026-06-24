import { useEffect, useState } from "react";
import { assignmentService } from "../services/assignmentSubmission.js";
import axios from "axios";
import { courseService } from "../services/courseService.js"
import * as announcementService from "../services/announcementService.js";
import { quizService } from "../services/quizService.js";
import * as discussionService from "../services/discussionService.js";
import { studentService } from "../services/studentService.js";
import * as reviewService from "../services/reviewService.js";
import {
    LayoutDashboard,
    PlusCircle,
    X,
    Bell,
    BookOpen,
    Layers,
    ClipboardList,
    HelpCircle,
    Users,
    Megaphone,
    BarChart3,
    Upload,
    FileVideo,
    FileText,
    Star,
    Trash2,
    Pencil,
    ChevronLeft,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Plus,
    ChevronRight,
    ChevronDown,
    MessageSquare,
    Send,
} from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { Card, StatCard, Button, Badge, Input, ProgressBar, PageHeader, EmptyState, Avatar } from "../components/ui";
import {
    courses as allCourses,
    students,
    assignments,
    quizzes as mockQuizzes,
    reviews,
} from "../mockData/lmsData";

const navItems = [
    { id: "dashboard", label: "Instructor Dashboard", icon: LayoutDashboard },
    { id: "create", label: "Create Course", icon: PlusCircle },
    { id: "manage", label: "Manage Courses", icon: BookOpen },
    { id: "assignments", label: "Manage Assignments", icon: ClipboardList },
    { id: "quizzes", label: "Manage Quizzes", icon: HelpCircle },
    { id: "progress", label: "Student Progress", icon: Users },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "discussions", label: "Discussion Forum", icon: MessageSquare },
    { id: "reviews", label: "Course Reviews", icon: Star },
    { id: "analytics", label: "Course Analytics", icon: BarChart3 },
];

// ── Dashboard ───────────────────────────────────────────────────────────
function Dashboard() {
    const [dashboardData, setDashboardData] = useState({
        totalCourses: 0,
        totalStudents: 0,
        totalRevenue: 0,
        pendingSubmissions: 0,
        recentActivities: [],
        topCourses: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Fetch instructor's courses
            const coursesRes = await courseService.getMyCourses();
            const courses = coursesRes.course || coursesRes.courses || [];
            console.log('📚 Courses:', courses);

            if (courses.length === 0) {
                setDashboardData({
                    totalCourses: 0,
                    totalStudents: 0,
                    totalRevenue: 0,
                    pendingSubmissions: 0,
                    recentActivities: [],
                    topCourses: []
                });
                setLoading(false);
                return;
            }

            // 2. Calculate basic stats from courses
            let totalStudents = 0;
            let totalRevenue = 0;
            let recentActivities = [];
            const topCourses = [];

            courses.forEach(course => {
                const students = course.studentsEnrolled || 0;
                const revenue = students * (course.price || 0);
                
                totalStudents += students;
                totalRevenue += revenue;

                // Track courses with students
                if (students > 0) {
                    topCourses.push({
                        id: course._id,
                        title: course.title,
                        students: students,
                        revenue: revenue
                    });
                }

                // Create enrollment activity from course data
                if (course.enrolledStudents && course.enrolledStudents.length > 0) {
                    course.enrolledStudents.slice(0, 3).forEach(studentId => {
                        recentActivities.push({
                            id: `${course._id}-${studentId}`,
                            type: 'enrollment',
                            message: `Student enrolled in "${course.title}"`,
                            time: course.updatedAt || new Date().toISOString()
                        });
                    });
                }
            });

            // 3. Fetch assignments for pending submissions
            let pendingSubmissions = 0;
            try {
                const assignRes = await assignmentService.getMyAssignments();
                const assignments = assignRes?.assignments || [];
                
                for (const assignment of assignments) {
                    try {
                        const subRes = await assignmentService.getAssignmentSubmissions(assignment._id);
                        const subs = subRes?.submissions || [];
                        const pending = subs.filter(s => s.status === 'pending' || s.status === 'submitted');
                        pendingSubmissions += pending.length;
                    } catch (err) {
                        console.log('No submissions for assignment:', assignment._id);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch assignments:', err);
            }

            // 4. Fetch reviews for recent activity
            try {
                const reviewRes = await reviewService.getInstructorReviews();
                const reviews = reviewRes?.reviews || [];
                
                reviews.slice(0, 3).forEach(r => {
                    recentActivities.push({
                        id: r._id,
                        type: 'review',
                        message: `${r.studentId?.name || 'Student'} reviewed "${r.courseId?.title || 'course'}" (${r.rating}⭐)`,
                        time: r.createdAt || new Date().toISOString()
                    });
                });
            } catch (err) {
                console.log('No reviews data available');
            }

            // 5. Sort and limit recent activities
            recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time));
            recentActivities = recentActivities.slice(0, 5);

            // 6. Sort top courses by students
            topCourses.sort((a, b) => b.students - a.students);

            setDashboardData({
                totalCourses: courses.length,
                totalStudents: totalStudents,
                totalRevenue: totalRevenue,
                pendingSubmissions: pendingSubmissions,
                recentActivities: recentActivities,
                topCourses: topCourses.slice(0, 5)
            });

        } catch (error) {
            console.error('❌ Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Yesterday';
        if (diff < 7) return `${diff} days ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getActivityIcon = (type) => {
        if (type === 'enrollment') return Users;
        if (type === 'review') return Star;
        return Bell;
    };

    const getActivityColor = (type) => {
        if (type === 'enrollment') return 'bg-blue-100 text-blue-600';
        if (type === 'review') return 'bg-yellow-100 text-yellow-600';
        return 'bg-gray-100 text-gray-600';
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        </div>
                    ))}
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-8 text-center">
                <div className="text-red-500 text-4xl mb-3">⚠️</div>
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                    onClick={fetchDashboardData}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                    Try Again
                </button>
            </Card>
        );
    }

    if (dashboardData.totalCourses === 0) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={BookOpen} label="Total Courses" value="0" accent="primary" />
                    <StatCard icon={Users} label="Total Students" value="0" accent="info" />
                    <StatCard icon={Star} label="Revenue" value="$0" accent="warning" />
                    <StatCard icon={ClipboardList} label="Pending Submissions" value="0" accent="danger" />
                </div>
                <Card className="p-12 text-center">
                    <div className="flex flex-col items-center">
                        <BookOpen size={64} className="text-gray-300 mb-4" />
                        <p className="text-h3 text-text-primary">Welcome to Your Dashboard!</p>
                        <p className="text-body text-text-secondary mt-2 max-w-md">
                            Create your first course to start tracking your teaching performance.
                        </p>
                        <Button 
                            className="mt-6"
                            onClick={() => window.location.href = '/instructor/create'}
                        >
                            <PlusCircle size={16} className="mr-2" />
                            Create Course
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Row - 4 Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    icon={BookOpen} 
                    label="Total Courses" 
                    value={dashboardData.totalCourses} 
                    accent="primary" 
                />
                <StatCard 
                    icon={Users} 
                    label="Total Enrollments" 
                    value={dashboardData.totalStudents} 
                    accent="info" 
                />
                <StatCard 
                    icon={Star} 
                    label="Revenue" 
                    value={`$${dashboardData.totalRevenue.toLocaleString()}`} 
                    accent="warning" 
                />
                <StatCard 
                    icon={ClipboardList} 
                    label="Pending Submissions" 
                    value={dashboardData.pendingSubmissions} 
                    accent="danger" 
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Courses */}
                <Card>
                    <h3 className="text-h3 text-text-primary mb-4">Top Courses</h3>
                    {dashboardData.topCourses.length === 0 ? (
                        <p className="text-caption text-text-secondary text-center py-4">No students enrolled yet</p>
                    ) : (
                        <div className="space-y-3">
                            {dashboardData.topCourses.map((course, index) => (
                                <div key={course.id} className="flex items-center justify-between border-b border-border-light last:border-0 pb-2 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-primary w-6">{index + 1}</span>
                                        <div>
                                            <p className="text-sm text-text-primary font-medium">{course.title}</p>
                                            <p className="text-xs text-text-secondary">{course.students} students</p>
                                        </div>
                                    </div>
                                    <Badge tone="info" className="text-xs">${course.revenue}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Recent Activities */}
                <Card>
                    <h3 className="text-h3 text-text-primary mb-4">Recent Activities</h3>
                    {dashboardData.recentActivities.length === 0 ? (
                        <p className="text-caption text-text-secondary text-center py-4">No recent activity</p>
                    ) : (
                        <div className="space-y-3">
                            {dashboardData.recentActivities.map((activity) => {
                                const Icon = getActivityIcon(activity.type);
                                const colorClass = getActivityColor(activity.type);
                                return (
                                    <div key={activity.id} className="flex items-start gap-3 border-b border-border-light last:border-0 pb-2 last:pb-0">
                                        <div className={`p-1.5 rounded-lg ${colorClass}`}>
                                            <Icon size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-text-primary">{activity.message}</p>
                                            <p className="text-xs text-text-secondary">{formatDate(activity.time)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

// ── Create Course ────────────────────────────────────────────────────────
function CreateCourse({ onCreated }) {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Web Development");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [loading, setLoading] = useState(false);
    const [isFree, setIsFree] = useState(false);

    const [image, setImage] = useState("");
    const [language, setLanguage] = useState("English");
    const [complexity, setComplexity] = useState("Beginner");
    const [duration, setDuration] = useState("8 weeks");

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const categoryMap = [
                "Web Development",
                "Mobile Development",
                "Programming",
                "Data Science",
                "Artificial Intelligence",
                "Cyber Security",
                "Cloud Computing",
                "DevOps",
                "UI/UX Design",
                "Graphic Design",
                "Digital Marketing",
                "Business",
                "Finance",
                "Photography",
                "Personal Development",
                "Marketing"
            ];

            const courseData = {
                title, category: categoryMap[category] || category, description,
                price: isFree ? 0 : (parseFloat(price) || 0),
                image, language, complexity, duration,
            };

            const response = await courseService.createCourse(courseData);
            setTitle("");
            setCategory("Web Development");
            setDescription("");
            setPrice("");
            setImage("");
            setLanguage("English");
            setComplexity("Beginner");
            setDuration("8 weeks");

            if (onCreated) onCreated(response.course);
            alert("Course created successfully! Waiting for approval");
        } catch (error) {
            console.error("failed to create course: ", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-2xl">
            <form onSubmit={submit}>
                <Input label="Course Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Advanced React Patterns" required />
                <Input label="Category" as="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {["Web Development",
                        "Mobile Development",
                        "Programming",
                        "Data Science",
                        "Artificial Intelligence",
                        "Cyber Security",
                        "Cloud Computing",
                        "DevOps",
                        "UI/UX Design",
                        "Graphic Design",
                        "Digital Marketing",
                        "Business",
                        "Finance",
                        "Photography",
                        "Personal Development",
                        "Marketing"].map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                </Input>
                <Input label="Description" as="textarea" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will students learn?" />
                {/* <Input label="Price (USD)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="49" /> */}

                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isFree"
                            checked={isFree}
                            onChange={(e) => {
                                setIsFree(e.target.checked);
                                if (e.target.checked) {
                                    setPrice("0");
                                } else {
                                    setPrice("");
                                }
                            }}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <label htmlFor="isFree" className="text-sm font-medium text-text-primary">
                            Make this course free
                        </label>
                    </div>

                    <Input
                        label="Price (USD)"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="49"
                        disabled={isFree}
                        className={isFree ? "opacity-50 cursor-not-allowed" : ""}
                    />
                    {isFree && (
                        <p className="text-sm text-green-600 -mt-2">
                            This course will be free (price set to $0)
                        </p>
                    )}
                </div>

                <Input label="Course Thumbnail URL (Optional)" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://example.com/course-image.jpg" />
                <Input label="Language" as="select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Marathi">Marathi</option>
                </Input>
                <Input label="Complexity" as="select" value={complexity} onChange={(e) => setComplexity(e.target.value)}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </Input>
                <Input label="Duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 8 weeks" />
                <Button type="submit" full disabled={loading}>{loading ? "Creating..." : "Create Course (Draft)"}</Button>
            </form>
        </Card>
    );
}

// ── Video Uploader ───────────────────────────────────────────────────────
function VideoUploader({ courseId }) {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [videos, setVideos] = useState([]);
    const [loadingVideos, setLoadingVideos] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const data = await courseService.getVideos(courseId);
                setVideos(data.videos || []);
            } catch (err) {
                console.error("Failed to fetch videos:", err);
            } finally {
                setLoadingVideos(false);
            }
        };
        fetchVideos();
    }, [courseId]);

    const handleUpload = async () => {
        if (!file) return alert("Please select a video first");
        const formData = new FormData();
        formData.append("video", file);
        formData.append("title", title || file.name);
        try {
            setUploading(true);
            const data = await courseService.uploadVideo(courseId, formData, setProgress);
            setVideos((prev) => [...prev, data.video]);
            setFile(null); setTitle(""); setProgress(0);
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (videoId) => {
        if (!window.confirm("Delete this video?")) return;
        try {
            await courseService.deleteVideo(courseId, videoId);
            setVideos((prev) => prev.filter((v) => v._id !== videoId));
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete video.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="border-2 border-dashed border-border-light rounded-2xl p-8 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <FileVideo size={20} className="text-primary" />
                    <p className="text-body-lg text-text-primary font-medium">Upload a Video</p>
                </div>
                <Input label="Video Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lesson 1 - Introduction" />
                <div>
                    <label className="block mb-1 text-sm font-medium text-text-secondary">Select Video File (MP4, MOV)</label>
                    <input type="file" accept="video/mp4,video/quicktime" onChange={(e) => setFile(e.target.files[0])}
                        className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-active-bg file:text-primary hover:file:bg-active-bg cursor-pointer" />
                </div>
                {file && <p className="text-caption text-text-secondary">Selected: <span className="text-text-primary font-medium">{file.name}</span> ({(file.size / (1024 * 1024)).toFixed(2)} MB)</p>}
                {uploading && <div className="space-y-1"><ProgressBar value={progress} /><p className="text-caption text-text-secondary">{progress}% uploaded...</p></div>}
                <Button onClick={handleUpload} disabled={uploading || !file}>{uploading ? "Uploading..." : "Upload Video"}</Button>
            </div>
            <div className="space-y-3">
                <p className="text-h3 text-text-primary">Uploaded Videos</p>
                {loadingVideos ? (
                    <p className="text-caption text-text-secondary">Loading videos...</p>
                ) : videos.length === 0 ? (
                    <div className="text-center py-8 border border-border-light rounded-xl">
                        <FileVideo size={28} className="text-text-secondary mx-auto mb-2" />
                        <p className="text-body text-text-secondary">No videos uploaded yet.</p>
                    </div>
                ) : (
                    videos.map((v) => (
                        <div key={v._id} className="flex items-center justify-between border border-border-light rounded-xl px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-active-bg flex items-center justify-center">
                                    <FileVideo size={16} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-body text-text-primary">{v.title}</p>
                                    <a href={v.url} target="_blank" rel="noreferrer" className="text-caption text-primary underline">Preview</a>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(v._id)} className="text-red-400 hover:text-red-600 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// ── Course Editor ────────────────────────────────────────────────────────
function CourseEditor({ course, onBack }) {
    const [tab, setTab] = useState("details");
    const [title, setTitle] = useState(course.title || "");
    const [category, setCategory] = useState(course.category || "");
    const [description, setDescription] = useState(course.description || "");
    const [price, setPrice] = useState(course.price || 0);
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(course.image || "");
    const [language, setLanguage] = useState(course.language || "English");
    const [complexity, setComplexity] = useState(course.complexity || "Beginner");
    const [duration, setDuration] = useState(course.duration || "");

    const handleSave = async () => {
        try {
            setLoading(true);
            await courseService.updateCourse(course._id, { title, category, description, price, image, language, complexity, duration });
            alert("Course updated successfully");
            onBack();
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update course");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <button onClick={onBack} className="flex items-center gap-1 text-caption font-semibold text-text-secondary hover:text-primary">
                <ChevronLeft size={16} /> Back to courses
            </button>
            <Card>
                <h2 className="text-h3 text-text-primary mb-1">{course.title}</h2>
                <p className="text-caption text-text-secondary mb-4">{course.category} · {course.complexity}</p>
                <div className="flex gap-2 border-b border-border-light pb-2 mb-5 flex-wrap">
                    {[
                        { id: "details", label: "Course Details", icon: Pencil },
                        { id: "curriculum", label: "Curriculum Builder", icon: Layers },
                        { id: "videos", label: "Upload Videos", icon: FileVideo },
                        { id: "materials", label: "Study Materials", icon: FileText },
                    ].map((t) => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? "bg-active-bg text-primary" : "text-text-secondary hover:bg-active-bg"}`}>
                            <t.icon size={15} /> {t.label}
                        </button>
                    ))}
                </div>

                {tab === "details" && (
                    <div className="space-y-4">
                        <div><label className="block mb-1 font-medium">Course Title</label><input className="w-full border rounded-lg p-2" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                        <div>
                            <label className="block mb-1 font-medium">Category</label>
                            <select className="w-full border rounded-lg p-2" value={category} onChange={(e) => setCategory(e.target.value)}>
                                {["Web Development",
                                    "Mobile Development",
                                    "Programming",
                                    "Data Science",
                                    "Artificial Intelligence",
                                    "Cyber Security",
                                    "Cloud Computing",
                                    "DevOps",
                                    "UI/UX Design",
                                    "Graphic Design",
                                    "Digital Marketing",
                                    "Business",
                                    "Finance",
                                    "Photography",
                                    "Personal Development",
                                    "Marketing"].map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div><label className="block mb-1 font-medium">Description</label><textarea rows={5} className="w-full border rounded-lg p-2" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
                        <div><label className="block mb-1 font-medium">Price</label><input type="number" className="w-full border rounded-lg p-2" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
                        <div><label className="block mb-1 font-medium">Course Thumbnail URL</label><input type="text" className="w-full border rounded-lg p-2" value={image} onChange={(e) => setImage(e.target.value)} /></div>
                        <div>
                            <label className="block mb-1 font-medium">Language</label>
                            <select className="w-full border rounded-lg p-2" value={language} onChange={(e) => setLanguage(e.target.value)}>
                                {["English", "Hindi", "Marathi"].map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Complexity</label>
                            <select className="w-full border rounded-lg p-2" value={complexity} onChange={(e) => setComplexity(e.target.value)}>
                                {["Beginner", "Intermediate", "Advanced"].map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div><label className="block mb-1 font-medium">Duration</label><input type="text" className="w-full border rounded-lg p-2" value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
                        <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
                    </div>
                )}

                {tab === "curriculum" && (
                    <div className="space-y-3">
                        {(course.modules || []).map((m) => (
                            <div key={m.id} className="border border-border-light rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-body-lg text-text-primary">{m.title}</p>
                                    <div className="flex items-center gap-2 text-text-secondary">
                                        <button className="hover:text-primary"><Pencil size={15} /></button>
                                        <button className="hover:text-red-500"><Trash2 size={15} /></button>
                                    </div>
                                </div>
                                <ul className="space-y-1.5">
                                    {m.lessons.map((l) => (
                                        <li key={l.id} className="flex items-center justify-between text-body text-text-secondary pl-2">
                                            <span>{l.title}</span><span className="text-caption">{l.duration}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        <Button variant="outline" full><PlusCircle size={16} /> Add Module</Button>
                    </div>
                )}

                {tab === "videos" && <VideoUploader courseId={course._id} />}

                {tab === "materials" && (
                    <div className="border-2 border-dashed border-border-light rounded-2xl py-12 flex flex-col items-center justify-center text-center">
                        <Upload size={28} className="text-primary mb-3" />
                        <p className="text-body-lg text-text-primary">Upload study materials</p>
                        <p className="text-caption text-text-secondary mb-4">PDF, slides, or zipped resources</p>
                        <Button variant="outline">Browse Files</Button>
                    </div>
                )}
            </Card>
        </div>
    );
}

// ── Manage Courses ───────────────────────────────────────────────────────
function ManageCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => { fetchCourses(); }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await courseService.getMyCourses();
            console.log('📚 Courses fetched:', response);
            setCourses(response.course || response.courses || []);
        } catch (error) {
            console.error("Failed to fetch courses: ", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this course? This action cannot be undone.")) return;
        
        setDeletingId(id);
        try {
            await courseService.deleteCourse(id);
            setCourses((prev) => prev.filter((course) => course._id !== id));
            alert("Course deleted successfully.");
        } catch (error) {
            console.error("Delete course failed: ", error);
            alert(error.response?.data?.message || "Failed to delete course.");
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            approved: { tone: "success", label: "Approved" },
            pending: { tone: "warning", label: "Pending" },
            rejected: { tone: "danger", label: "Rejected" },
            draft: { tone: "secondary", label: "Draft" }
        };
        const s = statusMap[status] || statusMap.draft;
        return <Badge tone={s.tone}>{s.label}</Badge>;
    };

    if (editing) {
        return <CourseEditor course={editing} onBack={() => { setEditing(null); fetchCourses(); }} />;
    }

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-4 animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-16 bg-gray-200 rounded-xl"></div>
                            <div className="flex-1">
                                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            </div>
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                            <div className="h-9 bg-gray-200 rounded w-16"></div>
                            <div className="h-9 bg-gray-200 rounded w-16"></div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <Card className="p-12 text-center">
                <div className="flex flex-col items-center">
                    <BookOpen size={64} className="text-gray-300 mb-4" />
                    <p className="text-h3 text-text-primary">No Courses Created Yet</p>
                    <p className="text-body text-text-secondary mt-2 max-w-md">
                        Create your first course to start teaching and reach students.
                    </p>
                    <Button 
                        className="mt-6"
                        onClick={() => window.location.href = '/instructor/create'}
                    >
                        <PlusCircle size={16} className="mr-2" />
                        Create Course
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-h2 text-text-primary">Manage Courses</h2>
                    <p className="text-caption text-text-secondary">{courses.length} courses total</p>
                </div>
                <Button onClick={() => window.location.href = '/instructor/create'}>
                    <PlusCircle size={16} className="mr-2" />
                    Create Course
                </Button>
            </div>

            {courses.map((c) => (
                <Card key={c._id} className="flex items-center gap-4 flex-wrap p-4 hover:shadow-md transition-shadow">
                    {/* Course Image */}
                    <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {c.image ? (
                            <img 
                                src={c.image} 
                                alt={c.title} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '';
                                    e.target.className = 'w-full h-full object-cover hidden';
                                    e.target.parentElement.innerHTML = `
                                        <div class="w-full h-full flex items-center justify-center bg-gray-100">
                                            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                            </svg>
                                        </div>
                                    `;
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <FileText size={24} className="text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 min-w-[180px]">
                        <p className="text-body-lg text-text-primary font-medium">{c.title}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-caption text-text-secondary">{c.category || 'Uncategorized'}</span>
                            <span className="text-caption text-text-secondary">•</span>
                            <span className="text-caption text-text-secondary">{c.studentsEnrolled || 0} students</span>
                            {c.price > 0 && (
                                <>
                                    <span className="text-caption text-text-secondary">•</span>
                                    <span className="text-caption text-text-primary font-medium">${c.price}</span>
                                </>
                            )}
                            {c.price === 0 && (
                                <>
                                    <span className="text-caption text-text-secondary">•</span>
                                    <span className="text-caption text-green-600 font-medium">Free</span>
                                </>
                            )}
                        </div>
                        {c.description && (
                            <p className="text-sm text-text-secondary mt-1 line-clamp-1">{c.description}</p>
                        )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(c.status)}
                        <Button 
                            variant="outline" 
                            className="h-9 px-3"
                            onClick={() => setEditing(c)}
                        >
                            <Pencil size={16} />
                        </Button>
                        <Button 
                            variant="outline" 
                            className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(c._id)}
                            disabled={deletingId === c._id}
                        >
                            {deletingId === c._id ? (
                                <span className="text-xs">Deleting...</span>
                            ) : (
                                <Trash2 size={16} />
                            )}
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    );
}

// ── Manage Assignments ──────────────────────────────────────────────────
function ManageAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showSubmissions, setShowSubmissions] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '', courseId: '', maxMarks: 100 });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);
    const [formError, setFormError] = useState(null);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [gradingData, setGradingData] = useState({});

    useEffect(() => { fetchAssignments(); fetchCourses(); }, []);

    const fetchAssignments = async () => {
        try {
            setError(null);
            const response = await assignmentService.getMyAssignments();
            let data = response?.assignments || response?.data || (Array.isArray(response) ? response : []);
            setAssignments(data);
        } catch (error) {
            console.error("Failed to fetch assignments:", error);
            setError("Failed to load assignments. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            setLoadingCourses(true);
            const response = await courseService.getMyCourses();
            let courses = response?.course || response?.courses || (Array.isArray(response) ? response : []);
            const approved = courses.filter(c => ["active", "approved", "published", true].includes(c.status || c.courseStatus || c.approvalStatus));
            setAvailableCourses(approved);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
            setAvailableCourses([]);
        } finally {
            setLoadingCourses(false);
        }
    };

    const fetchSubmissions = async (assignmentId) => {
        try {
            setLoadingSubmissions(true);
            const response = await assignmentService.getAssignmentSubmissions(assignmentId);
            setSubmissions(response?.submissions || response?.data || (Array.isArray(response) ? response : []));
            setShowSubmissions(true);
        } catch (error) {
            console.error("Failed to fetch submissions:", error);
            alert('Failed to load submissions. Please try again.');
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const handleCreateAssignment = async () => {
        if (!newAssignment.title.trim() || !newAssignment.description.trim() || !newAssignment.dueDate || !newAssignment.courseId) {
            setFormError('Please fill all required fields'); return;
        }
        setFormError(null); setCreating(true);
        try {
            const response = await assignmentService.createAssignment({
                title: newAssignment.title.trim(), description: newAssignment.description.trim(),
                courseId: newAssignment.courseId, dueDate: new Date(newAssignment.dueDate).toISOString(),
                maxMarks: parseInt(newAssignment.maxMarks) || 100,
            });
            setAssignments([response.assignment || response.data || response, ...assignments]);
            setShowCreateForm(false);
            setNewAssignment({ title: '', description: '', dueDate: '', courseId: '', maxMarks: 100 });
        } catch (error) {
            setFormError(error.response?.data?.message || 'Failed to create assignment.');
        } finally {
            setCreating(false);
        }
    };

    const handleUpdateAssignment = async () => {
        if (!newAssignment.title.trim()) { setFormError('Please enter a title'); return; }
        setFormError(null); setCreating(true);
        try {
            const response = await assignmentService.updateAssignment(editingAssignment._id, {
                title: newAssignment.title.trim(), description: newAssignment.description.trim(),
                dueDate: new Date(newAssignment.dueDate).toISOString(), maxMarks: parseInt(newAssignment.maxMarks) || 100,
            });
            const updated = response.assignment || response.data || response;
            setAssignments(assignments.map(a => a._id === updated._id ? updated : a));
            setShowCreateForm(false); setEditingAssignment(null);
            setNewAssignment({ title: '', description: '', dueDate: '', courseId: '', maxMarks: 100 });
        } catch (error) {
            setFormError('Failed to update assignment.');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteAssignment = async (id) => {
        if (!window.confirm('Delete this assignment?')) return;
        try {
            await assignmentService.deleteAssignment(id);
            setAssignments(assignments.filter(a => a._id !== id));
        } catch { alert('Failed to delete.'); }
    };

    const handleGradeSubmission = async (submissionId) => {
        const gradeData = gradingData[submissionId];
        if (!gradeData?.marks && gradeData?.marks !== 0) { alert('Please enter marks'); return; }
        try {
            const response = await assignmentService.gradeSubmission(submissionId, { marks: parseFloat(gradeData.marks), feedback: gradeData.feedback || '' });
            const graded = response.submission || response.data || response;
            setSubmissions(submissions.map(s => s._id === graded._id ? graded : s));
            setGradingData(prev => ({ ...prev, [submissionId]: undefined }));
        } catch { alert('Failed to grade submission.'); }
    };

    const getStatusBadge = (status) => {
        const tones = { graded: "success", submitted: "info", pending: "warning" };
        return <Badge tone={tones[status] || "warning"}>{status || 'Pending'}</Badge>;
    };

    const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No Due Date';

    if (loading) return <div className="flex justify-center items-center h-64"><p className="text-gray-500">Loading assignments...</p></div>;

    return (
        <div className="space-y-4">
            {error && (
                <div className="text-red-600 p-4 bg-red-50 rounded-md border border-red-200">
                    {error}<button onClick={fetchAssignments} className="ml-4 text-blue-600 underline">Retry</button>
                </div>
            )}

            {assignments.length === 0 ? (
                <Card className="p-8 text-center"><p className="text-gray-500">No assignments found. Create your first assignment!</p></Card>
            ) : (
                assignments.map((a) => (
                    <Card key={a._id} className="flex items-center justify-between flex-wrap gap-3 p-4">
                        <div className="flex-1">
                            <p className="text-body-lg text-text-primary font-medium">{a.title}</p>
                            <p className="text-caption text-text-secondary">{a.courseId?.title || "Unknown Course"} · Due {formatDate(a.dueDate)}{a.maxMarks ? ` · Max Marks: ${a.maxMarks}` : ''}</p>
                            {a.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {getStatusBadge(a.status)}
                            <Button variant="outline" className="h-9 px-3" onClick={() => { setSelectedAssignment(a); fetchSubmissions(a._id); }}>
                                <FileText size={16} className="mr-1" />Submissions
                            </Button>
                            <Button variant="outline" className="h-9 px-3" onClick={() => { setEditingAssignment(a); setNewAssignment({ title: a.title, description: a.description || '', dueDate: a.dueDate ? new Date(a.dueDate).toISOString().split('T')[0] : '', courseId: a.courseId?._id || a.courseId || '', maxMarks: a.maxMarks || 100 }); setShowCreateForm(true); }}>
                                <Pencil size={16} />
                            </Button>
                            <Button variant="outline" className="h-9 px-3 text-red-600 hover:text-red-700" onClick={() => handleDeleteAssignment(a._id)}>
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </Card>
                ))
            )}

            {!showCreateForm && (
                <Button variant="outline" onClick={() => { setEditingAssignment(null); setShowCreateForm(true); }}>
                    <PlusCircle size={16} /> Create Assignment
                </Button>
            )}

            {showCreateForm && (
                <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</h3>
                    {formError && <div className="text-red-600 p-3 bg-red-50 rounded-md mb-4 border border-red-200">{formError}</div>}
                    <div className="space-y-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Assignment Title *</label>
                            <input type="text" className="w-full p-2 border border-gray-300 rounded-md" value={newAssignment.title} onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} disabled={creating} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                            <textarea className="w-full p-2 border border-gray-300 rounded-md" rows="4" value={newAssignment.description} onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })} disabled={creating} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                            <select className="w-full p-2 border border-gray-300 rounded-md" value={newAssignment.courseId} onChange={(e) => setNewAssignment({ ...newAssignment, courseId: e.target.value })} disabled={creating || !!editingAssignment}>
                                <option value="">Select a Course</option>
                                {availableCourses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                            </select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                            <input type="date" className="w-full p-2 border border-gray-300 rounded-md" value={newAssignment.dueDate} onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} disabled={creating} min={new Date().toISOString().split('T')[0]} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Maximum Marks *</label>
                            <input type="number" className="w-full p-2 border border-gray-300 rounded-md" value={newAssignment.maxMarks} onChange={(e) => setNewAssignment({ ...newAssignment, maxMarks: parseInt(e.target.value) || 100 })} disabled={creating} min="1" max="1000" /></div>
                    </div>
                    <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
                        <Button onClick={editingAssignment ? handleUpdateAssignment : handleCreateAssignment} disabled={creating}>
                            {creating ? 'Saving...' : editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                        </Button>
                        <Button variant="outline" onClick={() => { setShowCreateForm(false); setEditingAssignment(null); setNewAssignment({ title: '', description: '', dueDate: '', courseId: '', maxMarks: 100 }); setFormError(null); }} disabled={creating}>Cancel</Button>
                    </div>
                </Card>
            )}

            {showSubmissions && selectedAssignment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={(e) => { if (e.target === e.currentTarget) { setShowSubmissions(false); setSelectedAssignment(null); setSubmissions([]); setGradingData({}); } }}>
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-xl font-semibold">Submissions for: {selectedAssignment.title}</h3>
                                <p className="text-sm text-gray-500">Max Marks: {selectedAssignment.maxMarks || 100}</p>
                            </div>
                            <Button variant="outline" onClick={() => { setShowSubmissions(false); setSelectedAssignment(null); setSubmissions([]); setGradingData({}); }}>Close</Button>
                        </div>
                        {loadingSubmissions ? <p className="text-center py-8 text-gray-500">Loading submissions...</p>
                            : submissions.length === 0 ? <p className="text-center py-8 text-gray-500">No submissions yet.</p>
                                : submissions.map((sub) => (
                                    <Card key={sub._id} className="p-4 mb-4">
                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <p className="font-medium">{sub.studentId?.name || 'Unknown'}</p>
                                                    {getStatusBadge(sub.status)}
                                                </div>
                                                {sub.submissionText && <p className="text-sm text-gray-700 mt-2 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">{sub.submissionText}</p>}
                                                {/* {sub.fileUrl && <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-2 inline-block">📎 View Attachment</a>} */}
                                            </div>
                                            {sub.status !== 'graded' ? (
                                                <div className="flex flex-col gap-2 min-w-[200px]">
                                                    <input type="number" placeholder="Enter marks" className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                                        value={gradingData[sub._id]?.marks || ''} min="0" max={selectedAssignment.maxMarks || 100}
                                                        onChange={(e) => setGradingData(prev => ({ ...prev, [sub._id]: { ...prev[sub._id], marks: e.target.value } }))} />
                                                    <textarea placeholder="Feedback (optional)" className="w-full p-2 border border-gray-300 rounded-md text-sm" rows="2"
                                                        value={gradingData[sub._id]?.feedback || ''}
                                                        onChange={(e) => setGradingData(prev => ({ ...prev, [sub._id]: { ...prev[sub._id], feedback: e.target.value } }))} />
                                                    <Button size="sm" onClick={() => handleGradeSubmission(sub._id)} disabled={!gradingData[sub._id]?.marks}>
                                                        <CheckCircle size={14} className="mr-1" />Grade
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="text-center min-w-[120px] p-3 bg-green-50 rounded-md">
                                                    <p className="text-lg font-bold text-green-600">{sub.marks}/{selectedAssignment.maxMarks || 100}</p>
                                                    <p className="text-xs text-green-600 mt-1">✓ Graded</p>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Question Builder (stable, standalone component) ──────────────────────
function QuestionBuilder({ currentQ, setCurrentQ, handleAddQuestion, setAddingQ, setFormError, blankQuestion }) {
    return (
        <div className="border border-border-light rounded-xl p-5 space-y-4 bg-app">
            <p className="text-body-lg text-text-primary font-semibold">New Question</p>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text *</label>
                <textarea rows={2} className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    value={currentQ.question}
                    onChange={e => setCurrentQ(q => ({ ...q, question: e.target.value }))}
                    placeholder="e.g. What is JSX?" />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Options (mark the correct one)</label>
                {currentQ.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <input type="radio" name="correctOption" checked={currentQ.correctAnswer === i}
                            onChange={() => setCurrentQ(q => ({ ...q, correctAnswer: i }))}
                            className="accent-primary w-4 h-4 shrink-0" />
                        <input type="text" className={`flex-1 p-2 border rounded-md text-sm ${currentQ.correctAnswer === i ? "border-primary ring-1 ring-primary" : "border-gray-300"}`}
                            placeholder={`Option ${i + 1}`}
                            value={opt}
                            onChange={e => {
                                const opts = [...currentQ.options];
                                opts[i] = e.target.value;
                                setCurrentQ(q => ({ ...q, options: opts }));
                            }} />
                        {currentQ.correctAnswer === i && (
                            <span className="text-xs text-green-600 font-semibold shrink-0">✓ Correct</span>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                    <input type="number" min="1" className="w-24 p-2 border border-gray-300 rounded-md text-sm"
                        value={currentQ.marks}
                        onChange={e => setCurrentQ(q => ({ ...q, marks: parseInt(e.target.value) || 1 }))} />
                </div>
                <div className="flex gap-2 mt-5">
                    <Button onClick={handleAddQuestion}>Add Question</Button>
                    <Button variant="outline" onClick={() => { setAddingQ(false); setCurrentQ(blankQuestion()); setFormError(""); }}>Cancel</Button>
                </div>
            </div>
        </div>
    );
}

// ── Manage Quizzes ───────────────────────────────────────────────────────
function ManageQuizzes() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);

    // Views: "list" | "create" | "edit"
    const [view, setView] = useState("list");
    const [editingQuiz, setEditingQuiz] = useState(null);

    // Quiz form state
    const [form, setForm] = useState({ title: "", description: "", courseId: "", duration: "" });
    const [questions, setQuestions] = useState([]);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    // Current question being built
    const blankQuestion = () => ({ question: "", options: ["", "", "", ""], correctAnswer: 0, marks: 1 });
    const [currentQ, setCurrentQ] = useState(blankQuestion());
    const [addingQ, setAddingQ] = useState(false);

    useEffect(() => { fetchQuizzes(); fetchCourses(); }, []);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const res = await quizService.getMyQuizzes();
            setQuizzes(res.quizzes || []);
        } catch (err) {
            console.error("Failed to fetch quizzes:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await courseService.getMyCourses();
            const list = res?.course || res?.courses || (Array.isArray(res) ? res : []);
            const approved = list.filter(c => ["approved", "active", "published"].includes(c.status));
            setCourses(approved);
        } catch (err) {
            console.error("Failed to fetch courses:", err);
        }
    };

    const openCreate = () => {
        setForm({ title: "", description: "", courseId: "", duration: "" });
        setQuestions([]);
        setCurrentQ(blankQuestion());
        setAddingQ(false);
        setFormError("");
        setEditingQuiz(null);
        setView("create");
    };

    const openEdit = (quiz) => {
        setForm({
            title: quiz.title,
            description: quiz.description || "",
            courseId: quiz.courseId?._id || quiz.courseId || "",
            duration: quiz.duration || "",
        });
        setQuestions(quiz.questions || []);
        setCurrentQ(blankQuestion());
        setAddingQ(false);
        setFormError("");
        setEditingQuiz(quiz);
        setView("edit");
    };

    // Add the current question to the list
    const handleAddQuestion = () => {
        if (!currentQ.question.trim()) { setFormError("Question text is required."); return; }
        if (currentQ.options.some(o => !o.trim())) { setFormError("All 4 options must be filled."); return; }
        setFormError("");
        setQuestions(prev => [...prev, { ...currentQ }]);
        setCurrentQ(blankQuestion());
        setAddingQ(false);
    };

    const handleRemoveQuestion = (idx) => {
        setQuestions(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSaveQuiz = async () => {
        if (!form.title.trim()) { setFormError("Title is required."); return; }
        if (!form.courseId) { setFormError("Please select a course."); return; }
        if (!form.duration || isNaN(Number(form.duration)) || Number(form.duration) < 1) {
            setFormError("Duration (minutes) must be a positive number."); return;
        }
        if (questions.length === 0) { setFormError("Add at least one question."); return; }

        setSaving(true); setFormError("");
        try {
            const payload = { ...form, duration: Number(form.duration), questions };
            const res = await quizService.createQuiz(payload);
            setQuizzes(prev => [res.quiz, ...prev]);
            setView("list");
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to save quiz.");
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async (quizId) => {
        try {
            const res = await quizService.publishQuiz(quizId);
            setQuizzes(prev => prev.map(q => q._id === quizId ? res.quiz : q));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to publish quiz.");
        }
    };

    // ── Create / Edit Form ────────────────────────────────────────────
    if (view === "create" || view === "edit") {
        return (
            <div className="space-y-6 max-w-3xl">
                <button onClick={() => setView("list")} className="flex items-center gap-1 text-caption font-semibold text-text-secondary hover:text-primary">
                    <ChevronLeft size={16} /> Back to Quizzes
                </button>
                <Card>
                    <h2 className="text-h3 text-text-primary mb-5">{view === "edit" ? "Edit Quiz" : "Create New Quiz"}</h2>
                    {formError && <div className="text-red-600 bg-red-50 border border-red-200 rounded-md p-3 mb-4 text-sm">{formError}</div>}

                    <div className="space-y-4">
                        {/* Basic Info */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input type="text" className="w-full p-2 border border-gray-300 rounded-md"
                                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. React Fundamentals Quiz" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                                <input type="number" min="1" className="w-full p-2 border border-gray-300 rounded-md"
                                    value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 30" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                            <select className="w-full p-2 border border-gray-300 rounded-md"
                                value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}
                                disabled={view === "edit"}>
                                <option value="">Select a course</option>
                                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                            </select>
                            {courses.length === 0 && <p className="text-xs text-yellow-600 mt-1">No approved courses found.</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea rows={2} className="w-full p-2 border border-gray-300 rounded-md"
                                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description..." />
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-body-lg text-text-primary font-semibold">
                                Questions <span className="text-text-secondary font-normal text-sm">({questions.length} added · {questions.reduce((s, q) => s + (q.marks || 1), 0)} total marks)</span>
                            </p>
                        </div>

                        {questions.length === 0 && !addingQ && (
                            <div className="text-center py-6 border-2 border-dashed border-border-light rounded-xl text-text-secondary text-sm">
                                No questions yet. Click "Add Question" to begin.
                            </div>
                        )}

                        <div className="space-y-3 mb-4">
                            {questions.map((q, idx) => (
                                <div key={idx} className="border border-border-light rounded-xl p-4 bg-white">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <p className="text-body text-text-primary font-medium">Q{idx + 1}. {q.question}</p>
                                            <ul className="mt-2 space-y-1">
                                                {q.options.map((opt, oi) => (
                                                    <li key={oi} className={`text-sm flex items-center gap-2 ${oi === q.correctAnswer ? "text-green-700 font-semibold" : "text-text-secondary"}`}>
                                                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 ${oi === q.correctAnswer ? "border-green-500 bg-green-50" : "border-gray-300"}`}>
                                                            {oi === q.correctAnswer ? "✓" : String.fromCharCode(65 + oi)}
                                                        </span>
                                                        {opt}
                                                    </li>
                                                ))}
                                            </ul>
                                            <p className="text-caption text-text-secondary mt-2">{q.marks} mark{q.marks !== 1 ? "s" : ""}</p>
                                        </div>
                                        <button onClick={() => handleRemoveQuestion(idx)} className="text-red-400 hover:text-red-600 shrink-0">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {addingQ ? (
                            <QuestionBuilder
                                currentQ={currentQ}
                                setCurrentQ={setCurrentQ}
                                handleAddQuestion={handleAddQuestion}
                                setAddingQ={setAddingQ}
                                setFormError={setFormError}
                                blankQuestion={blankQuestion}
                            />
                        ) : (
                            <Button variant="outline" onClick={() => { setAddingQ(true); setFormError(""); }}>
                                <Plus size={16} /> Add Question
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t border-border-light">
                        <Button onClick={handleSaveQuiz} disabled={saving}>
                            {saving ? "Saving..." : view === "edit" ? "Update Quiz" : "Save as Draft"}
                        </Button>
                        <Button variant="outline" onClick={() => setView("list")} disabled={saving}>Cancel</Button>
                    </div>
                </Card>
            </div>
        );
    }

    // ── Quiz List ──────────────────────────────────────────────────────
    if (loading) return <p className="text-body text-text-secondary">Loading quizzes...</p>;

    return (
        <div className="space-y-4">
            {quizzes.length === 0 ? (
                <Card className="text-center py-10">
                    <HelpCircle size={36} className="text-text-secondary mx-auto mb-3" />
                    <p className="text-body-lg text-text-primary mb-1">No quizzes yet</p>
                    <p className="text-caption text-text-secondary mb-4">Create your first quiz to get started.</p>
                    <Button onClick={openCreate}><PlusCircle size={16} /> Create Quiz</Button>
                </Card>
            ) : (
                <>
                    <div className="flex justify-end">
                        <Button onClick={openCreate}><PlusCircle size={16} /> Create Quiz</Button>
                    </div>
                    <div className="space-y-3">
                        {quizzes.map((q) => (
                            <Card key={q._id} className="flex items-center gap-4 flex-wrap">
                                <div className="w-11 h-11 rounded-xl bg-active-bg text-primary flex items-center justify-center shrink-0">
                                    <HelpCircle size={20} />
                                </div>
                                <div className="flex-1 min-w-[180px]">
                                    <p className="text-body-lg text-text-primary">{q.title}</p>
                                    <p className="text-caption text-text-secondary">
                                        {q.courseId?.title || "No course"} · {q.questions?.length || 0} questions · {q.duration} min · {q.totalMarks} marks
                                    </p>
                                </div>
                                <Badge tone={q.status === "published" ? "success" : "warning"}>
                                    {q.status === "published" ? "Published" : "Draft"}
                                </Badge>
                                {q.status === "draft" && (
                                    <Button className="h-9 px-4" onClick={() => handlePublish(q._id)}>
                                        Publish
                                    </Button>
                                )}
                                <Button variant="outline" className="h-9 px-4" onClick={() => openEdit(q)}>
                                    <Pencil size={15} />
                                </Button>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// ── Student Progress Tracking ────────────────────────────────────────────
function StudentProgress() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalStudents, setTotalStudents] = useState(0);
    const [instructorCourses, setInstructorCourses] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showStudentDetail, setShowStudentDetail] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        fetchStudentsProgress();
    }, []);

    const fetchStudentsProgress = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await studentService.getStudentsProgress();
            console.log('Students progress response:', response);
            
            setStudents(response.students || []);
            setTotalStudents(response.totalStudents || 0);
            setInstructorCourses(response.instructorCourses || []);
        } catch (error) {
            console.error('Error fetching students:', error);
            setError(error.response?.data?.message || 'Failed to load student progress');
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStudentClick = async (studentId) => {
        try {
            setDetailLoading(true);
            const response = await studentService.getStudentDetailedProgress(studentId);
            setSelectedStudent(response.student);
            setShowStudentDetail(true);
        } catch (error) {
            console.error('Error fetching student details:', error);
            alert(error.response?.data?.message || 'Failed to load student details');
        } finally {
            setDetailLoading(false);
        }
    };

    const closeStudentDetail = () => {
        setShowStudentDetail(false);
        setSelectedStudent(null);
    };

    if (loading) {
        return (
            <Card className="p-8 text-center">
                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                    <p className="text-gray-500">Loading student progress...</p>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-8 text-center">
                <div className="flex flex-col items-center">
                    <div className="text-red-500 text-4xl mb-3">⚠️</div>
                    <p className="text-red-500 mb-4">{error}</p>
                    <button 
                        onClick={fetchStudentsProgress}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </Card>
        );
    }

    if (students.length === 0) {
        return (
            <Card className="p-8 text-center">
                <div className="flex flex-col items-center">
                    <Users size={48} className="text-gray-300 mb-3" />
                    <p className="text-text-secondary text-lg mb-2">No students enrolled yet</p>
                    <p className="text-caption text-text-secondary max-w-md">
                        Students will appear here once they enroll in your courses. 
                        Share your courses with students to start tracking their progress.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <>
            <Card className="overflow-x-auto">
                <div className="p-4 border-b border-border-light bg-gray-50/50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h3 className="text-h3 text-text-primary flex items-center gap-2">
                                Student Progress
                                <Badge tone="info" className="ml-2">{totalStudents}</Badge>
                            </h3>
                            <p className="text-caption text-text-secondary mt-1">
                                Track student engagement and learning progress across your courses
                            </p>
                            {instructorCourses.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    <span className="text-xs text-text-secondary">Courses:</span>
                                    {instructorCourses.map((c, index) => (
                                        <span key={c.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                            {c.title}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={fetchStudentsProgress}
                            className="text-caption text-primary hover:underline flex items-center gap-1"
                            disabled={loading}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-caption text-text-secondary border-b border-border-light bg-gray-50/30">
                                <th className="py-3 px-4 font-semibold">Student</th>
                                <th className="py-3 px-4 font-semibold">Courses Enrolled</th>
                                <th className="py-3 px-4 font-semibold">Progress</th>
                                <th className="py-3 px-4 font-semibold">Status</th>
                                <th className="py-3 px-4 font-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={student.id} className={`border-b border-border-light hover:bg-gray-50/50 transition-colors ${index === students.length - 1 ? 'last:border-0' : ''}`}>
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="text-text-primary font-medium">{student.name}</p>
                                            <p className="text-caption text-text-secondary">{student.email}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-text-secondary font-medium">{student.coursesEnrolled}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3 min-w-[120px]">
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                                    style={{ width: `${student.progress || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-caption text-text-secondary font-medium min-w-[40px] text-right">
                                                {student.progress || 0}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <Badge tone={
                                            student.status === "Completed" ? "success" : 
                                            student.status === "In Progress" ? "warning" : 
                                            student.status === "Inactive" ? "danger" : "secondary"
                                        }>
                                            {student.status || 'Not Started'}
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex justify-center">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleStudentClick(student.id)}
                                                className="hover:bg-primary hover:text-white transition-colors"
                                            >
                                                <Eye size={14} className="mr-1" />
                                                View Details
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-border-light bg-gray-50/50">
                    <p className="text-caption text-text-secondary">
                        Showing {students.length} of {totalStudents} students
                    </p>
                </div>
            </Card>

            {/* Student Detail Modal */}
            {showStudentDetail && selectedStudent && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={closeStudentDetail}
                >
                    <div 
                        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-border-light p-4 flex justify-between items-center z-10 rounded-t-xl">
                            <div>
                                <h3 className="text-xl font-semibold text-text-primary">{selectedStudent.name}</h3>
                                <p className="text-sm text-text-secondary">{selectedStudent.email}</p>
                            </div>
                            <button 
                                onClick={closeStudentDetail}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {detailLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <>
                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                                            <p className="text-sm text-blue-600">Courses Enrolled</p>
                                            <p className="text-2xl font-bold text-blue-700">{selectedStudent.coursesEnrolled || 0}</p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg text-center">
                                            <p className="text-sm text-green-600">Completed</p>
                                            <p className="text-2xl font-bold text-green-700">{selectedStudent.completedCourses || 0}</p>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                                            <p className="text-sm text-purple-600">Overall Progress</p>
                                            <p className="text-2xl font-bold text-purple-700">{selectedStudent.progress || 0}%</p>
                                        </div>
                                        <div className="bg-orange-50 p-4 rounded-lg text-center">
                                            <p className="text-sm text-orange-600">Watch Time</p>
                                            <p className="text-2xl font-bold text-orange-700">
                                                {Math.floor((selectedStudent.totalWatchTime || 0) / 60)}m
                                            </p>
                                        </div>
                                    </div>

                                    {/* Course Progress */}
                                    <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                                        <BookOpen size={18} />
                                        Course Progress Details
                                    </h4>

                                    {selectedStudent.courseProgress?.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedStudent.courseProgress.map((course) => (
                                                <div key={course.courseId} className="border border-border-light rounded-lg p-4 hover:bg-gray-50/50 transition-colors">
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-text-primary">{course.title}</p>
                                                            <div className="flex flex-wrap gap-2 mt-1">
                                                                <span className="text-xs text-text-secondary">{course.category || 'General'}</span>
                                                                <span className="text-xs text-text-secondary">•</span>
                                                                <span className="text-xs text-text-secondary">{course.complexity || 'Beginner'}</span>
                                                            </div>
                                                        </div>
                                                        <Badge tone={course.status === "Completed" ? "success" : "warning"}>
                                                            {course.status || 'In Progress'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-primary rounded-full transition-all duration-500"
                                                                style={{ width: `${course.progress || 0}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm text-text-secondary font-medium min-w-[40px] text-right">
                                                            {course.progress || 0}%
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <p className="text-xs text-text-secondary">
                                                            {course.completedVideos || 0} / {course.totalVideos || 0} videos completed
                                                        </p>
                                                        <p className="text-xs text-text-secondary">
                                                            {course.totalWatchTime ? `${Math.floor(course.totalWatchTime / 60)}m watched` : 'Not started'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-text-secondary">
                                            <BookOpen size={32} className="mx-auto text-gray-300 mb-2" />
                                            <p>No course progress data available</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ── Announcements ────────────────────────────────────────────────────────
function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [error, setError] = useState(null);
    const [showCreateCourse, setShowCreateCourse] = useState(false);
    const [newCourseTitle, setNewCourseTitle] = useState("");
    const [newCourseDescription, setNewCourseDescription] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const getUser = () => {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) {
                return { role: 'student', isInstructor: false };
            }

            const user = JSON.parse(userData);
            let role = user.role || user.userType || user.accountType || user.type;

            if (!role) {
                role = localStorage.getItem('userRole') || localStorage.getItem('role');
            }

            if (!role) {
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const parts = token.split('.');
                        if (parts.length === 3) {
                            const payload = JSON.parse(atob(parts[1]));
                            role = payload.role || payload.userType || payload.isInstructor;
                            if (role) {
                                user.role = role;
                                localStorage.setItem('user', JSON.stringify(user));
                            }
                        }
                    } catch (e) {
                        console.log('Error decoding token:', e);
                    }
                }
            }

            const isInstructor = role === 'instructor' || role === 'admin' || role === 'teacher';

            return {
                ...user,
                _id: user._id || user.id || user.userId,
                id: user.id || user._id || user.userId,
                role: role || 'student',
                isInstructor: isInstructor
            };
        } catch (error) {
            console.error('Error getting user:', error);
            return { role: 'student', isInstructor: false };
        }
    };

    const currentUser = getUser();
    const isInstructor = currentUser.isInstructor;
    const [hasInstructorCourses, setHasInstructorCourses] = useState(false);

    const fetchCourses = async () => {
        try {
            setLoadingCourses(true);
            const response = await courseService.getMyCourses();

            let courseList = response?.course || response?.courses || (Array.isArray(response) ? response : []);

            if (courseList.length > 0) {
                setHasInstructorCourses(true);
                if (!currentUser.isInstructor) {
                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                    user.role = 'instructor';
                    localStorage.setItem('user', JSON.stringify(user));
                    window.location.reload();
                }
            }

            const approved = courseList.filter(c => {
                const s = c.status || c.courseStatus || c.approvalStatus || c.isApproved;
                return ["active", "approved", "published", true, "true"].includes(s) || !s;
            });
            setCourses(approved);
            if (approved.length === 0) setError('No approved courses available');
            else setError(null);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setCourses([]);
            setError('Failed to load courses');
        } finally {
            setLoadingCourses(false);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            let res;
            const isInstructor = currentUser.isInstructor || hasInstructorCourses;

            if (isInstructor) {
                res = await announcementService.getMyAnnouncements();
            } else {
                res = await announcementService.getAnnouncements();
            }

            setAnnouncements(res?.announcements || []);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            setError('Failed to load announcements');
            setAnnouncements([]);
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) {
            return;
        }

        setDeletingId(id);
        try {
            await announcementService.deleteAnnouncement(id);
            setAnnouncements(announcements.filter(a => a._id !== id));
            alert('Announcement deleted successfully!');
        } catch (error) {
            console.error('Error deleting announcement:', error);
            alert('Failed to delete announcement. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleCreateCourse = async () => {
        if (!newCourseTitle.trim()) {
            alert('Please enter a course title');
            return;
        }

        setIsLoading(true);
        try {
            await courseService.createCourse({
                title: newCourseTitle.trim(),
                description: newCourseDescription.trim() || 'No description provided'
            });

            await fetchCourses();
            setNewCourseTitle('');
            setNewCourseDescription('');
            setShowCreateCourse(false);
            alert('Course created successfully!');
        } catch (error) {
            console.error('Error creating course:', error);
            alert('Failed to create course. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAnnouncement = async () => {
        if (!selectedCourse) {
            alert("Please select a course");
            return;
        }

        if (!title.trim() || !body.trim()) {
            alert("Please fill all fields");
            return;
        }

        setIsLoading(true);
        try {
            await announcementService.createAnnouncement({
                title: title.trim(),
                body: body.trim(),
                course: selectedCourse,
            });

            setTitle("");
            setBody("");
            setSelectedCourse("");
            await fetchAnnouncements();
            alert('Announcement created successfully!');
        } catch (error) {
            console.error('Error creating announcement:', error);
            alert('Failed to create announcement. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            await Promise.all([fetchCourses(), fetchAnnouncements()]);
            setIsLoading(false);
        };
        init();
    }, []);

    if ((isLoading || loadingCourses) && announcements.length === 0 && courses.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-text-secondary">Loading...</p>
            </div>
        );
    }

    const finalIsInstructor = isInstructor || hasInstructorCourses || courses.length > 0;

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center mb-4">
                    {/* <h2 className="text-h2 text-text-primary">Announcements</h2> */}
                    <span className="text-caption text-text-secondary">
                        {announcements.length} total
                    </span>
                </div>

                {announcements.length > 0 ? (
                    announcements.map((a) => {
                        const isOwnAnnouncement = (() => {
                            let createdById = null;
                            if (a.createdBy) {
                                if (typeof a.createdBy === 'object' && a.createdBy._id) {
                                    createdById = a.createdBy._id.toString();
                                } else if (typeof a.createdBy === 'string') {
                                    createdById = a.createdBy;
                                }
                            }
                            return createdById === currentUser._id?.toString();
                        })();

                        return (
                            <Card key={a._id} className="hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Megaphone size={16} className="text-primary" />
                                            <p className="text-body-lg text-text-primary font-medium">
                                                {a.title}
                                            </p>
                                            {/* {finalIsInstructor && isOwnAnnouncement && (
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full ml-2">
                                                    You
                                                </span>
                                            )} */}
                                        </div>
                                        <p className="text-caption text-text-secondary mb-2">
                                            {a.course?.title || "General"} ·{" "}
                                            {new Date(a.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-body text-text-secondary">
                                            {a.body}
                                        </p>
                                    </div>
                                    {finalIsInstructor && isOwnAnnouncement && (
                                        <button
                                            onClick={() => handleDeleteAnnouncement(a._id)}
                                            disabled={deletingId === a._id}
                                            className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg flex-shrink-0"
                                            title="Delete announcement"
                                        >
                                            {deletingId === a._id ? (
                                                <span className="text-sm">Deleting...</span>
                                            ) : (
                                                <Trash2 size={18} />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </Card>
                        );
                    })
                ) : (
                    <Card>
                        <div className="text-center py-8">
                            <Megaphone size={48} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-text-secondary mb-2">No announcements yet</p>
                            <p className="text-caption text-text-secondary">
                                {finalIsInstructor
                                    ? 'Create your first announcement using the form on the right'
                                    : 'Check back later for announcements from your instructors'}
                            </p>
                        </div>
                    </Card>
                )}
            </div>

            <Card>
                <h3 className="text-h3 text-text-primary mb-3">New Announcement</h3>

                {!finalIsInstructor ? (
                    <div className="text-yellow-600 p-3 bg-yellow-50 rounded">
                        <p className="font-medium">Only instructors can create announcements</p>
                        <p className="text-sm mt-1">
                            Role detected: {currentUser.role}
                        </p>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="mb-4">
                        <div className="text-yellow-600 p-3 bg-yellow-50 rounded mb-3">
                            <p className="font-medium">No courses available</p>
                            <p className="text-sm mt-1">You need to create a course first.</p>
                        </div>

                        {!showCreateCourse ? (
                            <Button
                                full
                                onClick={() => setShowCreateCourse(true)}
                                variant="outline"
                            >
                                <Plus size={16} className="mr-2" />
                                Create Course
                            </Button>
                        ) : (
                            <div className="border rounded p-3 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Create New Course</h4>
                                    <button
                                        onClick={() => setShowCreateCourse(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <Input
                                    label="Course Title"
                                    value={newCourseTitle}
                                    onChange={(e) => setNewCourseTitle(e.target.value)}
                                    placeholder="Enter course title"
                                    disabled={isLoading}
                                />

                                <Input
                                    label="Description (Optional)"
                                    value={newCourseDescription}
                                    onChange={(e) => setNewCourseDescription(e.target.value)}
                                    placeholder="Enter course description"
                                    disabled={isLoading}
                                />

                                <Button
                                    full
                                    onClick={handleCreateCourse}
                                    disabled={isLoading || !newCourseTitle.trim()}
                                >
                                    {isLoading ? 'Creating...' : 'Create Course'}
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <select
                            className="w-full border border-gray-300 p-2 rounded mb-3"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="">Select Course</option>
                            {courses.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.title}
                                </option>
                            ))}
                        </select>

                        <Input
                            label="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Announcement title"
                            disabled={isLoading}
                        />

                        <Input
                            label="Message"
                            as="textarea"
                            rows={4}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Write your announcement..."
                            disabled={isLoading}
                        />

                        <Button
                            full
                            onClick={handleCreateAnnouncement}
                            disabled={isLoading || !selectedCourse || !title.trim() || !body.trim()}
                            className="mt-2"
                        >
                            {isLoading ? 'Creating...' : 'Post Announcement'}
                        </Button>
                    </>
                )}
            </Card>
        </div>
    );
}

// ── Discussion Forum ──────────────────────────────────────────────────────
function DiscussionForum() {
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState({});
    const [submittingReply, setSubmittingReply] = useState({});
    const [error, setError] = useState("");

    const fetchDiscussions = async () => {
        try {
            setLoading(true);
            const res = await discussionService.getInstructorDiscussions();
            setDiscussions(res.discussions || []);
        } catch (err) {
            console.error("Failed to fetch instructor discussions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscussions();
    }, []);

    const handleAnswerSubmit = async (discussionId) => {
        const text = replyText[discussionId]?.trim();
        if (!text) return;

        setSubmittingReply(prev => ({ ...prev, [discussionId]: true }));
        try {
            await discussionService.answerQuestion(discussionId, { answer: text });
            setReplyText(prev => ({ ...prev, [discussionId]: "" }));
            // Refresh
            const res = await discussionService.getInstructorDiscussions();
            setDiscussions(res.discussions || []);
        } catch (err) {
            console.error("Failed to submit reply:", err);
            setError(err.response?.data?.message || "Failed to submit reply.");
        } finally {
            setSubmittingReply(prev => ({ ...prev, [discussionId]: false }));
        }
    };

    const handleTextChange = (discussionId, value) => {
        setReplyText(prev => ({ ...prev, [discussionId]: value }));
    };

    // Group discussions by course
    const grouped = discussions.reduce((acc, d) => {
        const courseId = d.courseId?._id || "unknown";
        const courseTitle = d.courseId?.title || "Unknown Course";
        if (!acc[courseId]) {
            acc[courseId] = {
                title: courseTitle,
                items: []
            };
        }
        acc[courseId].items.push(d);
        return acc;
    }, {});

    const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    if (loading) {
        return <p className="text-body text-text-secondary">Loading discussions...</p>;
    }

    if (discussions.length === 0) {
        return (
            <EmptyState
                icon={MessageSquare}
                title="No discussions yet"
                sub="Questions asked by students in your courses will appear here."
            />
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {error && (
                <p className="text-caption text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 mb-3">
                    {error}
                </p>
            )}

            {Object.entries(grouped).map(([courseId, group], idx) => (
                <div key={courseId}>
                    {idx > 0 && <hr className="border-border-light my-8" />}
                    <h3 className="text-h3 text-text-primary mb-4 flex items-center gap-2">
                        <BookOpen size={20} className="text-primary" />
                        {group.title}
                    </h3>
                    <div className="space-y-4">
                        {group.items.map((d) => (
                            <Card key={d._id} className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <Avatar name={d.studentId?.name || "Student"} size={36} />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-body font-semibold text-text-primary">
                                                    {d.studentId?.name || "Student"}
                                                </span>
                                                <span className="text-caption text-text-secondary">
                                                    asked on {formatDate(d.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-body text-text-primary mt-1">{d.question}</p>
                                        </div>
                                    </div>
                                    <Badge tone={d.answer ? "success" : "warning"}>
                                        {d.answer ? "✓ Answered" : "Awaiting Answer"}
                                    </Badge>
                                </div>

                                {d.answer ? (
                                    <div className="ml-12 bg-green-50 border border-green-200 rounded-xl p-4">
                                        <p className="text-caption font-semibold text-green-800 mb-1">Your Answer:</p>
                                        <p className="text-body text-text-primary">{d.answer}</p>
                                        {d.answeredAt && (
                                            <p className="text-caption text-text-secondary mt-2">
                                                Replied on {formatDate(d.answeredAt)}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="ml-12 space-y-2">
                                        <Input
                                            as="textarea"
                                            rows={2}
                                            placeholder="Write your answer..."
                                            value={replyText[d._id] || ""}
                                            onChange={(e) => handleTextChange(d._id, e.target.value)}
                                            disabled={submittingReply[d._id]}
                                        />
                                        <Button
                                            onClick={() => handleAnswerSubmit(d._id)}
                                            disabled={submittingReply[d._id] || !replyText[d._id]?.trim()}
                                        >
                                            <Send size={16} />
                                            {submittingReply[d._id] ? "Replying..." : "Reply"}
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Course Reviews ────────────────────────────────────────────────────────
function CourseReviews() {
    const [reviewsList, setReviewsList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await reviewService.getInstructorReviews();
            setReviewsList(res.reviews || []);
        } catch (err) {
            console.error("Failed to fetch instructor reviews:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    // Group reviews by course
    const grouped = reviewsList.reduce((acc, r) => {
        const courseId = r.courseId?._id || "unknown";
        const courseTitle = r.courseId?.title || "Unknown Course";
        if (!acc[courseId]) {
            acc[courseId] = {
                title: courseTitle,
                items: []
            };
        }
        acc[courseId].items.push(r);
        return acc;
    }, {});

    if (loading) {
        return <p className="text-body text-text-secondary">Loading reviews...</p>;
    }

    if (reviewsList.length === 0) {
        return (
            <EmptyState
                icon={Star}
                title="No reviews yet"
                sub="Reviews left by students for your courses will appear here."
            />
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {Object.entries(grouped).map(([courseId, group], idx) => (
                <div key={courseId}>
                    {idx > 0 && <hr className="border-border-light my-8" />}
                    <h3 className="text-h3 text-text-primary mb-4 flex items-center gap-2">
                        <BookOpen size={20} className="text-primary" />
                        {group.title}
                    </h3>
                    <div className="space-y-4">
                        {group.items.map((r) => (
                            <Card key={r._id} className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <Avatar name={r.studentId?.name || "Student"} size={36} />
                                        <div>
                                            <p className="text-body font-semibold text-text-primary">
                                                {r.studentId?.name || "Student"}
                                            </p>
                                            <p className="text-caption text-text-secondary">
                                                reviewed on {new Date(r.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                className={
                                                    i < r.rating
                                                        ? "text-warning fill-warning"
                                                        : "text-border-light"
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-body text-text-primary pl-12">{r.comment}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Course Analytics ─────────────────────────────────────────────────────
function CourseAnalytics() {
    const [analytics, setAnalytics] = useState({
        totalCourses: 0,
        totalStudents: 0,
        uniqueStudents: 0,
        totalEnrollments: 0,
        totalRevenue: 0,
        averageRating: 0,
        avgCompletion: 0,
        engagementRate: 0,
        totalWatchTime: 0,
        popularCategories: [],
        courseData: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await courseService.getCourseAnalytics();
            console.log('📊 Analytics response:', response);
            
            if (response.success) {
                setAnalytics(response.analytics);
            } else {
                setError('Failed to load analytics data');
            }
        } catch (error) {
            console.error('❌ Error fetching analytics:', error);
            setError('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        if (!seconds) return '0h';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        </Card>
                    ))}
                </div>
                <Card className="p-8 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                    <p className="text-text-secondary mt-4">Loading analytics...</p>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-8 text-center">
                <div className="text-red-500 text-4xl mb-3">⚠️</div>
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                    onClick={fetchAnalytics}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                    Retry
                </button>
            </Card>
        );
    }

    if (analytics.totalCourses === 0) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={Users} label="Total Students" value="0" accent="primary" />
                    <StatCard icon={BookOpen} label="Total Courses" value="0" accent="info" />
                    <StatCard icon={Star} label="Avg Rating" value="0" accent="warning" />
                    <StatCard icon={BarChart3} label="Completion" value="0%" accent="success" />
                </div>
                <Card className="p-12 text-center">
                    <div className="flex flex-col items-center">
                        <BarChart3 size={64} className="text-gray-300 mb-4" />
                        <p className="text-h3 text-text-primary">No Courses Yet</p>
                        <p className="text-body text-text-secondary mt-2 max-w-md">
                            Create your first course to start tracking analytics and performance.
                        </p>
                        <Button 
                            className="mt-6"
                            onClick={() => window.location.href = '/instructor/create'}
                        >
                            <PlusCircle size={16} className="mr-2" />
                            Create Course
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const uniqueStudents = analytics.uniqueStudents || analytics.totalStudents || 0;
    const totalEnrollments = analytics.totalEnrollments || 0;

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                    icon={Users} 
                    label="Unique Students" 
                    value={uniqueStudents.toLocaleString()} 
                    accent="primary" 
                />
                <StatCard 
                    icon={BookOpen} 
                    label="Total Courses" 
                    value={analytics.totalCourses} 
                    accent="info" 
                />
                <StatCard 
                    icon={Star} 
                    label="Avg Rating" 
                    value={analytics.averageRating.toFixed(1)} 
                    accent="warning" 
                />
                <StatCard 
                    icon={BarChart3} 
                    label="Completion Rate" 
                    value={`${analytics.avgCompletion}%`} 
                    accent="success" 
                />
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500">Total Enrollments</p>
                    <p className="text-xl font-bold text-text-primary">{totalEnrollments}</p>
                    <p className="text-xs text-gray-400">(Course-student pairs)</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500">Avg Enrollments per Student</p>
                    <p className="text-xl font-bold text-text-primary">
                        {uniqueStudents > 0 ? (totalEnrollments / uniqueStudents).toFixed(1) : 0}
                    </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500">Total Revenue</p>
                    <p className="text-xl font-bold text-green-600">${analytics.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500">Engagement Rate</p>
                    <p className="text-xl font-bold text-blue-600">{analytics.engagementRate || 0}%</p>
                </div>
            </div>

            {/* Engagement & Categories Row */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-h3 text-text-primary mb-4">Course Engagement</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-text-secondary">Average Completion</span>
                                <span className="text-text-primary font-medium">{analytics.avgCompletion}%</span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(analytics.avgCompletion, 100)}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-text-secondary">Engagement Rate</span>
                                <span className="text-text-primary font-medium">{analytics.engagementRate || 0}%</span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(analytics.engagementRate || 0, 100)}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-text-secondary">Total Watch Time</span>
                                <span className="text-text-primary font-medium">{formatTime(analytics.totalWatchTime)}</span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((analytics.totalWatchTime / 3600) * 10, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-h3 text-text-primary mb-4">Popular Categories</h3>
                    {analytics.popularCategories && analytics.popularCategories.length > 0 ? (
                        <div className="space-y-3">
                            {analytics.popularCategories.map((cat, index) => {
                                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                                return (
                                    <div key={cat.name}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-text-secondary">{cat.name}</span>
                                            <span className="text-text-primary font-medium">{cat.count} courses ({cat.percentage || 0}%)</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-500`}
                                                style={{ width: `${Math.min(cat.percentage || 0, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-text-secondary text-sm">No categories data available</p>
                    )}
                </Card>
            </div>

            {/* Course Performance Table */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-h3 text-text-primary">Course Performance</h3>
                    <button 
                        onClick={fetchAnalytics}
                        className="text-caption text-primary hover:underline flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {analytics.courseData && analytics.courseData.length === 0 ? (
                    <p className="text-text-secondary text-center py-8">No course data available</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-caption text-text-secondary border-b border-border-light bg-gray-50/30">
                                    <th className="py-3 px-4 font-semibold">Course</th>
                                    <th className="py-3 px-4 font-semibold text-center">Students</th>
                                    <th className="py-3 px-4 font-semibold text-center">Enrollments</th>
                                    <th className="py-3 px-4 font-semibold text-center">Rating</th>
                                    <th className="py-3 px-4 font-semibold text-center">Progress</th>
                                    <th className="py-3 px-4 font-semibold text-center">Revenue</th>
                                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.courseData.map((course) => (
                                    <tr key={course.id} className="border-b border-border-light hover:bg-gray-50/50 transition-colors last:border-0">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                {course.image ? (
                                                    <img 
                                                        src={course.image} 
                                                        alt={course.title} 
                                                        className="w-8 h-8 object-cover rounded"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                                        <BookOpen size={14} className="text-gray-400" />
                                                    </div>
                                                )}
                                                <p className="text-text-primary font-medium line-clamp-1">{course.title}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center text-text-secondary">{course.students || 0}</td>
                                        <td className="py-3 px-4 text-center text-text-secondary">{course.enrollments || course.students || 0}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="flex items-center justify-center gap-1">
                                                <span className="text-text-secondary">{course.rating}</span>
                                                <Star size={12} className="text-warning fill-warning" />
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min(course.progress, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-caption text-text-secondary">{course.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center text-text-secondary">
                                            ${course.revenue.toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <Badge tone={
                                                course.status === 'approved' ? 'success' :
                                                course.status === 'pending' ? 'warning' :
                                                'danger'
                                            }>
                                                {course.status || 'Draft'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}

// ── Root ──────────────────────────────────────────────────────────────────
export default function InstructorDashboard() {
    const [active, setActive] = useState("dashboard");
    const [hasCourses, setHasCourses] = useState(true);
    const [loading, setLoading] = useState(true);
    const [notificationCount, setNotificationCount] = useState(0);
    const [userName, setUserName] = useState("Instructor");
    const [userRole, setUserRole] = useState("instructor");

    useEffect(() => {
        // Get user data from localStorage
        const getUserData = () => {
            try {
                const userData = localStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    setUserName(user.name || user.fullName || "Instructor");
                    setUserRole(user.role || "instructor");
                }
            } catch (error) {
                console.error('Error getting user data:', error);
            }
        };
        getUserData();

        const checkCourses = async () => {
            try {
                const res = await courseService.getMyCourses();
                const courses = res.course || res.courses || [];
                setHasCourses(courses.length > 0);
            } catch {
                setHasCourses(false);
            } finally {
                setLoading(false);
            }
        };
        checkCourses();

        // Fetch notification count
        const fetchNotificationCount = async () => {
            try {
                let count = 0;
                
                const assignRes = await assignmentService.getMyAssignments();
                const assignments = assignRes?.assignments || [];
                for (const assignment of assignments) {
                    try {
                        const subRes = await assignmentService.getAssignmentSubmissions(assignment._id);
                        const subs = subRes?.submissions || [];
                        const pending = subs.filter(s => s.status === 'pending' || s.status === 'submitted');
                        count += pending.length;
                    } catch (err) {
                        console.log('No submissions for assignment:', assignment._id);
                    }
                }
                
                try {
                    const reviewRes = await reviewService.getInstructorReviews();
                    const reviews = reviewRes?.reviews || [];
                    count += reviews.length;
                } catch (err) {
                    console.log('No reviews data available');
                }

                setNotificationCount(count);
            } catch (err) {
                console.error('Failed to fetch notification count:', err);
            }
        };
        fetchNotificationCount();
    }, []);

    const handleNotificationClick = () => {
        setActive('discussions');
    };

    const renderPage = () => {
        switch (active) {
            case "dashboard": return <Dashboard />;
            case "create": return <CreateCourse onCreated={() => setActive("manage")} />;
            case "manage": return <ManageCourses />;
            case "assignments": return <ManageAssignments />;
            case "quizzes": return <ManageQuizzes />;
            case "progress": return <StudentProgress />;
            case "announcements": return <Announcements />;
            case "discussions": return <DiscussionForum />;
            case "reviews": return <CourseReviews />;
            case "analytics": return <CourseAnalytics />;
            default: return <Dashboard />;
        }
    };

    if (loading) {
        return (
            <DashboardShell 
                roleLabel="Instructor Panel" 
                navItems={navItems} 
                active={active} 
                onNavigate={setActive} 
                userName={userName}
                userRole={userRole}
                notificationCount={notificationCount}
                onNotificationClick={handleNotificationClick}
            >
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
            </DashboardShell>
        );
    }

    if (!hasCourses) {
        return (
            <DashboardShell 
                roleLabel="Instructor Panel" 
                navItems={navItems} 
                active={active} 
                onNavigate={setActive} 
                userName={userName}
                userRole={userRole}
                notificationCount={notificationCount}
                onNotificationClick={handleNotificationClick}
            >
                <EmptyState icon={BookOpen} title="No courses yet" sub="Create your first course to get started." />
            </DashboardShell>
        );
    }

    return (
        <DashboardShell 
            roleLabel="Instructor Panel" 
            navItems={navItems} 
            active={active} 
            onNavigate={setActive} 
            userName={userName}
            userRole={userRole}
            notificationCount={notificationCount}
            onNotificationClick={handleNotificationClick}
        >
            <PageHeader title={navItems.find((n) => n.id === active)?.label || "Dashboard"} />
            {renderPage()}
        </DashboardShell>
    );
}