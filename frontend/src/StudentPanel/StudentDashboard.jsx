import { useEffect, useRef, useState } from "react";
import {
    LayoutDashboard, Compass, BookOpen, PlayCircle, ClipboardList,
    HelpCircle, Award, Bell, MessageSquare, Star, Search, Flame,
    CheckCircle2, Clock, ChevronLeft, FileText, StickyNote, Paperclip,
    X, Megaphone, Globe, BarChart3, ChevronRight, Send,
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
import { quizService } from "../services/quizService.js";
import * as discussionService from "../services/discussionService.js";
import {
    quizzes as mockQuizzes, certificates, reviews, discussions,
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

    // Get current logged-in user details to prefill
    const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

    // Form fields state
    const [fullName, setFullName] = useState(loggedInUser.name || "");
    const [email, setEmail] = useState(loggedInUser.email || "");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Credit Card");
    const [cardholderName, setCardholderName] = useState(loggedInUser.name || "");
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("MM/YY");
    const [cvv, setCvv] = useState("");
    // Step state for multi‑section form
    const [step, setStep] = useState(1);

    const isPaid = (course.price || 0) > 0;

    useEffect(() => {
        const handle = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handle);
        return () => window.removeEventListener("keydown", handle);
    }, [onClose]);

    // Handle input formatting / cleaning
    const handleCardNumberChange = (e) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 16) val = val.slice(0, 16);
        // Format with spaces every 4 digits: XXXX XXXX XXXX XXXX
        const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 4) val = val.slice(0, 4);
        if (val.length >= 2) {
            val = val.slice(0, 2) + "/" + val.slice(2);
        }
        setExpiryDate(val);
    };

    const handleCvvChange = (e) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 3);
        setCvv(val);
    };

    const handleContinue = () => {
        // Validate billing information before proceeding to payment step
        if (!fullName.trim()) return fail("Full Name is required.");
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return fail("Valid Email is required.");
        if (!phoneNumber.trim()) return fail("Phone Number is required.");
        if (!address.trim()) return fail("Billing Address is required.");
        if (!city.trim()) return fail("City is required.");
        if (!state.trim()) return fail("State is required.");
        if (!zipCode.trim()) return fail("Zip Code is required.");
        setStep(2);
    };

    const handleEnroll = async (e) => {
        if (e) e.preventDefault();
        setLoading(true); 
        setError("");

        // If paid, validate fields
        if (isPaid) {
            if (!fullName.trim()) return fail("Full Name is required.");
            if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return fail("Valid Email is required.");
            if (!phoneNumber.trim()) return fail("Phone Number is required.");
            if (!address.trim()) return fail("Billing Address is required.");
            if (!city.trim()) return fail("City is required.");
            if (!state.trim()) return fail("State is required.");
            if (!zipCode.trim()) return fail("Zip Code is required.");

            if (paymentMethod === "Credit Card" || paymentMethod === "Debit Card") {
                if (!cardholderName.trim()) return fail("Cardholder Name is required.");
                const cleanCard = cardNumber.replace(/\s/g, "");
                if (cleanCard.length !== 16) return fail("Card Number must be 16 digits.");
                if (!expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) return fail("Expiry Date must be in MM/YY format.");
                if (cvv.length !== 3) return fail("CVV must be 3 digits.");
            }
        }

        try {
            const enrollmentData = isPaid ? {
                fullName,
                email,
                phoneNumber,
                address,
                city,
                state,
                zipCode,
                paymentMethod,
                cardholderName,
                transactionId: `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`
            } : {};

            await courseService.enrollCourse(course._id, enrollmentData);
            setEnrolled(true);
            onEnrolled(course._id);
        } catch (err) { 
            setError(err.response?.data?.message || "Enrollment failed. Please try again."); 
        } finally { 
            setLoading(false); 
        }
    };

    function fail(msg) {
        setError(msg);
        setLoading(false);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && onClose()}>
          <div className={`bg-white rounded-2xl shadow-xl w-full ${isPaid && !enrolled ? "max-w-2xl" : "max-w-lg"} overflow-hidden my-8`}> 
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

              {error && <p className="text-caption text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}

              {enrolled ? (
                <div className="flex flex-col items-center gap-2 py-6">
                  <CheckCircle2 size={48} className="text-success animate-bounce" />
                  <p className="text-body-lg text-text-primary font-bold">You're enrolled!</p>
                  <p className="text-caption text-text-secondary">Go to My Courses to start learning.</p>
                  <Button onClick={onClose} className="mt-4">Close</Button>
                </div>
              ) : (
                isPaid ? (
                  step === 1 ? (
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                      <div className="border-t border-border-light pt-4">
                        <h3 className="text-body-lg font-bold text-text-primary mb-3">Billing Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
                          <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input label="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+1 234 567 890" required />
                          <Input label="Street Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St" required />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} placeholder="New York" required />
                          <Input label="State" value={state} onChange={(e) => setState(e.target.value)} placeholder="NY" required />
                          <div className="col-span-2 md:col-span-1">
                            <Input label="Zip Code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="10001" required />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4 border-t border-border-light">
                        <Button onClick={handleContinue} disabled={loading}>Continue</Button>
                        <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleEnroll} className="space-y-4">
                      <div className="border-t border-border-light pt-4">
                        <h3 className="text-body-lg font-bold text-text-primary mb-3">Payment Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input label="Payment Method" as="select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Debit Card">Debit Card</option>
                            <option value="PayPal">PayPal</option>
                            <option value="UPI">UPI</option>
                          </Input>
                          {(paymentMethod === "Credit Card" || paymentMethod === "Debit Card") && (
                            <Input label="Cardholder Name" value={cardholderName} onChange={(e) => setCardholderName(e.target.value)} placeholder="John Doe" required />
                          )}
                        </div>
                        {(paymentMethod === "Credit Card" || paymentMethod === "Debit Card") ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                              <Input label="Card Number" value={cardNumber} onChange={handleCardNumberChange} placeholder="1111 2222 3333 4444" required />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Input label="Expiry" value={expiryDate} onChange={handleExpiryChange} placeholder="12/28" required />
                              <Input label="CVV" type="password" value={cvv} onChange={handleCvvChange} placeholder="123" required />
                            </div>
                          </div>
                        ) : (
                          <p className="text-caption text-text-secondary mt-1 mb-4">
                            You will be redirected or prompted for {paymentMethod} authentication upon clicking enroll.
                          </p>
                        )}
                      </div>
                      <div className="flex gap-3 pt-4 border-t border-border-light">
                        <Button full type="submit" disabled={loading}>
                          {loading ? "Processing..." : `Pay & Enroll — $${course.price}`}
                        </Button>
                        <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>Back</Button>
                        <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                      </div>
                    </form>
                  )
                ) : (
                  <div>
                    {course.description && <p className="text-body text-text-secondary line-clamp-3">{course.description}</p>}
                    <div className="flex gap-3 pt-4 border-t border-border-light">
                      <Button full onClick={handleEnroll} disabled={loading}>Enroll Now — ${course.price}</Button>
                      <Button variant="outline" onClick={onClose}>Cancel</Button>
                    </div>
                  </div>
                )
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

