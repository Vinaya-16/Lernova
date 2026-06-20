import { useState } from "react";
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

    const submit = (e) => {
        e.preventDefault();
        onCreated();
    };

    return (
        <Card className="max-w-2xl">
            <form onSubmit={submit}>
                <Input label="Course Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Advanced React Patterns" required />
                <Input label="Category" as="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {["Web Development", "Design", "Data Science", "Marketing", "Photography", "Business"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </Input>
                <Input label="Description" as="textarea" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will students learn?" />
                <Input label="Price (USD)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="49" />
                <Button type="submit" full>Create Course (Draft)</Button>
            </form>
        </Card>
    );
}

// ── Curriculum Builder + Uploads (course editor) ─────────────────────────
function CourseEditor({ course, onBack }) {
    const [tab, setTab] = useState("curriculum");
    return (
        <div className="space-y-4">
            <button onClick={onBack} className="flex items-center gap-1 text-caption font-semibold text-text-secondary hover:text-primary">
                <ChevronLeft size={16} /> Back to courses
            </button>
            <Card>
                <h2 className="text-h3 text-text-primary mb-1">{course.title}</h2>
                <p className="text-caption text-text-secondary mb-4">{course.category} · {course.level}</p>
                <div className="flex gap-2 border-b border-border-light pb-2 mb-5 flex-wrap">
                    {[
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
    const [editing, setEditing] = useState(null);
    if (editing) return <CourseEditor course={editing} onBack={() => setEditing(null)} />;

    return (
        <div className="space-y-4">
            {myCourses.map((c) => (
                <Card key={c.id} className="flex items-center gap-4 flex-wrap">
                    <img src={c.thumbnail} alt={c.title} className="w-20 h-16 object-cover rounded-xl" />
                    <div className="flex-1 min-w-[180px]">
                        <p className="text-body-lg text-text-primary">{c.title}</p>
                        <p className="text-caption text-text-secondary">{c.category} · {c.students.toLocaleString()} students</p>
                    </div>
                    <Badge tone="success">Published</Badge>
                    <Button variant="outline" className="h-9 px-4" onClick={() => setEditing(c)}>Edit</Button>
                </Card>
            ))}
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
