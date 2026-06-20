import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
import LMS from "./LMS";
import BrowseCoursesPublic from "./BrowseCoursesPublic";
import Login from "./pages/login";
import Signup from "./pages/signup";
import InstructorSignup from "./pages/instructorSignup";
import StudentDashboard from "./StudentPanel/StudentDashboard";
import InstructorDashboard from "./InstructorPanel/InstructorDashboard";
import AdminDashboard from "./AdminPanel/AdminDashboard";

// ── DEV FLAG ───────────────────────────────────────────────────────────────
// Set to true once a real backend + login/signup flow is wired up.
// While false, all panels are reachable directly by URL for frontend testing.
const REQUIRE_AUTH = true;

// ── Guard: only logged-in users with a matching role ──────────────────────────
function PrivateRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");
  const location = useLocation();

  if (!REQUIRE_AUTH) {
    return children;
  }

  if (!token) {
    // Save the page they tried to visit so we can redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // Logged in but wrong role → send to their own panel
    if (role === "admin")      return <Navigate to="/admin"            replace />;
    if (role === "instructor") return <Navigate to="/instructor"       replace />;
    return <Navigate to="/studentDashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  const navigate = useNavigate();
  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route path="/"                 element={<LMS />} />
      <Route path="/courses"          element={<BrowseCoursesPublic onBackHome={() => navigate("/")} />} />
      <Route path="/login"            element={<Login />} />
      <Route path="/signup"           element={<Signup />} />
      <Route path="/instructor-signup" element={<InstructorSignup />} />

      {/* ── Protected: students ── */}
      <Route
        path="/studentDashboard"
        element={
          <PrivateRoute requiredRole="student">
            <StudentDashboard />
          </PrivateRoute>
        }
      />

      {/* ── Protected: instructors ── */}
      <Route
        path="/instructor"
        element={
          <PrivateRoute requiredRole="instructor">
            <InstructorDashboard />
          </PrivateRoute>
        }
      />

      {/* ── Protected: admins ── */}
      <Route
        path="/admin"
        element={
          <PrivateRoute requiredRole="admin">
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      {/* ── Fallback: redirect unknown paths to home ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