// ── My Courses ────────────────────────────────────────────────────────────
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
                        <img src={c.image || "/placeholder-course.jpg"} alt={c.title}
                            className="w-24 object-cover rounded-xl cursor-pointer shrink-0"
                            style={{ height: "72px" }} onClick={() => openCourse(c)} />
                        <div className="flex-1 min-w-[180px]">
                            <p className="text-body-lg text-text-primary cursor-pointer hover:text-primary transition-colors" onClick={() => openCourse(c)}>{c.title}</p>
                            <p className="text-caption text-text-secondary mt-0.5">{c.category} · {c.instructorName?.name || "Instructor"}</p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                {c.complexity && <span className="flex items-center gap-1 text-caption text-text-secondary"><BarChart3 size={12} />{c.complexity}</span>}
                                {c.language && <span className="flex items-center gap-1 text-caption text-text-secondary"><Globe size={12} />{c.language}</span>}
                                {c.videos?.length > 0 && <span className="flex items-center gap-1 text-caption text-text-secondary"><PlayCircle size={12} />{c.videos.length} video{c.videos.length !== 1 ? "s" : ""}</span>}
                            </div>
                            <div className="mt-2 max-w-xs">
                                <ProgressBar value={prog} />
                                <p className="text-caption text-text-secondary mt-1">{prog}% complete</p>
                            </div>
                        </div>
                        <Badge tone={statusTone}>{statusLabel}</Badge>
                        <Button className="h-9 px-4 shrink-0" onClick={() => onPlay(c)}>
                            <PlayCircle size={16} />{prog > 0 ? "Resume" : "Start"}
                        </Button>
                    </Card>
                );
            })}
        </div>
    );
}

