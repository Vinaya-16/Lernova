import { useState } from "react";
import {
    LayoutDashboard,
    Compass,
    BookOpen,
    PlayCircle,
    ClipboardList,
    HelpCircle,
    Award,
    Bell,
    MessageSquare,
    Star,
    Search,
    Flame,
    CheckCircle2,
    Clock,
    ChevronLeft,
    FileText,
    StickyNote,
    Paperclip,
} from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import Illustration from "../components/Illustration";
import { Card, StatCard, Button, Badge, Input, ProgressBar, PageHeader, EmptyState, Avatar } from "../components/ui";
import studentDashboardImg from "../assets/illustrations/student-dashboard.png";
import studentDashboardWebp from "../assets/illustrations/student-dashboard.webp";
import certificatesImg from "../assets/illustrations/certificates.png";
import certificatesWebp from "../assets/illustrations/certificates.webp";
import browseCoursesImg from "../assets/illustrations/browse-courses.png";
import browseCoursesWebp from "../assets/illustrations/browse-courses.webp";
import {
    courses,
    enrolledCourseIds,
    assignments,
    quizzes,
    certificates,
    reviews,
    discussions,
    notifications as mockNotifications,
    learningStreak,
} from "../mockData/lmsData";

const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "browse", label: "Browse Courses", icon: Compass },
    { id: "enrolled", label: "Enrolled Courses", icon: BookOpen },
    { id: "assignments", label: "Assignments", icon: ClipboardList },
    { id: "quizzes", label: "Quizzes", icon: HelpCircle },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "reviews", label: "Course Reviews", icon: Star },
    { id: "discussions", label: "Discussion Forum", icon: MessageSquare },
];

const enrolledCourses = courses.filter((c) => enrolledCourseIds.includes(c.id));

