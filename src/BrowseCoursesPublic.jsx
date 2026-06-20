import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Star, Users, X } from "lucide-react";
import { Button, Badge } from "./components/ui";
import Illustration from "./components/Illustration";
import { courses, categories } from "./mockData/lmsData";
import browseCourses from "./assets/illustrations/browse-courses.png";
import browseCoursesWebp from "./assets/illustrations/browse-courses.webp";
import bgPattern from "./assets/illustrations/bg-pattern.svg";

function CourseCard({ course, onClick }) {
    return (
        <article
            role="button"
            tabIndex={0}
            onClick={() => onClick(course)}
            className="w-full bg-surface rounded-card border border-border-light overflow-hidden cursor-pointer shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-soft"
        >
            <img src={course.thumbnail} alt={course.title} className="w-full h-36 object-cover" />
            <div className="p-4">
                <Badge tone="primary">{course.category}</Badge>
                <p className="text-body-lg text-text-primary mt-2 line-clamp-2">{course.title}</p>
                <p className="text-caption text-text-secondary mt-1">{course.instructor}</p>
                <div className="flex items-center justify-between mt-3">
                    <span className="flex items-center gap-1 text-caption text-text-secondary">
                        <Star size={13} className="text-warning fill-warning" /> {course.rating}
                    </span>
                    <span className="flex items-center gap-1 text-caption text-text-secondary">
                        <Users size={13} /> {course.students.toLocaleString()}
                    </span>
                    <span className="text-h3 text-primary">${course.price}</span>
                </div>
            </div>
        </article>
    );
}

function CourseModal({ course, onClose }) {
    const navigate = useNavigate();
    if (!course) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-surface rounded-card max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-soft">
                <div className="relative">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
                    <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6">
                    <Badge tone="primary">{course.category}</Badge>
                    <h2 className="text-h3 text-text-primary mt-2">{course.title}</h2>
                    <p className="text-body text-text-secondary mt-2">{course.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-caption text-text-secondary">
                        <span>By {course.instructor}</span>
                        <span className="flex items-center gap-1"><Star size={13} className="text-warning fill-warning" /> {course.rating}</span>
                        <span>{course.duration}</span>
                    </div>
                    <Button full className="mt-6" onClick={() => navigate("/signup")}>Sign Up to Enroll — ${course.price}</Button>
                </div>
            </div>
        </div>
    );
}

export default function BrowseCoursesPublic({ onBackHome }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");
    const [selected, setSelected] = useState(null);

    const filtered = useMemo(() => {
        return courses.filter((c) => {
            const matchesQuery = c.title.toLowerCase().includes(query.toLowerCase());
            const matchesCategory = category === "All" || c.category === category;
            return matchesQuery && matchesCategory;
        });
    }, [query, category]);

    return (
        <div
            className="min-h-screen bg-app"
            style={{
                backgroundImage: `url(${bgPattern})`,
                backgroundSize: "1100px auto",
                backgroundRepeat: "repeat",
                backgroundPosition: "top center",
            }}
        >
            <header className="bg-surface border-b border-border-light px-6 sm:px-10 py-5 flex items-center justify-between sticky top-0 z-10">
                <button onClick={onBackHome || (() => navigate("/"))} className="flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-primary transition">
                    <ArrowLeft size={18} /> Back
                </button>
                <span className="text-lg font-extrabold bg-primary-gradient bg-clip-text text-transparent">Skillio</span>
                <Button className="h-10 px-5" onClick={() => navigate("/login")}>Login</Button>
            </header>

            <div className="px-6 sm:px-10 py-8 max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-h2 text-text-primary mb-1">Browse Courses</h1>
                    <p className="text-body text-text-secondary">Explore our catalog and find the right course to grow your skills.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search courses..."
                            className="w-full h-12 rounded-input border border-border-light pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        />
                    </div>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="h-12 rounded-input border border-border-light px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    >
                        <option>All</option>
                        {categories.map((c) => <option key={c}>{c}</option>)}
                    </select>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {filtered.map((c) => (
                        <CourseCard key={c.id} course={c} onClick={setSelected} />
                    ))}
                </div>
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center text-center py-12">
                        <Illustration
                            src={browseCourses}
                            webp={browseCoursesWebp}
                            alt="Illustration representing course exploration with no results"
                            size="discovery"
                            className="mb-4"
                        />
                        <p className="text-text-secondary">No courses match your search.</p>
                    </div>
                )}
            </div>

            <CourseModal course={selected} onClose={() => setSelected(null)} />
        </div>
    );
}