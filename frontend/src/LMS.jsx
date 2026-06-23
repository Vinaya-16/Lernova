import { useNavigate } from "react-router-dom";
import { GraduationCap, PlayCircle, Star, Users } from "lucide-react";
import { Button } from "./components/ui";
import Illustration from "./components/Illustration";
import { courses } from "./mockData/lmsData";
import heroLearning from "./assets/illustrations/hero-learning.png";
import heroLearningWebp from "./assets/illustrations/hero-learning.webp";

const NAV_LINKS = ["Home", "Courses", "Contact"];

export default function LMS() {
    const navigate = useNavigate();
    const featured = courses.slice(0, 3);

    return (
        <div className="w-full font-sans bg-app">
            {/* ── HERO ── */}
            <div className="relative w-full min-h-screen flex flex-col overflow-hidden bg-app">
                <div className="absolute -bottom-20 -left-16 w-[420px] h-[420px] rounded-full bg-secondary/10 blur-3xl" />
                <div className="absolute -top-16 left-1/4 w-80 h-80 rounded-full bg-primary/15 blur-3xl" />

                <nav className="relative z-10 w-full px-6 sm:px-16 py-7 flex items-center justify-between">
                    <span className="text-xl font-extrabold bg-primary-gradient bg-clip-text text-transparent">
                        Lernova
                    </span>
                    <ul className="hidden md:flex gap-10 list-none m-0 p-0">
                        {NAV_LINKS.map((l) => (
                            <li key={l}>
                                <a href="#" className="text-sm font-medium text-text-secondary hover:text-primary transition">
                                    {l}
                                </a>
                            </li>
                        ))}
                    </ul>
                    {/* <div className="flex gap-3 items-center">
                        <button onClick={() => navigate("/login")} className="text-sm font-semibold text-text-secondary hover:text-primary transition">
                            Login
                        </button>
                        <Button onClick={() => navigate("/signup")} className="h-10 px-5">Sign Up</Button>
                    </div> */}
                </nav>

                <div className="relative z-10 flex-1 flex items-center px-6 sm:px-16 pb-16">
                    <div className="w-full flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-6">
                        {/* Left: headline, copy, CTAs */}
                        <div className="max-w-xl lg:flex-1">
                            <h1 className="text-[40px] sm:text-[58px] font-extrabold text-text-primary leading-[1.08] tracking-tight mb-6">
                                Learn, Grow &{" "}
                                <span className="bg-primary-gradient bg-clip-text text-transparent">Master New Skills</span>{" "}
                                Online
                            </h1>
                            <p className="text-body-lg text-text-secondary max-w-md mb-9 leading-relaxed">
                                Lernova helps instructors create engaging courses while making it easy for students to learn, track progress, and earn certificates.
                            </p>
                            <div className="flex flex-wrap gap-3 items-center">
                                <Button onClick={() => navigate("/courses")} className="h-12 px-7">
                                    <PlayCircle size={18} /> Browse Courses
                                </Button>
                                <Button variant="outline" className="h-12 px-7" onClick={() => navigate("/instructor-signup")}>
                                    <GraduationCap size={18} /> Become an Instructor
                                </Button>
                            </div>
                            <p className="mt-7 text-caption text-text-secondary">
                                Trusted by <span className="text-primary font-semibold">12,000+</span> learners worldwide
                            </p>
                        </div>

                        {/* Right: hero illustration (desktop), stacked above CTA on mobile via flex-col-reverse */}
                        <div className="flex justify-center lg:flex-1 lg:justify-end">
                            <Illustration
                                src={heroLearning}
                                webp={heroLearningWebp}
                                alt="Illustration of a student learning online with video lessons, progress charts, and a graduation cap"
                                size="hero"
                                animate="float"
                                eager
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── FEATURED COURSES ── */}
            <section className="px-6 sm:px-16 py-16 bg-surface">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-h2 text-text-primary">Featured Courses</h2>
                    <button onClick={() => navigate("/courses")} className="text-sm font-semibold text-primary">View All</button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featured.map((c) => (
                        <div key={c.id} className="bg-app rounded-card overflow-hidden shadow-card border border-border-light cursor-pointer hover:shadow-soft transition" onClick={() => navigate("/courses")}>
                            <img src={c.thumbnail} alt={c.title} className="w-full h-40 object-cover" />
                            <div className="p-5">
                                <p className="text-body-lg text-text-primary line-clamp-2">{c.title}</p>
                                <p className="text-caption text-text-secondary mt-1">{c.instructor}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="flex items-center gap-1 text-caption text-text-secondary">
                                        <Star size={14} className="text-warning fill-warning" /> {c.rating}
                                    </span>
                                    <span className="flex items-center gap-1 text-caption text-text-secondary">
                                        <Users size={14} /> {c.students.toLocaleString()}
                                    </span>
                                    <span className="text-h3 text-primary">${c.price}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-gray-900 text-gray-400">
                <div className="px-6 sm:px-16 py-9 flex flex-wrap items-center justify-between gap-5">
                    <div>
                        <p className="font-bold text-base mb-0.5 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Lernova</p>
                        <p className="text-caption">Making learning accessible to everyone.</p>
                    </div>
                    <ul className="flex gap-7 list-none m-0 p-0">
                        {NAV_LINKS.map((l) => (
                            <li key={l}>
                                <a href="#" className="text-caption hover:text-secondary transition">{l}</a>
                            </li>
                        ))}
                    </ul>
                    <p className="text-caption text-gray-500">© 2026 Lernova. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