// ── Dashboard ────────────────────────────────────────────────────────────
function Dashboard({ goTo, openCourse }) {
    const overallProgress = Math.round(
        enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / enrolledCourses.length
    );
    const continueCourse = enrolledCourses.find((c) => c.progress > 0 && c.progress < 100) || enrolledCourses[0];

    return (
        <div className="space-y-6">
            <Card className="bg-primary-gradient text-white flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden relative">
                <div className="md:flex-1">
                    <h2 className="text-h2 text-white">Unlock 1,000+ Premium Courses Today</h2>
                    <p className="text-body text-white/80 mt-1 max-w-md">
                        Learn from industry experts with exclusive content designed to boost your skills.
                    </p>
                    <Button variant="subtle" className="mt-4 bg-white text-primary hover:bg-white/90" onClick={() => goTo("browse")}>
                        Browse Courses
                    </Button>
                </div>
                <Illustration
                    src={studentDashboardImg}
                    webp={studentDashboardWebp}
                    alt="Illustration of a student learning at a laptop with reviews and a daily streak widget"
                    size="dashboard"
                    animate="float"
                    framed
                    className="hidden md:block shrink-0"
                />
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={BookOpen} label="Courses Enrolled" value={enrolledCourses.length} accent="primary" />
                <StatCard icon={CheckCircle2} label="Overall Progress" value={`${overallProgress}%`} accent="success" />
                <StatCard icon={Flame} label="Learning Streak" value={`${learningStreak.current} days`} sub={`Goal: ${learningStreak.target} days`} accent="warning" />
                <StatCard icon={Award} label="Certificates Earned" value={certificates.length} accent="secondary" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-h3 text-text-primary">Continue Learning</h3>
                        <button onClick={() => goTo("enrolled")} className="text-caption font-semibold text-primary">View All</button>
                    </div>
                    {continueCourse && (
                        <div className="flex flex-col sm:flex-row gap-4 items-center bg-app rounded-2xl p-4">
                            <img src={continueCourse.thumbnail} alt={continueCourse.title} className="w-full sm:w-40 h-28 object-cover rounded-xl" />
                            <div className="flex-1 w-full">
                                <p className="text-body-lg text-text-primary">{continueCourse.title}</p>
                                <p className="text-caption text-text-secondary mb-2">{continueCourse.instructor}</p>
                                <ProgressBar value={continueCourse.progress} />
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-caption text-text-secondary">{continueCourse.progress}% complete</span>
                                    <Button variant="primary" className="h-9 px-4" onClick={() => openCourse(continueCourse)}>
                                        <PlayCircle size={16} /> Resume
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 space-y-3">
                        <h4 className="text-body-lg text-text-primary">Upcoming Deadlines</h4>
                        {assignments.slice(0, 2).map((a) => (
                            <div key={a.id} className="flex items-center justify-between border border-border-light rounded-xl px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <Clock size={18} className="text-warning" />
                                    <div>
                                        <p className="text-body text-text-primary">{a.title}</p>
                                        <p className="text-caption text-text-secondary">{a.course}</p>
                                    </div>
                                </div>
                                <Badge tone="warning">{a.dueDate}</Badge>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h3 className="text-h3 text-text-primary mb-4">Recent Activity</h3>
                    <ul className="space-y-4">
                        {mockNotifications.slice(0, 4).map((n) => (
                            <li key={n.id} className="flex gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                                <div>
                                    <p className="text-body text-text-primary">{n.title}</p>
                                    <p className="text-caption text-text-secondary">{n.time}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
}

// ── Browse Courses ───────────────────────────────────────────────────────
function BrowseCourses({ openCourse }) {
    const [query, setQuery] = useState("");
    const filtered = courses.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="relative max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by topic, title, or instructor"
                    className="w-full h-12 rounded-input border border-border-light pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((c) => (
                    <Card key={c.id} className="p-0 overflow-hidden flex flex-col cursor-pointer hover:shadow-soft transition" >
                        <img src={c.thumbnail} alt={c.title} className="w-full h-36 object-cover" onClick={() => openCourse(c)} />
                        <div className="p-4 flex-1 flex flex-col">
                            <Badge tone="primary">{c.category}</Badge>
                            <p className="text-body-lg text-text-primary mt-2 line-clamp-2">{c.title}</p>
                            <p className="text-caption text-text-secondary mt-1">{c.instructor}</p>
                            <div className="flex items-center gap-1 mt-2 text-caption text-text-secondary">
                                <Star size={14} className="text-warning fill-warning" /> {c.rating} ({c.reviews})
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-h3 text-text-primary">${c.price}</span>
                                <Button className="h-9 px-4" onClick={() => openCourse(c)}>View</Button>
                            </div>
                        </div>
                    </Card>
                ))}
                {filtered.length === 0 && (
                    <div className="sm:col-span-2 lg:col-span-3 flex flex-col items-center text-center py-12">
                        <Illustration
                            src={browseCoursesImg}
                            webp={browseCoursesWebp}
                            alt="Illustration representing course exploration with no results"
                            size="discovery"
                            className="mb-4"
                        />
                        <p className="text-h3 text-text-primary">No courses found</p>
                        <p className="text-body text-text-secondary mt-1 max-w-sm">Try a different search term.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Course Details ───────────────────────────────────────────────────────
function CourseDetails({ course, onBack, onPlay }) {
    const isEnrolled = enrolledCourseIds.includes(course.id);
    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-1 text-caption font-semibold text-text-secondary hover:text-primary">
                <ChevronLeft size={16} /> Back
            </button>
            <Card className="p-0 overflow-hidden">
                <img src={course.thumbnail} alt={course.title} className="w-full h-56 object-cover" />
                <div className="p-6">
                    <Badge tone="primary">{course.category}</Badge>
                    <h2 className="text-h2 text-text-primary mt-2">{course.title}</h2>
                    <p className="text-body text-text-secondary mt-2">{course.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-caption text-text-secondary">
                        <span>By {course.instructor}</span>
                        <span className="flex items-center gap-1"><Star size={14} className="text-warning fill-warning" /> {course.rating} ({course.reviews} reviews)</span>
                        <span>{course.students.toLocaleString()} students</span>
                        <span>{course.duration}</span>
                        <Badge tone="info">{course.level}</Badge>
                    </div>
                    <div className="mt-6 flex items-center gap-3">
                        {isEnrolled ? (
                            <Button onClick={() => onPlay(course)}><PlayCircle size={18} /> Continue Learning</Button>
                        ) : (
                            <Button>Enroll Now — ${course.price}</Button>
                        )}
                        <Button variant="outline">Add to Wishlist</Button>
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="text-h3 text-text-primary mb-4">Course Curriculum</h3>
                <div className="space-y-3">
                    {(course.modules || []).map((m) => (
                        <div key={m.id} className="border border-border-light rounded-xl p-4">
                            <p className="text-body-lg text-text-primary mb-2">{m.title}</p>
                            <ul className="space-y-2">
                                {m.lessons.map((l) => (
                                    <li key={l.id} className="flex items-center justify-between text-body text-text-secondary">
                                        <span className="flex items-center gap-2">
                                            <PlayCircle size={16} className={l.completed ? "text-success" : "text-text-secondary"} />
                                            {l.title}
                                        </span>
                                        <span className="text-caption">{l.duration}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    {(!course.modules || course.modules.length === 0) && (
                        <p className="text-caption text-text-secondary">Curriculum will be available once published.</p>
                    )}
                </div>
            </Card>
        </div>
    );
}

// ── Enrolled Courses ─────────────────────────────────────────────────────
function EnrolledCourses({ openCourse, onPlay }) {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrolledCourses.map((c) => (
                <Card key={c.id} className="p-0 overflow-hidden flex flex-col">
                    <img src={c.thumbnail} alt={c.title} className="w-full h-36 object-cover cursor-pointer" onClick={() => openCourse(c)} />
                    <div className="p-4 flex-1 flex flex-col">
                        <p className="text-body-lg text-text-primary line-clamp-2">{c.title}</p>
                        <p className="text-caption text-text-secondary mt-1 mb-3">{c.instructor}</p>
                        <ProgressBar value={c.progress} />
                        <div className="flex items-center justify-between mt-3">
                            <span className="text-caption text-text-secondary">{c.progress}% complete</span>
                            <Button className="h-9 px-4" onClick={() => onPlay(c)}>
                                <PlayCircle size={16} /> {c.progress > 0 ? "Resume" : "Start"}
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}

// ── Course Player ────────────────────────────────────────────────────────
function CoursePlayer({ course, onBack }) {
    const [tab, setTab] = useState("notes");
    const allLessons = (course.modules || []).flatMap((m) => m.lessons);
    const [activeLesson, setActiveLesson] = useState(allLessons[0]);

    return (
        <div className="space-y-4">
            <button onClick={onBack} className="flex items-center gap-1 text-caption font-semibold text-text-secondary hover:text-primary">
                <ChevronLeft size={16} /> Back to course
            </button>
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-0 overflow-hidden">
                        <div className="aspect-video bg-gray-900 flex items-center justify-center text-white">
                            <PlayCircle size={56} className="opacity-80" />
                        </div>
                        <div className="p-5">
                            <p className="text-body-lg text-text-primary">{activeLesson?.title || course.title}</p>
                            <p className="text-caption text-text-secondary mt-1">{course.title}</p>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex gap-2 border-b border-border-light pb-2 mb-4">
                            {[
                                { id: "notes", label: "Notes", icon: StickyNote },
                                { id: "resources", label: "Resources", icon: Paperclip },
                                { id: "discussion", label: "Discussion", icon: MessageSquare },
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
                        {tab === "notes" && (
                            <Input as="textarea" rows={5} placeholder="Jot down notes for this lesson..." />
                        )}
                        {tab === "resources" && (
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-body text-text-secondary"><FileText size={16} /> Lesson slides.pdf</li>
                                <li className="flex items-center gap-2 text-body text-text-secondary"><FileText size={16} /> Starter files.zip</li>
                            </ul>
                        )}
                        {tab === "discussion" && (
                            <EmptyState icon={MessageSquare} title="No discussion yet" sub="Be the first to ask a question about this lesson." />
                        )}
                    </Card>
                </div>

                <Card>
                    <h3 className="text-h3 text-text-primary mb-2">Curriculum</h3>
                    <p className="text-caption text-text-secondary mb-4">Lesson progress tracker</p>
                    <ProgressBar value={course.progress} />
                    <p className="text-caption text-text-secondary mt-2 mb-4">{course.progress}% complete</p>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {(course.modules || []).map((m) => (
                            <div key={m.id}>
                                <p className="text-caption font-semibold text-text-secondary mb-2">{m.title}</p>
                                <ul className="space-y-1">
                                    {m.lessons.map((l) => (
                                        <li key={l.id}>
                                            <button
                                                onClick={() => setActiveLesson(l)}
                                                className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-body ${activeLesson?.id === l.id ? "bg-active-bg text-primary" : "hover:bg-app text-text-primary"
                                                    }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    {l.completed ? <CheckCircle2 size={15} className="text-success" /> : <PlayCircle size={15} />}
                                                    {l.title}
                                                </span>
                                                <span className="text-caption text-text-secondary">{l.duration}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

// ── Assignments ───────────────────────────────────────────────────────────
function Assignments() {
    const toneFor = { Pending: "warning", Submitted: "info", Graded: "success" };

    if (assignments.length === 0) {
        return (
            <div className="flex flex-col items-center text-center py-12">
                <Illustration
                    src={studentDashboardImg}
                    webp={studentDashboardWebp}
                    alt="Illustration of a student studying, representing no assignments due"
                    size="dashboard"
                    className="mb-4"
                />
                <p className="text-h3 text-text-primary">No assignments yet</p>
                <p className="text-body text-text-secondary mt-1 max-w-sm">New assignments from your enrolled courses will show up here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {assignments.map((a) => (
                <Card key={a.id} className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-active-bg text-primary flex items-center justify-center"><ClipboardList size={20} /></div>
                        <div>
                            <p className="text-body-lg text-text-primary">{a.title}</p>
                            <p className="text-caption text-text-secondary">{a.course} · Due {a.dueDate}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {a.grade && <Badge tone="success">Grade: {a.grade}</Badge>}
                        <Badge tone={toneFor[a.status]}>{a.status}</Badge>
                        {a.status === "Pending" && <Button className="h-9 px-4">Submit</Button>}
                    </div>
                </Card>
            ))}
        </div>
    );
}

// ── Quizzes ───────────────────────────────────────────────────────────────
function Quizzes() {
    return (
        <div className="grid sm:grid-cols-2 gap-5">
            {quizzes.map((q) => (
                <Card key={q.id}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 rounded-xl bg-active-bg text-primary flex items-center justify-center"><HelpCircle size={20} /></div>
                        <Badge tone={q.status === "Completed" ? "success" : "warning"}>{q.status}</Badge>
                    </div>
                    <p className="text-body-lg text-text-primary">{q.title}</p>
                    <p className="text-caption text-text-secondary mb-3">{q.course}</p>
                    <div className="flex items-center justify-between text-caption text-text-secondary">
                        <span>{q.questions} questions · {q.duration}</span>
                        {q.score && <span className="font-semibold text-success">{q.score}</span>}
                    </div>
                    {q.status === "Pending" && <Button className="mt-4 h-9 px-4" full>Start Quiz</Button>}
                </Card>
            ))}
        </div>
    );
}

// ── Certificates ──────────────────────────────────────────────────────────
function Certificates() {
    return (
        <div className="space-y-6">
            <Card className="bg-primary-gradient text-white flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden">
                <div className="sm:flex-1">
                    <h2 className="text-h2 text-white">Your Achievements</h2>
                    <p className="text-body text-white/80 mt-1 max-w-md">
                        Every completed course adds a verified credential to your profile. Keep learning to unlock more.
                    </p>
                </div>
                <Illustration
                    src={certificatesImg}
                    webp={certificatesWebp}
                    alt="Illustration of a graduation cap, certificate, and trophy representing achievements"
                    size="achievement"
                    animate="scale"
                    framed
                    className="hidden sm:block shrink-0"
                />
            </Card>

            {certificates.length === 0 ? (
                <div className="flex flex-col items-center text-center py-12">
                    <Illustration
                        src={certificatesImg}
                        webp={certificatesWebp}
                        alt="Illustration of a graduation cap and certificate, representing no certificates yet"
                        size="achievement"
                        className="mb-4"
                    />
                    <p className="text-h3 text-text-primary">No certificates yet</p>
                    <p className="text-body text-text-secondary mt-1 max-w-sm">Complete a course to earn your first certificate.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {certificates.map((c) => (
                        <Card key={c.id} className="text-center transition-transform duration-300 hover:-translate-y-1">
                            <div className="w-14 h-14 rounded-2xl bg-primary-gradient text-white flex items-center justify-center mx-auto mb-4">
                                <Award size={26} />
                            </div>
                            <p className="text-body-lg text-text-primary">{c.course}</p>
                            <p className="text-caption text-text-secondary mt-1">Issued {c.issuedOn}</p>
                            <p className="text-caption text-text-secondary">ID: {c.credentialId}</p>
                            <Button variant="outline" className="mt-4 h-9 px-4" full>Download</Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Notifications ─────────────────────────────────────────────────────────
function Notifications() {
    return (
        <div className="space-y-3 max-w-2xl">
            {mockNotifications.map((n) => (
                <Card key={n.id} className={`flex items-start gap-3 ${!n.read ? "border-primary/30" : ""}`}>
                    <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${n.read ? "bg-border-light" : "bg-primary"}`} />
                    <div className="flex-1">
                        <p className="text-body-lg text-text-primary">{n.title}</p>
                        <p className="text-caption text-text-secondary mt-0.5">{n.body}</p>
                    </div>
                    <span className="text-caption text-text-secondary shrink-0">{n.time}</span>
                </Card>
            ))}
        </div>
    );
}

// ── Course Reviews ────────────────────────────────────────────────────────
function CourseReviews() {
    const [rating, setRating] = useState(5);
    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                {reviews.map((r) => (
                    <Card key={r.id}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Avatar name={r.student} size={32} />
                                <div>
                                    <p className="text-body-lg text-text-primary">{r.student}</p>
                                    <p className="text-caption text-text-secondary">{r.course}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} size={14} className={i < r.rating ? "text-warning fill-warning" : "text-border-light"} />
                                ))}
                            </div>
                        </div>
                        <p className="text-body text-text-secondary">{r.comment}</p>
                    </Card>
                ))}
            </div>
            <Card>
                <h3 className="text-h3 text-text-primary mb-3">Leave a Review</h3>
                <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <button key={i} onClick={() => setRating(i + 1)}>
                            <Star size={22} className={i < rating ? "text-warning fill-warning" : "text-border-light"} />
                        </button>
                    ))}
                </div>
                <Input as="textarea" rows={4} placeholder="Share your experience with this course..." />
                <Button full>Submit Review</Button>
            </Card>
        </div>
    );
}

// ── Discussion Forum ──────────────────────────────────────────────────────
function DiscussionForum() {
    return (
        <div className="space-y-4 max-w-3xl">
            {discussions.map((d) => (
                <Card key={d.id} className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <Avatar name={d.author} size={36} />
                        <div>
                            <p className="text-body-lg text-text-primary">{d.title}</p>
                            <p className="text-caption text-text-secondary">{d.course} · by {d.author}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-caption text-text-secondary">{d.replies} replies</p>
                        <p className="text-caption text-text-secondary">{d.lastActivity}</p>
                    </div>
                </Card>
            ))}
        </div>
    );
}

// ── Root ──────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
    const [active, setActive] = useState("dashboard");
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [playingCourse, setPlayingCourse] = useState(null);

    const openCourse = (course) => {
        setSelectedCourse(course);
        setPlayingCourse(null);
    };
    const playCourse = (course) => setPlayingCourse(course);
    const goTo = (id) => {
        setSelectedCourse(null);
        setPlayingCourse(null);
        setActive(id);
    };

    const renderPage = () => {
        if (playingCourse) return <CoursePlayer course={playingCourse} onBack={() => setPlayingCourse(null)} />;
        if (selectedCourse) return <CourseDetails course={selectedCourse} onBack={() => setSelectedCourse(null)} onPlay={playCourse} />;

        switch (active) {
            case "dashboard": return <Dashboard goTo={goTo} openCourse={openCourse} />;
            case "browse": return <BrowseCourses openCourse={openCourse} />;
            case "enrolled": return <EnrolledCourses openCourse={openCourse} onPlay={playCourse} />;
            case "assignments": return <Assignments />;
            case "quizzes": return <Quizzes />;
            case "certificates": return <Certificates />;
            case "notifications": return <Notifications />;
            case "reviews": return <CourseReviews />;
            case "discussions": return <DiscussionForum />;
            default: return <Dashboard goTo={goTo} openCourse={openCourse} />;
        }
    };

    return (
        <DashboardShell
            roleLabel="Student Panel"
            navItems={navItems}
            active={active}
            onNavigate={goTo}
            userName="Student"
        >
            {!selectedCourse && !playingCourse && active !== "courseDetails" && (
                <PageHeader title={navItems.find((n) => n.id === active)?.label || "Dashboard"} />
            )}
            {renderPage()}
        </DashboardShell>
    );
}
