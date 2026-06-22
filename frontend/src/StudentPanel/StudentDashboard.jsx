import { useEffect, useRef, useState } from "react";
import {
    LayoutDashboard, Compass, BookOpen, PlayCircle, ClipboardList,
    HelpCircle, Award, Bell, MessageSquare, Star, Search, Flame,
    CheckCircle2, Clock, ChevronLeft, FileText, StickyNote, Paperclip,
    X, Megaphone, Globe, BarChart3,
} from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import Illustration from "../components/Illustration";
import { Card, StatCard, Button, Badge, Input, ProgressBar, PageHeader, EmptyState, Avatar } from "../components/ui";
import studentDashboardImg from "../assets/illustrations/student-dashboard.png";
import studentDashboardWebp from "../assets/illustrations/student-dashboard.webp";
import certificatesImg from "../assets/illustrations/certificates.png";
import certificatesWebp from "../assets/illustrations/certificates.webp";
import { courseService } from "../services/courseService.js";
import { assignmentService } from "../services/assignmentSubmission.js";
import * as announcementService from "../services/announcementService.js";
import {
    quizzes, certificates, reviews, discussions,
    notifications as mockNotifications, learningStreak,
} from "../mockData/lmsData";

const navItems = [
    { id: "dashboard",     label: "Dashboard",        icon: LayoutDashboard },
    { id: "browse",        label: "Browse Courses",   icon: Compass },
    { id: "enrolled",      label: "My Courses",       icon: BookOpen },
    { id: "assignments",   label: "Assignments",      icon: ClipboardList },
    { id: "quizzes",       label: "Quizzes",          icon: HelpCircle },
    { id: "certificates",  label: "Certificates",     icon: Award },
    { id: "notifications", label: "Notifications",    icon: Bell },
    { id: "reviews",       label: "Course Reviews",   icon: Star },
    { id: "discussions",   label: "Discussion Forum", icon: MessageSquare },
];

