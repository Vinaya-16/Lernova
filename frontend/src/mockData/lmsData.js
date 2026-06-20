// ── Mock data for the Skillio LMS frontend ──────────────────────────────────
// All values here are placeholders. No backend / API calls are involved.

export const categories = [
    "Web Development",
    "Design",
    "Data Science",
    "Marketing",
    "Photography",
    "Business",
];

export const courses = [
    {
        id: "c1",
        title: "UI & UX Mastery: Design Your First App",
        category: "Design",
        instructor: "Ava Lee",
        thumbnail: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=500",
        price: 49,
        rating: 4.8,
        reviews: 312,
        students: 4210,
        level: "Beginner",
        duration: "6h 40m",
        progress: 75,
        description:
            "Learn the fundamentals of user interface and user experience design, from wireframes to high-fidelity prototypes.",
        modules: [
            {
                id: "m1",
                title: "Getting Started with UX",
                lessons: [
                    { id: "l1", title: "What is UX Design?", duration: "12:30", completed: true },
                    { id: "l2", title: "The Design Thinking Process", duration: "18:10", completed: true },
                ],
            },
            {
                id: "m2",
                title: "Wireframing & Prototyping",
                lessons: [
                    { id: "l3", title: "Low-fidelity Wireframes", duration: "15:45", completed: true },
                    { id: "l4", title: "Building Interactive Prototypes", duration: "22:05", completed: false },
                ],
            },
        ],
    },
    {
        id: "c2",
        title: "Create Mobile-First Websites from Scratch",
        category: "Web Development",
        instructor: "Noah Kim",
        thumbnail: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=500",
        price: 59,
        rating: 4.6,
        reviews: 198,
        students: 2890,
        level: "Intermediate",
        duration: "9h 15m",
        progress: 40,
        description:
            "A practical, project-based course on building fully responsive, mobile-first websites with modern CSS.",
        modules: [
            {
                id: "m1",
                title: "Responsive Foundations",
                lessons: [
                    { id: "l1", title: "Mobile-first Mindset", duration: "10:20", completed: true },
                    { id: "l2", title: "Flexbox & Grid Essentials", duration: "26:40", completed: false },
                ],
            },
        ],
    },
    {
        id: "c3",
        title: "Build Interactive Prototypes Like a Pro",
        category: "Design",
        instructor: "Ethan Cruz",
        thumbnail: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=500",
        price: 39,
        rating: 4.9,
        reviews: 421,
        students: 5310,
        level: "Advanced",
        duration: "7h 05m",
        progress: 10,
        description:
            "Master advanced prototyping techniques used by top product design teams.",
        modules: [
            {
                id: "m1",
                title: "Advanced Interactions",
                lessons: [
                    { id: "l1", title: "Micro-interactions", duration: "14:00", completed: false },
                ],
            },
        ],
    },
    {
        id: "c4",
        title: "Python for Data Analytics",
        category: "Data Science",
        instructor: "Maya Patel",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500",
        price: 69,
        rating: 4.7,
        reviews: 256,
        students: 3100,
        level: "Beginner",
        duration: "12h 30m",
        progress: 0,
        description:
            "Get hands-on with Python, Pandas, and visualization libraries to analyze real-world datasets.",
        modules: [
            {
                id: "m1",
                title: "Python Basics",
                lessons: [{ id: "l1", title: "Variables & Data Types", duration: "11:00", completed: false }],
            },
        ],
    },
    {
        id: "c5",
        title: "Digital Marketing Fundamentals",
        category: "Marketing",
        instructor: "Liam Chen",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500",
        price: 45,
        rating: 4.5,
        reviews: 167,
        students: 1980,
        level: "Beginner",
        duration: "5h 20m",
        progress: 0,
        description: "An introduction to SEO, social media, and paid ad strategy for modern brands.",
        modules: [],
    },
    {
        id: "c6",
        title: "Portrait Photography Essentials",
        category: "Photography",
        instructor: "Sofia Reyes",
        thumbnail: "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=500",
        price: 35,
        rating: 4.8,
        reviews: 144,
        students: 1420,
        level: "Beginner",
        duration: "4h 50m",
        progress: 0,
        description: "Learn lighting, composition, and posing techniques for stunning portraits.",
        modules: [],
    },
];

export const enrolledCourseIds = ["c1", "c2", "c3"];

