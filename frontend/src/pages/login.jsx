import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { API_BASE_URL } from "../config/api.js";
import { Button } from "../components/ui";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || null;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) return setError("Please fill in all fields.");
        if (!/\S+@\S+\.\S+/.test(email)) return setError("Invalid email address.");

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Invalid credentials.");

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("role", data.role || "student");

            setLoading(false);

            // Redirect user based on their authenticated role (e.g., admin@lernova.com has 'admin' role)
            const role = data.role || "student";
            if (role === "admin") {
                navigate(from && from.startsWith("/admin") ? from : "/admin", { replace: true });
            } else if (role === "instructor") {
                navigate(from && from.startsWith("/instructor") ? from : "/instructor", { replace: true });
            } else {
                navigate(from && (from.startsWith("/studentDashboard") || from.startsWith("/notifications")) ? from : "/studentDashboard", { replace: true });
            }
        } catch (err) {
            setLoading(false);
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex font-sans">
            {/* Left info panel */}
            <div className="hidden md:flex flex-1 bg-app flex-col justify-center px-16 relative overflow-hidden">
                <div className="absolute -bottom-20 -left-16 w-[420px] h-[420px] rounded-full bg-secondary/10 blur-3xl" />
                <div className="absolute -top-16 left-1/4 w-80 h-80 rounded-full bg-primary/15 blur-3xl" />
                <div className="relative z-10 max-w-lg">
                    <span className="text-caption font-bold tracking-widest text-primary-dark uppercase block mb-4">
                        Learning Management Platform
                    </span>
                    <h1 className="text-[40px] lg:text-[52px] font-extrabold leading-tight tracking-tight text-text-primary">
                        Learn, Grow &<br />
                        <span className="bg-primary-gradient bg-clip-text text-transparent">Master New Skills</span><br />
                        Effortlessly.
                    </h1>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 bg-primary-gradient flex items-center justify-center p-6">
                <div className="w-full max-w-sm bg-surface rounded-card p-8 shadow-soft">
                    <Link to="/courses" className="text-caption font-medium text-text-secondary hover:text-primary">← Back to Home</Link>

                    <div className="mt-5 mb-7">
                        <h2 className="text-h2 bg-primary-gradient bg-clip-text text-transparent inline-block">Skillio</h2>
                        <p className="text-caption text-text-secondary mt-1">Log in to your account</p>
                    </div>

                    {error && (
                        <div className="px-4 py-2.5 bg-red-50 border border-red-100 rounded-input text-red-500 text-caption mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <div>
                            <label className="text-caption font-semibold text-text-primary block mb-1.5">Email Address</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full h-12 rounded-input border border-border-light px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-caption font-semibold text-text-primary">Password</label>
                                <a href="#" className="text-caption text-secondary">Forgot?</a>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full h-12 rounded-input border border-border-light px-4 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} full className="mt-1">
                            {loading ? "Logging In..." : "Log In"}
                        </Button>
                    </form>

                    <div className="text-center mt-6 border-t border-border-light pt-4 text-caption text-text-secondary">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-primary font-semibold">Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