// ── Enroll Modal ──────────────────────────────────────────────────────────
function EnrollModal({ course, onClose, onEnrolled }) {
    const [loading, setLoading] = useState(false);
    const [enrolled, setEnrolled] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const handle = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handle);
        return () => window.removeEventListener("keydown", handle);
    }, [onClose]);

    const handleEnroll = async () => {
        setLoading(true); setError("");
        try {
            await courseService.enrollCourse(course._id);
            setEnrolled(true);
            onEnrolled(course._id);
        } catch { setError("Enrollment failed. Please try again."); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="relative">
                    <img src={course.image || "/placeholder-course.jpg"} alt={course.title} className="w-full h-44 object-cover" />
                    <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60">
                        <X size={16} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <Badge tone="primary">{course.category}</Badge>
                        <h2 className="text-h2 text-text-primary mt-2">{course.title}</h2>
                        <p className="text-caption text-text-secondary mt-1">{course.instructorName?.name || "Instructor"}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-caption text-text-secondary">
                            <Star size={14} className="text-warning fill-warning" />{course.ratings || 0} rating
                        </div>
                        <span className="text-h3 text-text-primary">${course.price || 0}</span>
                    </div>
                    {course.description && <p className="text-body text-text-secondary line-clamp-3">{course.description}</p>}
                    {error && <p className="text-caption text-red-500">{error}</p>}
                    {enrolled ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                            <CheckCircle2 size={36} className="text-success" />
                            <p className="text-body-lg text-text-primary font-semibold">You're enrolled!</p>
                            <p className="text-caption text-text-secondary">Go to My Courses to start learning.</p>
                            <Button onClick={onClose} className="mt-2">Close</Button>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <Button full onClick={handleEnroll} disabled={loading}>
                                {loading ? "Enrolling…" : `Enroll Now — $${course.price || 0}`}
                            </Button>
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Dashboard ─────────────────────────────────────────────────────────────
function Dashboard({ goTo, openCourse, enrolledCourses, assignments = [] }) {
    const overallProgress = enrolledCourses.length
        ? Math.round(enrolledCourses.reduce((s, c) => s + (c.progress || 0), 0) / enrolledCourses.length) : 0;
    const continueCourse = enrolledCourses.find((c) => (c.progress || 0) > 0 && (c.progress || 0) < 100) || enrolledCourses[0];

    return (
        <div className="space-y-6">
            <Card className="bg-primary-gradient text-white flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden relative">
                <div className="md:flex-1">
                    <h2 className="text-h2 text-white">Unlock 1,000+ Premium Courses Today</h2>
                    <p className="text-body text-white/80 mt-1 max-w-md">Learn from industry experts with exclusive content designed to boost your skills.</p>
                    <Button variant="subtle" className="mt-4 bg-white text-primary hover:bg-white/90" onClick={() => goTo("browse")}>Browse Courses</Button>
                </div>
                <Illustration src={studentDashboardImg} webp={studentDashboardWebp} alt="Student learning" size="dashboard" animate="float" framed className="hidden md:block shrink-0" />
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
                    {continueCourse ? (
                        <div className="flex flex-col sm:flex-row gap-4 items-center bg-app rounded-2xl p-4">
                            <img src={continueCourse.image || "/placeholder-course.jpg"} alt={continueCourse.title} className="w-full sm:w-40 h-28 object-cover rounded-xl" />
                            <div className="flex-1 w-full">
                                <p className="text-body-lg text-text-primary">{continueCourse.title}</p>
                                <p className="text-caption text-text-secondary mb-2">{continueCourse.instructorName?.name || "Instructor"}</p>
                                <ProgressBar value={continueCourse.progress || 0} />
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-caption text-text-secondary">{continueCourse.progress || 0}% complete</span>
                                    <Button variant="primary" className="h-9 px-4" onClick={() => openCourse(continueCourse)}>
                                        <PlayCircle size={16} /> Resume
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-body text-text-secondary">No enrolled courses yet. Browse and enroll to get started!</p>
                    )}
                    <div className="mt-6 space-y-3">
                        <h4 className="text-body-lg text-text-primary">Upcoming Deadlines</h4>
                        {assignments.filter((a) => a.status === "Pending").slice(0, 2).length > 0
                            ? assignments.filter((a) => a.status === "Pending").slice(0, 2).map((a) => (
                                <div key={a.id} className="flex items-center justify-between border border-border-light rounded-xl px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <Clock size={18} className="text-warning" />
                                        <div>
                                            <p className="text-body text-text-primary">{a.title}</p>
                                            <p className="text-caption text-text-secondary">{a.course}</p>
                                        </div>
                                    </div>
                                    <Badge tone="warning">Due {a.dueDate}</Badge>
                                </div>
                            ))
                            : <p className="text-caption text-text-secondary">No upcoming deadlines.</p>
                        }
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

// ── Browse Courses ────────────────────────────────────────────────────────
function BrowseCourses({ enrolledIds, onEnrolled }) {
    const [query, setQuery] = useState("");
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalCourse, setModalCourse] = useState(null);

    useEffect(() => {
        (async () => {
            try { setLoading(true); const r = await courseService.getCourses(); setCourses(r.course || []); }
            catch (e) { console.error(e); } finally { setLoading(false); }
        })();
    }, []);

    const filtered = courses.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));
    if (loading) return <p className="text-body text-text-secondary">Loading courses…</p>;

    return (
        <div className="space-y-6">
            {modalCourse && (
                <EnrollModal course={modalCourse} onClose={() => setModalCourse(null)}
                    onEnrolled={(id) => { onEnrolled(id); setModalCourse(null); }} />
            )}
            <div className="relative max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input value={query} onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by topic, title, or instructor"
                    className="w-full h-12 rounded-input border border-border-light pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((c) => {
                    const alreadyEnrolled = enrolledIds.has(c._id);
                    return (
                        <Card key={c._id} className="p-0 overflow-hidden flex flex-col hover:shadow-soft transition">
                            <img src={c.image || "/placeholder-course.jpg"} alt={c.title}
                                className="w-full h-36 object-cover cursor-pointer"
                                onClick={() => !alreadyEnrolled && setModalCourse(c)} />
                            <div className="p-4 flex-1 flex flex-col">
                                <Badge tone="primary">{c.category}</Badge>
                                <p className="text-body-lg text-text-primary mt-2 line-clamp-2">{c.title}</p>
                                <p className="text-caption text-text-secondary mt-1">{c.instructorName?.name || "Instructor"}</p>
                                <div className="flex items-center gap-1 mt-2 text-caption text-text-secondary">
                                    <Star size={14} className="text-warning fill-warning" />{c.ratings || 0}
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-h3 text-text-primary">${c.price || 0}</span>
                                    {alreadyEnrolled
                                        ? <Badge tone="success">Enrolled ✓</Badge>
                                        : <Button className="h-9 px-4" onClick={() => setModalCourse(c)}>Enroll</Button>}
                                </div>
                            </div>
                        </Card>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="sm:col-span-2 lg:col-span-3 flex flex-col items-center text-center py-12">
                        <p className="text-h3 text-text-primary">No courses found</p>
                        <p className="text-body text-text-secondary mt-1 max-w-sm">Try a different search term.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Course Details ────────────────────────────────────────────────────────
function CourseDetails({ course, onBack, onPlay, enrolledIds, onEnrolled }) {
    const [showModal, setShowModal] = useState(false);
    const isEnrolled = enrolledIds.has(course._id || course.id);
    return (
        <div className="space-y-6">
            {showModal && <EnrollModal course={course} onClose={() => setShowModal(false)}
                onEnrolled={(id) => { onEnrolled(id); setShowModal(false); }} />}
            <button onClick={onBack} className="flex items-center gap-1 text-caption font-semibold text-text-secondary hover:text-primary">
                <ChevronLeft size={16} /> Back
            </button>
            <Card className="p-0 overflow-hidden">
                <img src={course.image || course.thumbnail} alt={course.title} className="w-full h-56 object-cover" />
                <div className="p-6">
                    <Badge tone="primary">{course.category}</Badge>
                    <h2 className="text-h2 text-text-primary mt-2">{course.title}</h2>
                    <p className="text-body text-text-secondary mt-2">{course.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-caption text-text-secondary">
                        <span>By {course.instructorName?.name || course.instructor}</span>
                        <span className="flex items-center gap-1"><Star size={14} className="text-warning fill-warning" />{course.ratings || 0}</span>
                        <span>{course.duration}</span>
                        <Badge tone="info">{course.complexity || course.level}</Badge>
                    </div>
                    <div className="mt-6 flex items-center gap-3">
                        {isEnrolled
                            ? <Button onClick={() => onPlay(course)}><PlayCircle size={18} /> Continue Learning</Button>
                            : <Button onClick={() => setShowModal(true)}>Enroll Now — ${course.price || 0}</Button>}
                        <Button variant="outline">Add to Wishlist</Button>
                    </div>
                </div>
            </Card>
            <Card>
                <h3 className="text-h3 text-text-primary mb-4">Course Curriculum</h3>
                {(course.videos || []).length > 0 ? (
                    <div className="border border-border-light rounded-xl p-4">
                        <p className="text-body-lg text-text-primary mb-2">Course Videos</p>
                        <ul className="space-y-2">
                            {course.videos.map((v) => (
                                <li key={v._id} className="flex items-center justify-between text-body text-text-secondary">
                                    <span className="flex items-center gap-2"><PlayCircle size={16} />{v.title}</span>
                                    <span className="text-caption">{v.duration}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : <p className="text-caption text-text-secondary">Curriculum will be available once published.</p>}
            </Card>
        </div>
    );
}

// ── My Courses — instructor-style horizontal cards ────────────────────────
function EnrolledCourses({ enrolledCourses, openCourse, onPlay, loading }) {
    if (loading) return <p className="text-body text-text-secondary">Loading your courses…</p>;
    if (enrolledCourses.length === 0) return (
        <div className="flex flex-col items-center text-center py-12">
            <p className="text-h3 text-text-primary">No courses yet</p>
            <p className="text-body text-text-secondary mt-1 max-w-sm">Browse courses and enroll to start learning.</p>
        </div>
    );

    return (
        <div className="space-y-4">
            {enrolledCourses.map((c) => {
                const prog = c.progress || 0;
                const statusTone = prog === 100 ? "success" : prog > 0 ? "info" : "warning";
                const statusLabel = prog === 100 ? "Completed" : prog > 0 ? "In Progress" : "Not Started";
                return (
                    <Card key={c._id || c.id} className="flex items-center gap-4 flex-wrap">
                        {/* Thumbnail */}
                        <img
                            src={c.image || "/placeholder-course.jpg"} alt={c.title}
                            className="w-24 object-cover rounded-xl cursor-pointer shrink-0"
                            style={{ height: "72px" }}
                            onClick={() => openCourse(c)}
                        />

                        {/* Info block */}
                        <div className="flex-1 min-w-[180px]">
                            <p className="text-body-lg text-text-primary cursor-pointer hover:text-primary transition-colors"
                                onClick={() => openCourse(c)}>{c.title}</p>
                            <p className="text-caption text-text-secondary mt-0.5">
                                {c.category} · {c.instructorName?.name || "Instructor"}
                            </p>
                            {/* Meta */}
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                {c.complexity && <span className="flex items-center gap-1 text-caption text-text-secondary"><BarChart3 size={12} />{c.complexity}</span>}
                                {c.language && <span className="flex items-center gap-1 text-caption text-text-secondary"><Globe size={12} />{c.language}</span>}
                                {c.videos?.length > 0 && <span className="flex items-center gap-1 text-caption text-text-secondary"><PlayCircle size={12} />{c.videos.length} video{c.videos.length !== 1 ? "s" : ""}</span>}
                            </div>
                            {/* Progress */}
                            <div className="mt-2 max-w-xs">
                                <ProgressBar value={prog} />
                                <p className="text-caption text-text-secondary mt-1">{prog}% complete</p>
                            </div>
                        </div>

                        {/* Status */}
                        <Badge tone={statusTone}>{statusLabel}</Badge>

                        {/* CTA */}
                        <Button className="h-9 px-4 shrink-0" onClick={() => onPlay(c)}>
                            <PlayCircle size={16} />{prog > 0 ? "Resume" : "Start"}
                        </Button>
                    </Card>
                );
            })}
        </div>
    );
}

// ── Course Player — real video progress tracking ──────────────────────────
function CoursePlayer({ course, onBack, onProgressUpdate }) {
    const [tab, setTab] = useState("notes");
    const videos = course.videos || [];
    const [completedIds, setCompletedIds] = useState(new Set());
    const [activeVideo, setActiveVideo] = useState(videos[0] || null);
    const videoRef = useRef(null);

    const progress = videos.length > 0 ? Math.round((completedIds.size / videos.length) * 100) : 0;

    // Mark video complete once 90% watched
    const handleTimeUpdate = () => {
        const vid = videoRef.current;
        if (!vid || !activeVideo) return;
        if (vid.duration && vid.currentTime / vid.duration >= 0.9) {
            setCompletedIds((prev) => {
                if (prev.has(activeVideo._id)) return prev;
                const next = new Set(prev);
                next.add(activeVideo._id);
                const newProg = Math.round((next.size / videos.length) * 100);
                if (onProgressUpdate) onProgressUpdate(course._id, newProg);
                return next;
            });
        }
    };

    // Auto-advance to next video on end
    const handleEnded = () => {
        if (!activeVideo) return;
        const idx = videos.findIndex((v) => v._id === activeVideo._id);
        if (idx < videos.length - 1) setActiveVideo(videos[idx + 1]);
    };

    return (
        <div className="space-y-4">
            <button onClick={onBack} className="flex items-center gap-1 text-caption font-semibold text-text-secondary hover:text-primary">
                <ChevronLeft size={16} /> Back to course
            </button>
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-0 overflow-hidden">
                        {activeVideo?.url ? (
                            <video ref={videoRef} key={activeVideo._id} src={activeVideo.url} controls
                                className="w-full aspect-video bg-gray-900"
                                onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} />
                        ) : (
                            <div className="aspect-video bg-gray-900 flex items-center justify-center text-white">
                                <PlayCircle size={56} className="opacity-80" />
                            </div>
                        )}
                        <div className="p-5">
                            <p className="text-body-lg text-text-primary">{activeVideo?.title || course.title}</p>
                            <p className="text-caption text-text-secondary mt-1">{course.title}</p>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex gap-2 border-b border-border-light pb-2 mb-4">
                            {[{ id: "notes", label: "Notes", icon: StickyNote }, { id: "resources", label: "Resources", icon: Paperclip }, { id: "discussion", label: "Discussion", icon: MessageSquare }].map((t) => (
                                <button key={t.id} onClick={() => setTab(t.id)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${tab === t.id ? "bg-active-bg text-primary" : "text-text-secondary hover:bg-active-bg"}`}>
                                    <t.icon size={15} /> {t.label}
                                </button>
                            ))}
                        </div>
                        {tab === "notes" && <Input as="textarea" rows={5} placeholder="Jot down notes for this lesson..." />}
                        {tab === "resources" && (
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-body text-text-secondary"><FileText size={16} /> Lesson slides.pdf</li>
                                <li className="flex items-center gap-2 text-body text-text-secondary"><FileText size={16} /> Starter files.zip</li>
                            </ul>
                        )}
                        {tab === "discussion" && <EmptyState icon={MessageSquare} title="No discussion yet" sub="Be the first to ask a question." />}
                    </Card>
                </div>

                {/* Sidebar with live progress */}
                <Card>
                    <h3 className="text-h3 text-text-primary mb-1">Course Videos</h3>
                    <p className="text-caption text-text-secondary mb-3">{completedIds.size} / {videos.length} watched</p>
                    <ProgressBar value={progress} />
                    <p className="text-caption text-text-secondary mt-1 mb-4">{progress}% complete</p>

                    {videos.length === 0 ? <p className="text-caption text-text-secondary">No videos uploaded yet.</p> : (
                        <div className="space-y-1 max-h-96 overflow-y-auto">
                            {videos.map((v) => {
                                const isDone = completedIds.has(v._id);
                                const isActive = activeVideo?._id === v._id;
                                return (
                                    <button key={v._id} onClick={() => setActiveVideo(v)}
                                        className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-body transition-colors ${isActive ? "bg-active-bg text-primary" : "hover:bg-app text-text-primary"}`}>
                                        <span className="flex items-center gap-2">
                                            {isDone
                                                ? <CheckCircle2 size={15} className="text-success shrink-0" />
                                                : <PlayCircle size={15} className="shrink-0" />}
                                            <span className="line-clamp-1">{v.title}</span>
                                        </span>
                                        <span className="text-caption text-text-secondary shrink-0 ml-2">{v.duration}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

// ── Assignments ───────────────────────────────────────────────────────────
function Assignments({ assignments = [], loading, onReload }) {
    const [submitting, setSubmitting] = useState(null);
    const [submissionText, setSubmissionText] = useState("");
    const [fileUrl, setFileUrl] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const toneFor = { Pending: "warning", Submitted: "info", Graded: "success" };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!submissionText && !fileUrl) { setError("Fill in text or URL."); return; }
        setBusy(true); setError("");
        try {
            await assignmentService.submitAssignment({ assignmentId: submitting.id, submissionText, fileUrl });
            setSuccess(true);
            setTimeout(() => { setSubmitting(null); setSubmissionText(""); setFileUrl(""); setSuccess(false); onReload(); }, 1500);
        } catch (err) { setError(err.response?.data?.message || "Failed to submit."); }
        finally { setBusy(false); }
    };

    if (loading) return <p className="text-body text-text-secondary">Loading assignments…</p>;
    if (assignments.length === 0) return (
        <div className="flex flex-col items-center text-center py-12">
            <p className="text-h3 text-text-primary">No assignments yet</p>
            <p className="text-body text-text-secondary mt-1 max-w-sm">New assignments from your enrolled courses will show up here.</p>
        </div>
    );

    return (
        <div className="space-y-4">
            {assignments.map((a) => (
                <Card key={a.id} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-active-bg text-primary flex items-center justify-center shrink-0"><ClipboardList size={20} /></div>
                            <div>
                                <p className="text-body-lg text-text-primary font-semibold">{a.title}</p>
                                <p className="text-caption text-text-secondary">{a.course} · Due {a.dueDate}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {a.grade && <Badge tone="success">Grade: {a.grade}</Badge>}
                            <Badge tone={toneFor[a.status]}>{a.status}</Badge>
                            {a.status === "Pending" && <Button className="h-9 px-4" onClick={() => setSubmitting(a)}>Submit</Button>}
                            <button onClick={() => setExpandedId(expandedId === a.id ? null : a.id)} className="text-caption text-primary font-medium hover:underline">
                                {expandedId === a.id ? "Hide" : "Details"}
                            </button>
                        </div>
                    </div>
                    {expandedId === a.id && (
                        <div className="border-t border-border-light pt-3 space-y-2 text-sm">
                            {a.description && <p className="text-text-secondary">{a.description}</p>}
                            <p><span className="font-semibold text-text-primary">Max Marks:</span> <span className="text-text-secondary">{a.maxMarks || 100}</span></p>
                        </div>
                    )}
                </Card>
            ))}

            {submitting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && setSubmitting(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="bg-primary-gradient text-white p-5 flex items-center justify-between">
                            <div><h3 className="text-h3 text-white">Submit Assignment</h3><p className="text-caption text-white/80 mt-0.5">{submitting.title}</p></div>
                            <button onClick={() => setSubmitting(null)} className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>}
                            {success ? (
                                <div className="flex flex-col items-center py-6 gap-2">
                                    <CheckCircle2 size={48} className="text-success" />
                                    <p className="text-body-lg font-bold text-text-primary">Submitted!</p>
                                </div>
                            ) : (
                                <>
                                    <Input as="textarea" rows={4} value={submissionText} onChange={(e) => setSubmissionText(e.target.value)} placeholder="Write your submission…" label="Submission Text" />
                                    <Input type="text" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="GitHub / Drive link…" label="File URL" />
                                    <div className="flex gap-3 pt-2">
                                        <Button full type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit Assignment"}</Button>
                                        <Button variant="outline" type="button" onClick={() => setSubmitting(null)}>Cancel</Button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            )}
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
                    <p className="text-body text-white/80 mt-1 max-w-md">Every completed course adds a verified credential to your profile.</p>
                </div>
                <Illustration src={certificatesImg} webp={certificatesWebp} alt="Certificates" size="achievement" animate="scale" framed className="hidden sm:block shrink-0" />
            </Card>
            {certificates.length === 0 ? (
                <div className="flex flex-col items-center text-center py-12">
                    <p className="text-h3 text-text-primary">No certificates yet</p>
                    <p className="text-body text-text-secondary mt-1 max-w-sm">Complete a course to earn your first certificate.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {certificates.map((c) => (
                        <Card key={c.id} className="text-center hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-14 h-14 rounded-2xl bg-primary-gradient text-white flex items-center justify-center mx-auto mb-4"><Award size={26} /></div>
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
    const [liveAnnouncements, setLiveAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        (async () => {
            try { const r = await announcementService.getAnnouncements(); setLiveAnnouncements(r?.announcements || []); }
            catch (e) { console.error(e); } finally { setLoading(false); }
        })();
    }, []);
    return (
        <div className="space-y-3 max-w-2xl">
            {loading ? <p className="text-caption text-text-secondary">Loading…</p> : liveAnnouncements.map((a) => (
                <Card key={a._id} className="flex items-start gap-3 border-primary/40 bg-active-bg/40">
                    <div className="w-2.5 h-2.5 rounded-full mt-2 shrink-0 bg-primary" />
                    <div className="flex-1">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5 mb-1"><Megaphone size={11} /> New Announcement</span>
                        <p className="text-body-lg text-text-primary">{a.title}</p>
                        <p className="text-caption text-text-secondary mt-0.5">{a.body}</p>
                    </div>
                    <span className="text-caption text-text-secondary shrink-0">{new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </Card>
            ))}
            {liveAnnouncements.length > 0 && mockNotifications.length > 0 && (
                <p className="text-caption text-text-secondary pt-2 border-t border-border-light">General Notifications</p>
            )}
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
                                <div><p className="text-body-lg text-text-primary">{r.student}</p><p className="text-caption text-text-secondary">{r.course}</p></div>
                            </div>
                            <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className={i < r.rating ? "text-warning fill-warning" : "text-border-light"} />)}
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
                <Input as="textarea" rows={4} placeholder="Share your experience…" />
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
                        <div><p className="text-body-lg text-text-primary">{d.title}</p><p className="text-caption text-text-secondary">{d.course} · by {d.author}</p></div>
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
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [enrolledIds, setEnrolledIds] = useState(new Set());
    const [enrolledLoading, setEnrolledLoading] = useState(true);
    const [assignmentsList, setAssignmentsList] = useState([]);
    const [submissionsList, setSubmissionsList] = useState([]);
    const [assignmentsLoading, setAssignmentsLoading] = useState(true);

    const fetchEnrolled = async () => {
        try {
            setEnrolledLoading(true);
            const res = await courseService.getEnrolledCourses();
            const courses = res.courses || [];
            setEnrolledCourses(courses);
            setEnrolledIds(new Set(courses.map((c) => c._id)));
        } catch (err) { console.error(err); } finally { setEnrolledLoading(false); }
    };

    const fetchAssignmentsAndSubmissions = async () => {
        try {
            setAssignmentsLoading(true);
            const [ar, sr] = await Promise.all([assignmentService.getStudentAssignments(), assignmentService.getMySubmissions()]);
            setAssignmentsList(ar.assignments || []);
            setSubmissionsList(sr.submissions || []);
        } catch (err) { console.error(err); } finally { setAssignmentsLoading(false); }
    };

    useEffect(() => { fetchEnrolled(); fetchAssignmentsAndSubmissions(); }, []);

    const handleEnrolled = async (courseId) => {
        setEnrolledIds((prev) => new Set([...prev, courseId]));
        await fetchEnrolled();
        fetchAssignmentsAndSubmissions();
    };

    // Live progress update from CoursePlayer — no API call needed, just local state
    const handleProgressUpdate = (courseId, newProgress) => {
        setEnrolledCourses((prev) => prev.map((c) => c._id === courseId ? { ...c, progress: newProgress } : c));
        setPlayingCourse((prev) => prev ? { ...prev, progress: newProgress } : prev);
    };

    const openCourse = (course) => { setSelectedCourse(course); setPlayingCourse(null); };
    const playCourse = (course) => setPlayingCourse(course);
    const goTo = (id) => { setSelectedCourse(null); setPlayingCourse(null); setActive(id); };

    const mergedAssignments = assignmentsList.map((a) => {
        const sub = submissionsList.find((s) => s.assignmentId?._id === a._id || s.assignmentId === a._id);
        let status = "Pending", grade = null, feedback = null, submittedText = null, submittedFileUrl = null;
        if (sub) {
            if (sub.status === "graded") { status = "Graded"; grade = `${sub.marks}/${a.maxMarks}`; feedback = sub.feedback; }
            else status = "Submitted";
            submittedText = sub.submissionText; submittedFileUrl = sub.fileUrl;
        }
        return {
            id: a._id, title: a.title, description: a.description,
            course: a.courseId?.title || "Unknown Course",
            dueDate: new Date(a.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
            maxMarks: a.maxMarks, status, grade, feedback, submittedText, submittedFileUrl,
        };
    });

    const renderPage = () => {
        if (playingCourse) return <CoursePlayer course={playingCourse} onBack={() => setPlayingCourse(null)} onProgressUpdate={handleProgressUpdate} />;
        if (selectedCourse) return <CourseDetails course={selectedCourse} onBack={() => setSelectedCourse(null)} onPlay={playCourse} enrolledIds={enrolledIds} onEnrolled={handleEnrolled} />;
        switch (active) {
            case "dashboard":    return <Dashboard goTo={goTo} openCourse={openCourse} enrolledCourses={enrolledCourses} assignments={mergedAssignments} />;
            case "browse":       return <BrowseCourses enrolledIds={enrolledIds} onEnrolled={handleEnrolled} />;
            case "enrolled":     return <EnrolledCourses enrolledCourses={enrolledCourses} openCourse={openCourse} onPlay={playCourse} loading={enrolledLoading} />;
            case "assignments":  return <Assignments assignments={mergedAssignments} loading={assignmentsLoading} onReload={fetchAssignmentsAndSubmissions} />;
            case "quizzes":      return <Quizzes />;
            case "certificates": return <Certificates />;
            case "notifications":return <Notifications />;
            case "reviews":      return <CourseReviews />;
            case "discussions":  return <DiscussionForum />;
            default:             return <Dashboard goTo={goTo} openCourse={openCourse} enrolledCourses={enrolledCourses} />;
        }
    };

    return (
        <DashboardShell roleLabel="Student Panel" navItems={navItems} active={active} onNavigate={goTo} userName="Student">
            {!selectedCourse && !playingCourse && active !== "courseDetails" && (
                <PageHeader title={navItems.find((n) => n.id === active)?.label || "Dashboard"} />
            )}
            {renderPage()}
        </DashboardShell>
    );
}