// ── Course Player ─────────────────────────────────────────────────────────
function CoursePlayer({ course, onBack, onProgressUpdate }) {
    const [tab, setTab] = useState("notes");
    const videos = course.videos || [];
    const [completedIds, setCompletedIds] = useState(new Set());
    const [activeVideo, setActiveVideo] = useState(videos[0] || null);
    const videoRef = useRef(null);

    const progress = videos.length > 0 ? Math.round((completedIds.size / videos.length) * 100) : 0;

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
                                            {isDone ? <CheckCircle2 size={15} className="text-success shrink-0" /> : <PlayCircle size={15} className="shrink-0" />}
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

// ── Quiz Taking Modal ─────────────────────────────────────────────────────
function QuizModal({ quiz, onClose, onSubmitted }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionIndex: selectedOption }
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const questions = quiz.questions || [];
    const currentQ = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;
    const allAnswered = questions.every((_, i) => answers[i] !== undefined);

    const handleSelect = (optionIndex) => {
        setAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
    };

    const handleSubmit = async () => {
        if (!allAnswered) { setError("Please answer all questions before submitting."); return; }
        setSubmitting(true); setError("");
        try {
            const payload = {
                answers: Object.entries(answers).map(([questionIndex, selectedOption]) => ({
                    questionIndex: parseInt(questionIndex),
                    selectedOption,
                })),
            };
            const res = await quizService.submitQuiz(quiz._id, payload);
            onSubmitted(res);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit quiz.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-primary-gradient text-white p-5 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-h3 text-white">{quiz.title}</h3>
                        <p className="text-caption text-white/80 mt-0.5">
                            Question {currentIndex + 1} of {questions.length} · {quiz.duration} min
                        </p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30">
                        <X size={16} />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-gray-100 shrink-0">
                    <div className="h-full bg-primary transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
                </div>

                {/* Question */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl mb-4">{error}</p>}
                    <p className="text-body-lg text-text-primary font-semibold mb-5">
                        {currentQ?.question}
                    </p>
                    <div className="space-y-3">
                        {(currentQ?.options || []).map((opt, i) => {
                            const selected = answers[currentIndex] === i;
                            return (
                                <button key={i} onClick={() => handleSelect(i)}
                                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-body ${
                                        selected
                                            ? "border-primary bg-active-bg text-primary font-semibold"
                                            : "border-border-light text-text-primary hover:border-primary/40 hover:bg-app"
                                    }`}>
                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold mr-3 ${
                                        selected ? "border-primary bg-primary text-white" : "border-gray-300 text-text-secondary"
                                    }`}>
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-border-light flex items-center justify-between gap-3 shrink-0 bg-white">
                    <Button variant="outline" onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0}>
                        <ChevronLeft size={16} /> Previous
                    </Button>
                    <span className="text-caption text-text-secondary">
                        {Object.keys(answers).length} / {questions.length} answered
                    </span>
                    {isLast ? (
                        <Button onClick={handleSubmit} disabled={submitting || !allAnswered}>
                            {submitting ? "Submitting…" : "Submit Quiz"}
                        </Button>
                    ) : (
                        <Button onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}>
                            Next <ChevronRight size={16} />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Quiz Result Modal ─────────────────────────────────────────────────────
function QuizResultModal({ result, quiz, onClose }) {
    const { score, totalMarks, answers: studentAnswers = [] } = result;
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const questions = quiz?.questions || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className={`p-6 text-white shrink-0 ${percentage >= 60 ? "bg-green-500" : "bg-red-400"}`}>
                    <div className="text-center">
                        <p className="text-4xl font-bold">{score} / {totalMarks}</p>
                        <p className="text-lg mt-1 font-medium">{percentage}% — {percentage >= 60 ? "Passed 🎉" : "Needs Improvement"}</p>
                        <p className="text-sm text-white/80 mt-1">{quiz?.title}</p>
                    </div>
                </div>

                {/* Answer Review */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <p className="text-body-lg text-text-primary font-semibold">Answer Review</p>
                    {questions.map((q, idx) => {
                        const studentAns = studentAnswers.find(a => a.questionIndex === idx);
                        const selected = studentAns?.selectedOption;
                        const isCorrect = selected === q.correctAnswer;
                        return (
                            <div key={idx} className={`border-2 rounded-xl p-4 ${isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                                <p className="text-body text-text-primary font-medium mb-3">Q{idx + 1}. {q.question}</p>
                                <div className="space-y-2">
                                    {q.options.map((opt, oi) => {
                                        const isSelected = oi === selected;
                                        const isAnswer = oi === q.correctAnswer;
                                        let cls = "text-text-secondary border-gray-200 bg-white";
                                        if (isAnswer) cls = "text-green-700 border-green-400 bg-green-50 font-semibold";
                                        if (isSelected && !isAnswer) cls = "text-red-700 border-red-400 bg-red-50 line-through";
                                        return (
                                            <div key={oi} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${cls}`}>
                                                <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0">
                                                    {String.fromCharCode(65 + oi)}
                                                </span>
                                                {opt}
                                                {isAnswer && <span className="ml-auto text-green-600 text-xs font-bold">✓ Correct</span>}
                                                {isSelected && !isAnswer && <span className="ml-auto text-red-600 text-xs font-bold">✗ Your answer</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-caption text-text-secondary mt-2">{q.marks} mark{q.marks !== 1 ? "s" : ""}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="p-5 border-t border-border-light shrink-0">
                    <Button full onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
}

// ── Quizzes (API-driven) ──────────────────────────────────────────────────
function Quizzes() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Active quiz taking
    const [takingQuiz, setTakingQuiz] = useState(null);

    // Result display
    const [result, setResult] = useState(null); // { score, totalMarks, answers, quiz }
    const [showResult, setShowResult] = useState(false);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const res = await quizService.getStudentQuizzes();
            setQuizzes(res.quizzes || []);
        } catch (err) {
            console.error("Failed to fetch quizzes:", err);
            setError("Failed to load quizzes. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchQuizzes(); }, []);

    const handleSubmitted = (submissionResult) => {
        // submissionResult = { score, totalMarks, quiz (from attempt) }
        // We need the full quiz with correctAnswers — fetch result
        loadResult(takingQuiz, submissionResult);
        setTakingQuiz(null);
        fetchQuizzes(); // refresh to update attempted/score
    };

    const loadResult = async (quiz, submissionResult) => {
        try {
            const res = await quizService.getQuizResult(quiz._id);
            setResult({ ...res, quizData: res.quiz });
            setShowResult(true);
        } catch {
            // Fallback: show what we have from submission
            setResult({ ...submissionResult, quizData: quiz });
            setShowResult(true);
        }
    };

    const handleViewResult = async (quiz) => {
        await loadResult(quiz, {});
    };

    if (loading) return <p className="text-body text-text-secondary">Loading quizzes…</p>;

    return (
        <>
            {takingQuiz && (
                <QuizModal
                    quiz={takingQuiz}
                    onClose={() => setTakingQuiz(null)}
                    onSubmitted={handleSubmitted}
                />
            )}
            {showResult && result && (
                <QuizResultModal
                    result={result}
                    quiz={result.quizData}
                    onClose={() => { setShowResult(false); setResult(null); }}
                />
            )}

            {error && (
                <div className="text-red-600 bg-red-50 border border-red-200 p-4 rounded-xl mb-4">
                    {error} <button onClick={fetchQuizzes} className="ml-3 text-blue-600 underline">Retry</button>
                </div>
            )}

            {quizzes.length === 0 && !error ? (
                <div className="flex flex-col items-center text-center py-12">
                    <HelpCircle size={40} className="text-text-secondary mb-3" />
                    <p className="text-h3 text-text-primary">No quizzes yet</p>
                    <p className="text-body text-text-secondary mt-1 max-w-sm">Quizzes from your enrolled courses will appear here once published by your instructor.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                    {quizzes.map((q) => (
                        <Card key={q._id}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-11 h-11 rounded-xl bg-active-bg text-primary flex items-center justify-center">
                                    <HelpCircle size={20} />
                                </div>
                                <Badge tone={q.attempted ? "success" : "warning"}>
                                    {q.attempted ? "Attempted" : "Pending"}
                                </Badge>
                            </div>
                            <p className="text-body-lg text-text-primary">{q.title}</p>
                            <p className="text-caption text-text-secondary mb-1">{q.courseId?.title || "Course"}</p>
                            {q.description && <p className="text-caption text-text-secondary mb-2 line-clamp-2">{q.description}</p>}
                            <div className="flex items-center justify-between text-caption text-text-secondary mt-2">
                                <span>{q.questions?.length || 0} questions · {q.duration} min</span>
                                {q.attempted && q.score !== null && (
                                    <span className="font-semibold text-success">
                                        Score: {q.score} / {q.totalMarks}
                                    </span>
                                )}
                            </div>
                            <div className="mt-4 flex gap-2">
                                {!q.attempted ? (
                                    <Button full className="h-9" onClick={() => setTakingQuiz(q)}>
                                        Start Quiz
                                    </Button>
                                ) : (
                                    <Button full variant="outline" className="h-9" onClick={() => handleViewResult(q)}>
                                        View Result
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </>
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
function DiscussionForum({ enrolledCourses = [] }) {
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [questionText, setQuestionText] = useState("");
    const [asking, setAsking] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchDiscussions = async () => {
        try {
            setLoading(true);
            const res = await discussionService.getStudentDiscussions();
            setDiscussions(res.discussions || []);
        } catch (err) {
            console.error("Failed to fetch discussions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDiscussions(); }, []);

    const handleAsk = async (e) => {
        e.preventDefault();
        if (!selectedCourse || !questionText.trim()) {
            setError("Please select a course and type your question.");
            return;
        }
        setAsking(true);
        setError("");
        setSuccess("");
        try {
            await discussionService.askQuestion({ courseId: selectedCourse, question: questionText.trim() });
            setQuestionText("");
            setSelectedCourse("");
            setSuccess("Question posted successfully!");
            setTimeout(() => setSuccess(""), 3000);
            fetchDiscussions();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to post question.");
        } finally {
            setAsking(false);
        }
    };

    // Group discussions by course
    const grouped = discussions.reduce((acc, d) => {
        const courseTitle = d.courseId?.title || "Unknown Course";
        if (!acc[courseTitle]) acc[courseTitle] = [];
        acc[courseTitle].push(d);
        return acc;
    }, {});

    const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Ask Question Form */}
            <Card>
                <h3 className="text-h3 text-text-primary mb-4">Ask a Question</h3>
                {error && <p className="text-caption text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 mb-3">{error}</p>}
                {success && <p className="text-caption text-green-600 bg-green-50 p-3 rounded-xl border border-green-100 mb-3">{success}</p>}
                <form onSubmit={handleAsk} className="space-y-3">
                    <Input
                        label="Select Course"
                        as="select"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                        <option value="">Choose an enrolled course...</option>
                        {enrolledCourses.map((c) => (
                            <option key={c._id} value={c._id}>{c.title}</option>
                        ))}
                    </Input>
                    <Input
                        as="textarea"
                        rows={3}
                        label="Your Question"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Type your question here..."
                        disabled={asking}
                    />
                    <Button type="submit" disabled={asking || !selectedCourse || !questionText.trim()}>
                        <Send size={16} />
                        {asking ? "Posting..." : "Post Question"}
                    </Button>
                </form>
            </Card>

            {/* Discussions List */}
            {loading ? (
                <p className="text-body text-text-secondary">Loading your discussions...</p>
            ) : discussions.length === 0 ? (
                <EmptyState icon={MessageSquare} title="No discussions yet" sub="Ask your first question about an enrolled course above." />
            ) : (
                Object.entries(grouped).map(([courseTitle, items], idx) => (
                    <div key={courseTitle}>
                        {idx > 0 && <hr className="border-border-light my-6" />}
                        <h3 className="text-h3 text-text-primary mb-4">{courseTitle}</h3>
                        <div className="space-y-3">
                            {items.map((d) => (
                                <Card key={d._id} className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-full bg-active-bg flex items-center justify-center shrink-0 mt-0.5">
                                            <MessageSquare size={16} className="text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-body-lg text-text-primary">{d.question}</p>
                                            <p className="text-caption text-text-secondary mt-1">
                                                Asked on {formatDate(d.createdAt)}
                                            </p>
                                        </div>
                                        <Badge tone={d.answer ? "success" : "warning"}>
                                            {d.answer ? "✓ Answered" : "Awaiting Response"}
                                        </Badge>
                                    </div>
                                    {d.answer && (
                                        <div className="ml-12 bg-green-50 border border-green-200 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Avatar name={d.instructorId?.name || "Instructor"} size={24} />
                                                <span className="text-caption font-semibold text-text-primary">{d.instructorId?.name || "Instructor"}</span>
                                                <span className="text-caption text-text-secondary">replied</span>
                                            </div>
                                            <p className="text-body text-text-primary">{d.answer}</p>
                                            {d.answeredAt && (
                                                <p className="text-caption text-text-secondary mt-2">{formatDate(d.answeredAt)}</p>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
                ))
            )}
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
            case "discussions":  return <DiscussionForum enrolledCourses={enrolledCourses} />;
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