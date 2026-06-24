import { useState } from "react";
import {
    LayoutDashboard,
    GraduationCap,
    UserCog,
    BookOpen,
    ClipboardList,
    Award,
    BarChart3,
} from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { PageHeader } from "../components/ui";
import Overview from "./pages/Overview";
import ManageStudents from "./pages/ManageStudents";
import ManageInstructors from "./pages/ManageInstructors";
import ManageCourses from "./pages/ManageCourses";
import EnrollmentReports from "./pages/EnrollmentReports";
import CertificateManagement from "./pages/CertificateManagement";
import LearningAnalytics from "./pages/LearningAnalytics";

const navItems = [
    { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "students", label: "Manage Students", icon: GraduationCap },
    { id: "instructors", label: "Manage Instructors", icon: UserCog },
    { id: "courses", label: "Manage Courses", icon: BookOpen },
    { id: "enrollments", label: "Enrollment Reports", icon: ClipboardList },
    { id: "certificates", label: "Certificate Management", icon: Award },
    { id: "analytics", label: "Learning Analytics", icon: BarChart3 },
];

export default function AdminDashboard() {
    const [activePage, setActivePage] = useState("overview");

    const renderPage = () => {
        switch (activePage) {
            case "overview": return <Overview />;
            case "students": return <ManageStudents />;
            case "instructors": return <ManageInstructors />;
            case "courses": return <ManageCourses />;
            case "enrollments": return <EnrollmentReports />;
            case "certificates": return <CertificateManagement />;
            case "analytics": return <LearningAnalytics />;
            default: return <Overview />;
        }
    };

    return (
        <DashboardShell
            roleLabel="Admin Panel"
            navItems={navItems}
            active={activePage}
            onNavigate={setActivePage}
            userName="Admin"
        >
            <PageHeader title={navItems.find((n) => n.id === activePage)?.label} />
            {renderPage()}
        </DashboardShell>
    );
}