export const assignments = [
    { id: "a1", course: "UI & UX Mastery", title: "Wireframe a Mobile App", dueDate: "2026-06-25", status: "Pending" },
    { id: "a2", course: "Create Mobile-First Websites", title: "Build a Responsive Landing Page", dueDate: "2026-06-28", status: "Submitted" },
    { id: "a3", course: "Build Interactive Prototypes", title: "Prototype a Checkout Flow", dueDate: "2026-07-02", status: "Graded", grade: "A" },
];

export const quizzes = [
    { id: "q1", course: "UI & UX Mastery", title: "UX Basics Quiz", questions: 10, duration: "15 min", status: "Completed", score: "8/10" },
    { id: "q2", course: "Create Mobile-First Websites", title: "CSS Grid & Flexbox Quiz", questions: 12, duration: "20 min", status: "Pending" },
    { id: "q3", course: "Build Interactive Prototypes", title: "Prototyping Tools Quiz", questions: 8, duration: "10 min", status: "Pending" },
];

export const certificates = [
    { id: "cert1", course: "Intro to Figma", issuedOn: "2026-04-12", credentialId: "SK-9182-FIG" },
];

export const reviews = [
    { id: "r1", course: "UI & UX Mastery", student: "Ava Lee", rating: 5, comment: "Clear explanations and great pacing throughout the course.", date: "2026-05-02" },
    { id: "r2", course: "Create Mobile-First Websites", student: "Noah Kim", rating: 4, comment: "Solid project-based content, would love more advanced examples.", date: "2026-05-10" },
];

export const discussions = [
    { id: "d1", course: "UI & UX Mastery", author: "Ethan Cruz", title: "How do you handle conflicting feedback from stakeholders?", replies: 6, lastActivity: "2h ago" },
    { id: "d2", course: "Create Mobile-First Websites", author: "Maya Patel", title: "Best practices for container queries?", replies: 3, lastActivity: "1d ago" },
];

export const notifications = [
    { id: "n1", title: "New lesson added", body: "\"Advanced Interactions\" was added to Build Interactive Prototypes.", time: "10m ago", read: false },
    { id: "n2", title: "Assignment due soon", body: "Wireframe a Mobile App is due in 2 days.", time: "3h ago", read: false },
    { id: "n3", title: "Certificate issued", body: "Your certificate for Intro to Figma is ready.", time: "2d ago", read: true },
];

export const students = [
    { id: "s1", name: "Ava Lee", email: "ava.lee@example.com", coursesEnrolled: 4, joined: "2026-01-12", status: "Active" },
    { id: "s2", name: "Noah Kim", email: "noah.kim@example.com", coursesEnrolled: 2, joined: "2026-02-03", status: "Active" },
    { id: "s3", name: "Ethan Cruz", email: "ethan.cruz@example.com", coursesEnrolled: 6, joined: "2025-11-21", status: "Suspended" },
    { id: "s4", name: "Maya Patel", email: "maya.patel@example.com", coursesEnrolled: 1, joined: "2026-03-08", status: "Active" },
];

export const instructors = [
    { id: "i1", name: "Ava Lee", email: "ava.instructor@example.com", courses: 5, students: 4210, status: "Approved" },
    { id: "i2", name: "Noah Kim", email: "noah.instructor@example.com", courses: 3, students: 2890, status: "Approved" },
    { id: "i3", name: "Liam Chen", email: "liam.instructor@example.com", courses: 1, students: 1980, status: "Pending" },
];

export const announcements = [
    { id: "an1", course: "UI & UX Mastery", title: "New module released!", body: "Check out the new Advanced Interactions module.", date: "2026-06-15" },
    { id: "an2", course: "All Courses", title: "Platform maintenance", body: "Scheduled maintenance this weekend, courses remain accessible.", date: "2026-06-10" },
];

export const platformStats = {
    totalUsers: 12480,
    totalCourses: 326,
    activeEnrollments: 8740,
    completionRate: 68,
    monthlyGrowth: [
        { month: "Jan", users: 8200 },
        { month: "Feb", users: 8900 },
        { month: "Mar", users: 9600 },
        { month: "Apr", users: 10400 },
        { month: "May", users: 11500 },
        { month: "Jun", users: 12480 },
    ],
    topInstructors: [
        { name: "Ava Lee", students: 4210, rating: 4.8 },
        { name: "Ethan Cruz", students: 5310, rating: 4.9 },
        { name: "Noah Kim", students: 2890, rating: 4.6 },
    ],
};

export const learningStreak = { current: 5, target: 7 };

export const friends = [
    { name: "Ava Lee", points: 92 },
    { name: "Noah Kim", points: 120 },
    { name: "Ethan Cruz", points: 50 },
    { name: "Maya Patel", points: 150 },
];
