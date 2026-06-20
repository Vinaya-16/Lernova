import { useEffect, useState } from "react";
import axios from "axios";
import { courseService } from "../services/courseService.js"
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
} from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { Card, StatCard, Button, Badge, Input, ProgressBar, PageHeader, EmptyState } from "../components/ui";
import {
    courses as allCourses,
    students,
    assignments,
    quizzes,
    announcements as mockAnnouncements,
    reviews,
} from "../mockData/lmsData";
import { use } from "react";

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
                    <ul className="space-y-4">
                        {mockAnnouncements.map((a) => (
                            <li key={a.id}>
                                <p className="text-body text-text-primary">{a.title}</p>
                                <p className="text-caption text-text-secondary">{a.course} · {a.date}</p>
                            </li>
                        ))}
                    </ul>
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
            ]

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

            alert("Course created successfully ! Waiting for approval");
        }
        catch (error) {
            console.error("failed to create course: ", error);
        }
        finally {
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

                <Button type="submit" full>Create Course (Draft)</Button>
            </form>
        </Card>
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
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${tab === t.id ? "bg-active-bg text-primary" : "text-text-secondary hover:bg-active-bg"
                                }`}
                        >
                            <t.icon size={15} /> {t.label}
                        </button>
                    ))}
                </div>

                {tab === "details" && (
                    <div className="space-y-4">

                        <div>
                            <label className="block mb-1 font-medium">
                                Course Title
                            </label>

                            <input
                                className="w-full border rounded-lg p-2"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">
                                Category
                            </label>

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
                            <label className="block mb-1 font-medium">
                                Description
                            </label>

                            <textarea
                                rows={5}
                                className="w-full border rounded-lg p-2"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">
                                Price
                            </label>

                            <input
                                type="number"
                                className="w-full border rounded-lg p-2"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">
                                Course Thumbnail URL
                            </label>

                            <input
                                type="text"
                                className="w-full border rounded-lg p-2"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">
                                Language
                            </label>

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
                            <label className="block mb-1 font-medium">
                                Complexity
                            </label>

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
                            <label className="block mb-1 font-medium">
                                Duration
                            </label>

                            <input
                                type="text"
                                className="w-full border rounded-lg p-2"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="8 weeks"
                            />
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={loading}
                        >
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

                {tab === "videos" && (
                    <div className="border-2 border-dashed border-border-light rounded-2xl py-12 flex flex-col items-center justify-center text-center">
                        <Upload size={28} className="text-primary mb-3" />
                        <p className="text-body-lg text-text-primary">Drag & drop lesson videos</p>
                        <p className="text-caption text-text-secondary mb-4">MP4, MOV up to 2GB</p>
                        <Button variant="outline">Browse Files</Button>
                    </div>
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
        }
        catch (error) {
            console.error("Failed to fetch courses: ", error);
        }
        finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this couse?"))
            return;

        try {
            await courseService.deleteCourse(id);

            setCourses((prev) =>
                prev.filter((course) => course._id !== id)
            );

            alert("Course Deleted successfully..")
        }
        catch (error) {
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
        return <p>Loading courses.......</p>;
    }

    return (
        <div className="space-y-4">

            {courses.length === 0 ? (
                <Card>
                    <p>No courses created yet</p>
                </Card>
            ) : (
                courses.map((c) => (
                    <Card
                        key={c._id}
                        className="flex items-center gap-4 flex-wrap"
                    >
                        <img
                            src={
                                c.image || ""
                            }
                            alt={c.title}
                            className="w-20 h-16 object-cover rounded-xl"
                        />
                        <div className="flex-1 min-w-[180px]">
                            <p className="text-body-lg text-text-primary">
                                {c.title}
                            </p>
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

                        <Button
                            variant="outline"
                            className="h-9 px-4"
                            onClick={() => setEditing(c)}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            className="h-9 px-4"
                            onClick={() => handleDelete(c._id)}
                        >
                            Delete
                        </Button>
                    </Card>
                ))
            )}
        </div>
    );
}

// ── Manage Assignments ───────────────────────────────────────────────────
function ManageAssignments() {
    return (
        <div className="space-y-4">
            {assignments.map((a) => (
                <Card key={a.id} className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <p className="text-body-lg text-text-primary">{a.title}</p>
                        <p className="text-caption text-text-secondary">{a.course} · Due {a.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge tone={a.status === "Graded" ? "success" : a.status === "Submitted" ? "info" : "warning"}>{a.status}</Badge>
                        <Button variant="outline" className="h-9 px-4">Review</Button>
                    </div>
                </Card>
            ))}
            <Button variant="outline"><PlusCircle size={16} /> Create Assignment</Button>
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
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                {mockAnnouncements.map((a) => (
                    <Card key={a.id}>
                        <div className="flex items-center gap-2 mb-1">
                            <Megaphone size={16} className="text-primary" />
                            <p className="text-body-lg text-text-primary">{a.title}</p>
                        </div>
                        <p className="text-caption text-text-secondary mb-2">{a.course} · {a.date}</p>
                        <p className="text-body text-text-secondary">{a.body}</p>
                    </Card>
                ))}
            </div>
            <Card>
                <h3 className="text-h3 text-text-primary mb-3">New Announcement</h3>
                <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" />
                <Input label="Message" as="textarea" rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your announcement..." />
                <Button full>Post Announcement</Button>
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
