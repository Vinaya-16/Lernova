import { useEffect, useState } from "react";
import { assignmentService } from "../services/assignmentSubmission.js";
import axios from "axios";
import { courseService } from "../services/courseService.js"
import * as announcementService from "../services/announcementService.js";
import {
    LayoutDashboard,
    PlusCircle,
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
    Plus
} from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { Card, StatCard, Button, Badge, Input, ProgressBar, PageHeader, EmptyState } from "../components/ui";
import {
    courses as allCourses,
    students,
    assignments,
    quizzes,
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
    { id: "analytics", label: "Course Analytics", icon: BarChart3 },
];

const myCourses = allCourses.slice(0, 4);

// ── Dashboard ───────────────────────────────────────────────────────────
function Dashboard() {
    const totalStudents = myCourses.reduce((sum, c) => sum + c.students, 0);
    const avgCompletion = Math.round(myCourses.reduce((sum, c) => sum + c.progress, 0) / myCourses.length);

    // Fetch real announcements for the overview card
    const [recentAnnouncements, setRecentAnnouncements] = useState([]);
    const [announcementsLoading, setAnnouncementsLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await announcementService.getAnnouncements();
                const list = res?.announcements || [];
                setRecentAnnouncements(list.slice(0, 4));
            } catch (err) {
                console.error("Failed to fetch recent announcements:", err);
            } finally {
                setAnnouncementsLoading(false);
            }
        };
        fetchRecent();
    }, []);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={BookOpen} label="Total Courses" value={myCourses.length} accent="primary" />
                <StatCard icon={Users} label="Active Students" value={totalStudents.toLocaleString()} accent="info" />
                <StatCard icon={ClipboardList} label="Assignment Submissions" value={assignments.length} accent="warning" />
                <StatCard icon={BarChart3} label="Course Completion Rate" value={`${avgCompletion}%`} accent="success" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <h3 className="text-h3 text-text-primary mb-4">Quiz Statistics</h3>
                    <div className="space-y-3">
                        {quizzes.map((q) => (
                            <div key={q.id} className="flex items-center justify-between border border-border-light rounded-xl px-4 py-3">
                                <div>
                                    <p className="text-body text-text-primary">{q.title}</p>
                                    <p className="text-caption text-text-secondary">{q.course}</p>
                                </div>
                                <Badge tone={q.status === "Completed" ? "success" : "warning"}>{q.status}</Badge>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card>
                    <h3 className="text-h3 text-text-primary mb-4">Recent Announcements</h3>
                    {announcementsLoading ? (
                        <p className="text-caption text-text-secondary">Loading...</p>
                    ) : recentAnnouncements.length === 0 ? (
                        <p className="text-caption text-text-secondary">No announcements yet.</p>
                    ) : (
                        <ul className="space-y-4">
                            {recentAnnouncements.map((a) => (
                                <li key={a._id}>
                                    <p className="text-body text-text-primary">{a.title}</p>
                                    <p className="text-caption text-text-secondary">
                                        {a.course?.title || "General"} · {new Date(a.createdAt).toLocaleDateString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
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
                "Personal Development"
            ];

            const courseData = {
                title,
                category: categoryMap[category] || category,
                description,
                price: parseFloat(price) || 0,
                image,
                language,
                complexity,
                duration,
            };

            const response = await courseService.createCourse(courseData);

            console.log("Course created: ", response);

            setTitle("");
            setCategory("Web Development");
            setDescription("");
            setPrice("");
            setImage("");
            setLanguage("English");
            setComplexity("Beginner");
            setDuration("8 weeks");

            if (onCreated) {
                onCreated(response.course);
            }

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
                <Input
                    label="Course Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Advanced React Patterns"
                    required
                />
                <Input
                    label="Category"
                    as="select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    {["Web Development", "Design", "Data Science", "Marketing", "Photography", "Business"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </Input>
                <Input
                    label="Description"
                    as="textarea"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What will students learn?"
                />
                <Input
                    label="Price (USD)"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="49"
                />
                <Input
                    label="Course Thumbnail URL (Optional)"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/course-image.jpg"
                />
                <Input
                    label="Language"
                    as="select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Marathi">Marathi</option>
                </Input>
                <Input
                    label="Complexity"
                    as="select"
                    value={complexity}
                    onChange={(e) => setComplexity(e.target.value)}
                >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </Input>
                <Input
                    label="Duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 8 weeks"
                />
                <Button type="submit" full disabled={loading}>
                    {loading ? "Creating..." : "Create Course (Draft)"}
                </Button>
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
            setFile(null);
            setTitle("");
            setProgress(0);
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
            {/* Upload Section */}
            <div className="border-2 border-dashed border-border-light rounded-2xl p-8 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <FileVideo size={20} className="text-primary" />
                    <p className="text-body-lg text-text-primary font-medium">Upload a Video</p>
                </div>

                <Input
                    label="Video Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Lesson 1 - Introduction"
                />

                <div>
                    <label className="block mb-1 text-sm font-medium text-text-secondary">
                        Select Video File (MP4, MOV)
                    </label>
                    <input
                        type="file"
                        accept="video/mp4,video/quicktime"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-active-bg file:text-primary hover:file:bg-active-bg cursor-pointer"
                    />
                </div>

                {file && (
                    <p className="text-caption text-text-secondary">
                        Selected: <span className="text-text-primary font-medium">{file.name}</span> ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                )}

                {uploading && (
                    <div className="space-y-1">
                        <ProgressBar value={progress} />
                        <p className="text-caption text-text-secondary">{progress}% uploaded...</p>
                    </div>
                )}

                <Button onClick={handleUpload} disabled={uploading || !file}>
                    {uploading ? "Uploading..." : "Upload Video"}
                </Button>
            </div>

            {/* Video List */}
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
                        <div
                            key={v._id}
                            className="flex items-center justify-between border border-border-light rounded-xl px-4 py-3"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-active-bg flex items-center justify-center">
                                    <FileVideo size={16} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-body text-text-primary">{v.title}</p>
                                    <a
                                        href={v.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-caption text-primary underline"
                                    >
                                        Preview
                                    </a>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(v._id)}
                                className="text-red-400 hover:text-red-600 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// ── Curriculum Builder + Uploads (course editor) ─────────────────────────
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

            await courseService.updateCourse(course._id, {
                title,
                category,
                description,
                price,
                image,
                language,
                complexity,
                duration,
            });

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
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? "bg-active-bg text-primary" : "text-text-secondary hover:bg-active-bg"}`}
                        >
                            <t.icon size={15} /> {t.label}
                        </button>
                    ))}
                </div>

                {tab === "details" && (
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-1 font-medium">Course Title</label>
                            <input
                                className="w-full border rounded-lg p-2"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Category</label>
                            <select
                                className="w-full border rounded-lg p-2"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="Frontend">Frontend</option>
                                <option value="Backend">Backend</option>
                                <option value="Software">Software</option>
                                <option value="IT">IT</option>
                                <option value="Design">Design</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Description</label>
                            <textarea
                                rows={5}
                                className="w-full border rounded-lg p-2"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Price</label>
                            <input
                                type="number"
                                className="w-full border rounded-lg p-2"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Course Thumbnail URL</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg p-2"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Language</label>
                            <select
                                className="w-full border rounded-lg p-2"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Marathi">Marathi</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Complexity</label>
                            <select
                                className="w-full border rounded-lg p-2"
                                value={complexity}
                                onChange={(e) => setComplexity(e.target.value)}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Duration</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg p-2"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="8 weeks"
                            />
                        </div>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
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
                                            <span>{l.title}</span>
                                            <span className="text-caption">{l.duration}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        <Button variant="outline" full><PlusCircle size={16} /> Add Module</Button>
                    </div>
                )}

                {/* FIXED - now uses VideoUploader component */}
                {tab === "videos" && (
                    <VideoUploader courseId={course._id} />
                )}

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

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await courseService.getMyCourses();
            setCourses(response.course || []);
        } catch (error) {
            console.error("Failed to fetch courses: ", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this course?")) return;

        try {
            await courseService.deleteCourse(id);
            setCourses((prev) => prev.filter((course) => course._id !== id));
            alert("Course deleted successfully.");
        } catch (error) {
            console.error("Delete course failed: ", error);
        }
    };

    if (editing) {
        return (
            <CourseEditor
                course={editing}
                onBack={() => {
                    setEditing(null);
                    fetchCourses();
                }}
            />
        );
    }

    if (loading) {
        return <p>Loading courses...</p>;
    }

    return (
        <div className="space-y-4">
            {courses.length === 0 ? (
                <Card>
                    <p>No courses created yet</p>
                </Card>
            ) : (
                courses.map((c) => (
                    <Card key={c._id} className="flex items-center gap-4 flex-wrap">
                        <img
                            src={c.image || ""}
                            alt={c.title}
                            className="w-20 h-16 object-cover rounded-xl"
                        />
                        <div className="flex-1 min-w-[180px]">
                            <p className="text-body-lg text-text-primary">{c.title}</p>
                            <p className="text-caption text-text-secondary">
                                {c.category} · {c.studentsEnrolled || 0} students
                            </p>
                        </div>
                        <Badge
                            tone={
                                c.status === "approved"
                                    ? "success"
                                    : c.status === "rejected"
                                        ? "danger"
                                        : "warning"
                            }
                        >
                            {c.status}
                        </Badge>
                        <Button variant="outline" className="h-9 px-4" onClick={() => setEditing(c)}>
                            Edit
                        </Button>
                        <Button variant="destructive" className="h-9 px-4" onClick={() => handleDelete(c._id)}>
                            Delete
                        </Button>
                    </Card>
                ))
            )}
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
    const [newAssignment, setNewAssignment] = useState({
        title: '',
        description: '',
        dueDate: '',
        courseId: '',
        maxMarks: 100
    });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);
    const [formError, setFormError] = useState(null);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [gradingData, setGradingData] = useState({});

    useEffect(() => {
        fetchAssignments();
        fetchCourses();
    }, []);

    const fetchAssignments = async () => {
        try {
            setError(null);
            const response = await assignmentService.getMyAssignments();
            console.log('Assignments response:', response);

            let assignmentsData = [];
            if (response && response.assignments) {
                assignmentsData = response.assignments;
            } else if (response && response.data) {
                assignmentsData = response.data;
            } else if (Array.isArray(response)) {
                assignmentsData = response;
            }

            setAssignments(assignmentsData);
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
            console.log('Full response:', response);

            let courses = [];
            if (response && response.success && response.course) {
                courses = response.course;
            } else if (response && response.courses) {
                courses = response.courses;
            } else if (Array.isArray(response)) {
                courses = response;
            }

            // Filter only approved courses
            // Assuming 'status' field indicates approval (e.g., 'active', 'approved', or 'published')
            const approvedCourses = courses.filter(course => {
                // Check for different possible status fields
                const status = course.status || course.courseStatus || course.approvalStatus;
                // Only include if status is 'active', 'approved', 'published', or true
                return status === 'active' ||
                    status === 'approved' ||
                    status === 'published' ||
                    status === true;
            });

            setAvailableCourses(approvedCourses);
            console.log('Loaded approved courses:', approvedCourses);
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
            console.log('Submissions response:', response);

            let submissionsData = [];
            if (response && response.submissions) {
                submissionsData = response.submissions;
            } else if (response && response.data) {
                submissionsData = response.data;
            } else if (Array.isArray(response)) {
                submissionsData = response;
            }

            setSubmissions(submissionsData);
            setShowSubmissions(true);
        } catch (error) {
            console.error("Failed to fetch submissions:", error);
            alert('Failed to load submissions. Please try again.');
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const handleViewSubmissions = (assignment) => {
        setSelectedAssignment(assignment);
        fetchSubmissions(assignment._id);
    };

    const handleCreateAssignment = async () => {
        if (!newAssignment.title.trim()) {
            setFormError('Please enter an assignment title');
            return;
        }

        if (!newAssignment.description.trim()) {
            setFormError('Please enter an assignment description');
            return;
        }

        if (!newAssignment.dueDate) {
            setFormError('Please select a due date');
            return;
        }

        if (!newAssignment.courseId) {
            setFormError('Please select a course');
            return;
        }

        if (!newAssignment.maxMarks || newAssignment.maxMarks < 1) {
            setFormError('Please enter valid maximum marks (minimum 1)');
            return;
        }

        setFormError(null);
        setCreating(true);

        try {
            const assignmentData = {
                title: newAssignment.title.trim(),
                description: newAssignment.description.trim(),
                courseId: newAssignment.courseId,
                dueDate: new Date(newAssignment.dueDate).toISOString(),
                maxMarks: parseInt(newAssignment.maxMarks) || 100,
            };

            console.log('Sending assignment data:', JSON.stringify(assignmentData, null, 2));

            const response = await assignmentService.createAssignment(assignmentData);
            console.log('Create assignment response:', response);

            const newAssignmentObj = response.assignment || response.data || response;
            setAssignments([newAssignmentObj, ...assignments]);
            setShowCreateForm(false);
            setNewAssignment({
                title: '',
                description: '',
                dueDate: '',
                courseId: '',
                maxMarks: 100
            });

            console.log('Assignment created successfully:', newAssignmentObj);

        } catch (error) {
            console.error("Failed to create assignment:", error);

            let errorMessage = 'Failed to create assignment. Please try again.';
            if (error.response) {
                if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.request) {
                errorMessage = 'No response from server. Please check your connection.';
            }

            setFormError(errorMessage);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteAssignment = async (assignmentId) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;

        try {
            await assignmentService.deleteAssignment(assignmentId);
            setAssignments(assignments.filter(a => a._id !== assignmentId));
        } catch (error) {
            console.error("Failed to delete assignment:", error);
            alert('Failed to delete assignment. Please try again.');
        }
    };

    const handleEditAssignment = (assignment) => {
        setEditingAssignment(assignment);
        setNewAssignment({
            title: assignment.title,
            description: assignment.description || '',
            dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : '',
            courseId: assignment.courseId?._id || assignment.courseId || '',
            maxMarks: assignment.maxMarks || 100
        });
        setShowCreateForm(true);
    };

    const handleUpdateAssignment = async () => {
        if (!newAssignment.title.trim()) {
            setFormError('Please enter an assignment title');
            return;
        }

        setFormError(null);
        setCreating(true);

        try {
            const updateData = {
                title: newAssignment.title.trim(),
                description: newAssignment.description.trim(),
                dueDate: new Date(newAssignment.dueDate).toISOString(),
                maxMarks: parseInt(newAssignment.maxMarks) || 100,
            };

            const response = await assignmentService.updateAssignment(editingAssignment._id, updateData);
            const updatedAssignment = response.assignment || response.data || response;

            setAssignments(assignments.map(a =>
                a._id === updatedAssignment._id ? updatedAssignment : a
            ));

            setShowCreateForm(false);
            setEditingAssignment(null);
            setNewAssignment({
                title: '',
                description: '',
                dueDate: '',
                courseId: '',
                maxMarks: 100
            });

        } catch (error) {
            console.error("Failed to update assignment:", error);
            setFormError('Failed to update assignment. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const handleGradeSubmission = async (submissionId) => {
        const gradeData = gradingData[submissionId];
        if (!gradeData || gradeData.marks === undefined || gradeData.marks === '') {
            alert('Please enter marks for this submission');
            return;
        }

        const marks = parseFloat(gradeData.marks);
        if (isNaN(marks) || marks < 0) {
            alert('Please enter valid marks (0 or higher)');
            return;
        }

        if (marks > (selectedAssignment.maxMarks || 100)) {
            alert(`Marks cannot exceed ${selectedAssignment.maxMarks || 100}`);
            return;
        }

        try {
            const response = await assignmentService.gradeSubmission(submissionId, {
                marks: marks,
                feedback: gradeData.feedback || ''
            });

            // Update the submission in the list
            const gradedSubmission = response.submission || response.data || response;
            setSubmissions(submissions.map(s =>
                s._id === gradedSubmission._id ? gradedSubmission : s
            ));

            // Clear grading data for this submission
            setGradingData(prev => ({ ...prev, [submissionId]: undefined }));

            // Check if all submissions are graded
            const allGraded = submissions.every(s =>
                s._id === submissionId || s.status === 'graded'
            );

            // Update the assignment status if all submissions are graded
            if (allGraded) {
                const updatedAssignments = assignments.map(a => {
                    if (a._id === selectedAssignment._id) {
                        return { ...a, status: 'graded' };
                    }
                    return a;
                });
                setAssignments(updatedAssignments);
            }

        } catch (error) {
            console.error("Failed to grade submission:", error);
            alert('Failed to grade submission. Please try again.');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'graded':
                return <Badge tone="success">Graded</Badge>;
            case 'submitted':
                return <Badge tone="info">Submitted</Badge>;
            case 'pending':
                return <Badge tone="warning">Pending</Badge>;
            default:
                return <Badge tone="warning">{status || 'Pending'}</Badge>;
        }
    };

    const formatDate = (date) => {
        if (!date) return 'No Due Date';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading assignments...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="text-red-600 p-4 bg-red-50 rounded-md border border-red-200">
                    {error}
                    <button
                        onClick={fetchAssignments}
                        className="ml-4 text-blue-600 underline hover:text-blue-800"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Assignments List */}
            {assignments.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-gray-500">No assignments found. Create your first assignment!</p>
                </Card>
            ) : (
                assignments.map((a) => (
                    <Card
                        key={a._id}
                        className="flex items-center justify-between flex-wrap gap-3 p-4"
                    >
                        <div className="flex-1">
                            <p className="text-body-lg text-text-primary font-medium">
                                {a.title}
                            </p>

                            <p className="text-caption text-text-secondary">
                                {a.courseId?.title || "Unknown Course"} · Due {formatDate(a.dueDate)}
                                {a.maxMarks && ` · Max Marks: ${a.maxMarks}`}
                            </p>

                            {a.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {a.description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {getStatusBadge(a.status)}

                            <Button
                                variant="outline"
                                className="h-9 px-3"
                                onClick={() => handleViewSubmissions(a)}
                            >
                                <FileText size={16} className="mr-1" />
                                Submissions
                            </Button>

                            <Button
                                variant="outline"
                                className="h-9 px-3"
                                onClick={() => handleEditAssignment(a)}
                            >
                                <Pencil size={16} />
                            </Button>

                            <Button
                                variant="outline"
                                className="h-9 px-3 text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteAssignment(a._id)}
                            >
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </Card>
                ))
            )}

            {/* Create Assignment Button */}
            {!showCreateForm && (
                <Button
                    variant="outline"
                    onClick={() => {
                        setEditingAssignment(null);
                        setShowCreateForm(true);
                    }}
                >
                    <PlusCircle size={16} />
                    Create Assignment
                </Button>
            )}

            {/* Create/Edit Form */}
            {showCreateForm && (
                <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">
                        {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
                    </h3>

                    {formError && (
                        <div className="text-red-600 p-3 bg-red-50 rounded-md mb-4 border border-red-200">
                            {formError}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Assignment Title *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Final Project, Midterm Exam, Homework 1"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={newAssignment.title}
                                onChange={(e) => setNewAssignment({
                                    ...newAssignment,
                                    title: e.target.value
                                })}
                                disabled={creating}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                            </label>
                            <textarea
                                placeholder="Describe the assignment requirements, objectives, and expectations..."
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={newAssignment.description}
                                onChange={(e) => setNewAssignment({
                                    ...newAssignment,
                                    description: e.target.value
                                })}
                                disabled={creating}
                                rows="4"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Course *
                            </label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={newAssignment.courseId}
                                onChange={(e) => setNewAssignment({
                                    ...newAssignment,
                                    courseId: e.target.value
                                })}
                                disabled={creating || loadingCourses || !!editingAssignment}
                            >
                                <option value="">Select a Course</option>
                                {availableCourses.map((course) => (
                                    <option key={course._id} value={course._id}>
                                        {course.title} {course.code ? `(${course.code})` : ''}
                                    </option>
                                ))}
                            </select>
                            {editingAssignment && (
                                <p className="text-xs text-gray-500 mt-1">Course cannot be changed for existing assignments</p>
                            )}
                            {!loadingCourses && availableCourses.length === 0 && (
                                <p className="text-sm text-yellow-600 mt-1">
                                    No courses available. Please create a course first.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date *
                            </label>
                            <input
                                type="date"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={newAssignment.dueDate}
                                onChange={(e) => setNewAssignment({
                                    ...newAssignment,
                                    dueDate: e.target.value
                                })}
                                disabled={creating}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Maximum Marks *
                            </label>
                            <input
                                type="number"
                                placeholder="e.g., 100"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={newAssignment.maxMarks}
                                onChange={(e) => setNewAssignment({
                                    ...newAssignment,
                                    maxMarks: parseInt(e.target.value) || 100
                                })}
                                disabled={creating}
                                min="1"
                                max="1000"
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter the total marks for this assignment (1-1000)</p>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
                        <Button
                            onClick={editingAssignment ? handleUpdateAssignment : handleCreateAssignment}
                            disabled={creating}
                            className="px-6"
                        >
                            {creating ? 'Saving...' : (editingAssignment ? 'Update Assignment' : 'Create Assignment')}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowCreateForm(false);
                                setEditingAssignment(null);
                                setNewAssignment({
                                    title: '',
                                    description: '',
                                    dueDate: '',
                                    courseId: '',
                                    maxMarks: 100
                                });
                                setFormError(null);
                            }}
                            disabled={creating}
                        >
                            Cancel
                        </Button>
                    </div>
                </Card>
            )}

            {/* Submissions Modal */}
            {showSubmissions && selectedAssignment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        setShowSubmissions(false);
                        setSelectedAssignment(null);
                        setSubmissions([]);
                        setGradingData({});
                    }
                }}>
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-xl font-semibold">
                                    Submissions for: {selectedAssignment.title}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Course: {selectedAssignment.courseId?.title || 'Unknown'} ·
                                    Due: {formatDate(selectedAssignment.dueDate)} ·
                                    Max Marks: {selectedAssignment.maxMarks || 100}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowSubmissions(false);
                                    setSelectedAssignment(null);
                                    setSubmissions([]);
                                    setGradingData({});
                                }}
                            >
                                Close
                            </Button>
                        </div>

                        {loadingSubmissions ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Loading submissions...</p>
                            </div>
                        ) : submissions.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No submissions yet for this assignment.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {submissions.map((submission) => (
                                    <Card key={submission._id} className="p-4">
                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <p className="font-medium">
                                                        Student: {submission.studentId?.name || 'Unknown Student'}
                                                    </p>
                                                    {getStatusBadge(submission.status)}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Email: {submission.studentId?.email || 'No email'}
                                                </p>
                                                {submission.submissionText && (
                                                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.submissionText}</p>
                                                    </div>
                                                )}
                                                {submission.fileUrl && (
                                                    <a
                                                        href={submission.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline text-sm inline-block mt-2"
                                                    >
                                                        📎 View Attachment
                                                    </a>
                                                )}
                                                {submission.createdAt && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Submitted: {new Date(submission.createdAt).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>

                                            {submission.status !== 'graded' ? (
                                                <div className="flex flex-col gap-2 min-w-[200px]">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700">
                                                            Marks *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            placeholder="Enter marks"
                                                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            value={gradingData[submission._id]?.marks || ''}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                setGradingData(prev => ({
                                                                    ...prev,
                                                                    [submission._id]: {
                                                                        ...prev[submission._id],
                                                                        marks: value,
                                                                        maxMarks: selectedAssignment.maxMarks || 100
                                                                    }
                                                                }));
                                                            }}
                                                            min="0"
                                                            max={selectedAssignment.maxMarks || 100}
                                                        />
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            Max: {selectedAssignment.maxMarks || 100}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <textarea
                                                            placeholder="Feedback (optional)"
                                                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            rows="2"
                                                            value={gradingData[submission._id]?.feedback || ''}
                                                            onChange={(e) => {
                                                                setGradingData(prev => ({
                                                                    ...prev,
                                                                    [submission._id]: {
                                                                        ...prev[submission._id],
                                                                        feedback: e.target.value
                                                                    }
                                                                }));
                                                            }}
                                                        />
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleGradeSubmission(submission._id)}
                                                        className="w-full"
                                                        disabled={!gradingData[submission._id]?.marks}
                                                    >
                                                        <CheckCircle size={14} className="mr-1" />
                                                        Grade Submission
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="text-center min-w-[150px] p-3 bg-green-50 rounded-md">
                                                    <p className="text-lg font-bold text-green-600">
                                                        {submission.marks}/{selectedAssignment.maxMarks || 100}
                                                    </p>
                                                    {submission.feedback && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Feedback: {submission.feedback}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-green-600 mt-1">✓ Graded</p>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Manage Quizzes ───────────────────────────────────────────────────────
function ManageQuizzes() {
    return (
        <div className="grid sm:grid-cols-2 gap-5">
            {quizzes.map((q) => (
                <Card key={q.id}>
                    <p className="text-body-lg text-text-primary">{q.title}</p>
                    <p className="text-caption text-text-secondary mb-3">{q.course} · {q.questions} questions</p>
                    <div className="flex items-center justify-between">
                        <Badge tone={q.status === "Completed" ? "success" : "warning"}>{q.status}</Badge>
                        <Button variant="outline" className="h-9 px-4">Edit</Button>
                    </div>
                </Card>
            ))}
            <Card className="flex items-center justify-center border-dashed border-2 border-border-light">
                <Button variant="ghost"><PlusCircle size={16} /> Create Quiz</Button>
            </Card>
        </div>
    );
}

// ── Student Progress Tracking ────────────────────────────────────────────
function StudentProgress() {
    return (
        <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[560px]">
                <thead>
                    <tr className="text-caption text-text-secondary border-b border-border-light">
                        <th className="py-3 pr-4">Student</th>
                        <th className="py-3 pr-4">Courses Enrolled</th>
                        <th className="py-3 pr-4">Progress</th>
                        <th className="py-3 pr-4">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((s) => (
                        <tr key={s.id} className="border-b border-border-light last:border-0">
                            <td className="py-3 pr-4 text-text-primary">{s.name}</td>
                            <td className="py-3 pr-4 text-text-secondary">{s.coursesEnrolled}</td>
                            <td className="py-3 pr-4 w-40"><ProgressBar value={(s.coursesEnrolled / 6) * 100} /></td>
                            <td className="py-3 pr-4"><Badge tone={s.status === "Active" ? "success" : "warning"}>{s.status}</Badge></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
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

    // Fetch courses
    const fetchCourses = async () => {
        try {
            setLoadingCourses(true);
            const response = await courseService.getMyCourses();
            console.log('Full course response:', response);

            let courseList = [];
            
            // Handle different response structures
            if (response && response.success && response.course) {
                // Response structure: { success: true, course: [...] }
                courseList = response.course;
                console.log('Found courses in response.course:', courseList);
            } else if (response && response.courses) {
                // Alternative: { success: true, courses: [...] }
                courseList = response.courses;
                console.log('Found courses in response.courses:', courseList);
            } else if (Array.isArray(response)) {
                // Response is directly an array
                courseList = response;
                console.log('Response is an array:', courseList);
            } else if (response && response.data) {
                // Response has data property
                if (Array.isArray(response.data)) {
                    courseList = response.data;
                } else if (response.data.course) {
                    courseList = response.data.course;
                } else if (response.data.courses) {
                    courseList = response.data.courses;
                }
            }

            // Ensure we have an array
            if (!Array.isArray(courseList)) {
                courseList = [];
            }

            // Filter only approved/active courses
            const approvedCourses = courseList.filter(course => {
                const status = course.status || course.courseStatus || course.approvalStatus || course.isApproved;
                // Include if status is active, approved, published, or true
                return status === 'active' ||
                    status === 'approved' ||
                    status === 'published' ||
                    status === true ||
                    status === 'true' ||
                    !status; // If no status, include it
            });

            console.log('Approved courses to set:', approvedCourses);
            setCourses(approvedCourses);
            
            if (approvedCourses.length === 0) {
                setError('No approved courses available');
            } else {
                setError(null);
            }
        } catch (error) {
            console.error("Failed to fetch courses:", error);
            setCourses([]);
            setError('Failed to load courses');
        } finally {
            setLoadingCourses(false);
        }
    };

    // Fetch announcements
    const fetchAnnouncements = async () => {
        try {
            const res = await announcementService.getAnnouncements();
            console.log('Announcements response:', res);
            
            // Handle different response structures
            let announcementsList = [];
            if (res && res.announcements) {
                announcementsList = res.announcements;
            } else if (res && res.data && res.data.announcements) {
                announcementsList = res.data.announcements;
            } else if (Array.isArray(res)) {
                announcementsList = res;
            }
            
            setAnnouncements(announcementsList);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            setError('Failed to load announcements');
            setAnnouncements([]);
        }
    };

    // Create a new course
    const handleCreateCourse = async () => {
        if (!newCourseTitle.trim()) {
            alert('Please enter a course title');
            return;
        }

        setIsLoading(true);
        try {
            const res = await courseService.createCourse({
                title: newCourseTitle.trim(),
                description: newCourseDescription.trim() || 'No description provided'
            });

            console.log('Course created:', res);

            // Refresh courses
            await fetchCourses();

            // Reset form
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

    // Create announcement
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

            // Reset form
            setTitle("");
            setBody("");
            setSelectedCourse("");

            // Refresh announcements
            await fetchAnnouncements();
            alert('Announcement created successfully!');
        } catch (error) {
            console.error('Error creating announcement:', error);
            alert('Failed to create announcement. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            await Promise.all([fetchCourses(), fetchAnnouncements()]);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    // Loading state
    if ((isLoading || loadingCourses) && announcements.length === 0 && courses.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-text-secondary">Loading...</p>
            </div>
        );
    }

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* Announcements List */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center mb-4">
                    {/* <h2 className="text-h2 text-text-primary">Announcements</h2> */}
                    <span className="text-caption text-text-secondary">
                        {announcements.length} total
                    </span>
                </div>

                {announcements.length > 0 ? (
                    announcements.map((a) => (
                        <Card key={a._id} className="hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-1">
                                <Megaphone size={16} className="text-primary" />
                                <p className="text-body-lg text-text-primary font-medium">
                                    {a.title}
                                </p>
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
                        </Card>
                    ))
                ) : (
                    <Card>
                        <div className="text-center py-8">
                            <Megaphone size={48} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-text-secondary mb-2">No announcements yet</p>
                            <p className="text-caption text-text-secondary">
                                Create your first announcement using the form on the right
                            </p>
                        </div>
                    </Card>
                )}
            </div>

            {/* Create Announcement Form */}
            <Card>
                <h3 className="text-h3 text-text-primary mb-3">
                    New Announcement
                </h3>

                {/* Course Selection or Create */}
                {courses.length === 0 ? (
                    <div className="mb-4">
                        <div className="text-yellow-600 p-3 bg-yellow-50 rounded mb-3">
                            <p className="font-medium">⚠️ No courses available</p>
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
                            className="w-full border border-gray-300 p-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="">Select Course</option>
                            {courses.map((course) => (
                                <option key={course._id || course.id} value={course._id || course.id}>
                                    {course.title}
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

// ── Course Analytics ─────────────────────────────────────────────────────
function CourseAnalytics() {
    return (
        <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
                <StatCard icon={Users} label="Total Enrollments" value={myCourses.reduce((s, c) => s + c.students, 0).toLocaleString()} accent="primary" />
                <StatCard icon={Star} label="Average Rating" value={(myCourses.reduce((s, c) => s + c.rating, 0) / myCourses.length).toFixed(1)} accent="warning" />
                <StatCard icon={BarChart3} label="Avg. Completion" value={`${Math.round(myCourses.reduce((s, c) => s + c.progress, 0) / myCourses.length)}%`} accent="success" />
            </div>
            <Card>
                <h3 className="text-h3 text-text-primary mb-4">Course Reviews</h3>
                <div className="space-y-3">
                    {reviews.map((r) => (
                        <div key={r.id} className="border-b border-border-light last:border-0 pb-3 last:pb-0">
                            <div className="flex items-center justify-between">
                                <p className="text-body text-text-primary">{r.student} — {r.course}</p>
                                <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} size={13} className={i < r.rating ? "text-warning fill-warning" : "text-border-light"} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-caption text-text-secondary mt-1">{r.comment}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

// ── Root ──────────────────────────────────────────────────────────────────
export default function InstructorDashboard() {
    const [active, setActive] = useState("dashboard");

    const renderPage = () => {
        switch (active) {
            case "dashboard": return <Dashboard />;
            case "create": return <CreateCourse onCreated={() => setActive("manage")} />;
            case "manage": return <ManageCourses />;
            case "assignments": return <ManageAssignments />;
            case "quizzes": return <ManageQuizzes />;
            case "progress": return <StudentProgress />;
            case "announcements": return <Announcements />;
            case "analytics": return <CourseAnalytics />;
            default: return <Dashboard />;
        }
    };

    if (myCourses.length === 0) {
        return (
            <DashboardShell roleLabel="Instructor Panel" navItems={navItems} active={active} onNavigate={setActive} userName="Instructor">
                <EmptyState icon={BookOpen} title="No courses yet" sub="Create your first course to get started." />
            </DashboardShell>
        );
    }

    return (
        <DashboardShell roleLabel="Instructor Panel" navItems={navItems} active={active} onNavigate={setActive} userName="Instructor">
            <PageHeader title={navItems.find((n) => n.id === active)?.label || "Dashboard"} />
            {renderPage()}
        </DashboardShell>
    );
}