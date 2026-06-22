import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api.js";
import { Button } from "../components/ui";

export default function Signup() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        if (!name || !email || !password) return setError("Please fill in all fields.");

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role: "student" }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Could not create account.");

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("role", "student");
            setLoading(false);
            navigate("/studentDashboard", { replace: true });
        } catch (err) {
            setLoading(false);
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex font-sans">
            <div className="hidden md:flex flex-1 bg-app flex-col justify-center px-16 relative overflow-hidden">
                <div className="absolute -bottom-20 -left-16 w-[420px] h-[420px] rounded-full bg-secondary/10 blur-3xl" />
                <div className="absolute -top-16 left-1/4 w-80 h-80 rounded-full bg-primary/15 blur-3xl" />
                <div className="relative z-10 max-w-lg">
                    <span className="text-caption font-bold tracking-widest text-primary-dark uppercase block mb-4">
                        Join as a Student
                    </span>
                    <h1 className="text-[40px] lg:text-[52px] font-extrabold leading-tight tracking-tight text-text-primary">
                        Start Learning<br />
                        <span className="bg-primary-gradient bg-clip-text text-transparent">Today</span>
                    </h1>
                </div>
            </div>

            <div className="flex-1 bg-primary-gradient flex items-center justify-center p-6">
                <div className="w-full max-w-sm bg-surface rounded-card p-8 shadow-soft">
                    <Link to="/courses" className="text-caption font-medium text-text-secondary hover:text-primary">← Back to Home</Link>

                    <div className="mt-5 mb-7">
                        <h2 className="text-h2 bg-primary-gradient bg-clip-text text-transparent inline-block">Lernova</h2>
                        <p className="text-caption text-text-secondary mt-1">Create your student account</p>
                    </div>

                    {error && (
                        <div className="px-4 py-2.5 bg-red-50 border border-red-100 rounded-input text-red-500 text-caption mb-4">{error}</div>
                    )}

                    <form onSubmit={handleSignup} className="flex flex-col gap-4">
                        <div>
                            <label className="text-caption font-semibold text-text-primary block mb-1.5">Full Name</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required
                                className="w-full h-12 rounded-input border border-border-light px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-caption font-semibold text-text-primary block mb-1.5">Email Address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required
                                className="w-full h-12 rounded-input border border-border-light px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-caption font-semibold text-text-primary block mb-1.5">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                                className="w-full h-12 rounded-input border border-border-light px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                        </div>
                        <Button type="submit" disabled={loading} full className="mt-1">
                            {loading ? "Creating Account..." : "Sign Up"}
                        </Button>
                    </form>

                    <div className="text-center mt-6 border-t border-border-light pt-4 text-caption text-text-secondary">
                        Already have an account? <Link to="/login" className="text-primary font-semibold">Log In</Link>
                    </div>
                    <div className="text-center mt-2 text-caption text-text-secondary">
                        Want to teach? <Link to="/instructor-signup" className="text-secondary font-semibold">Become an Instructor</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
