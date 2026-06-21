import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dns from "dns";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/coursesRoute.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import assignementRoute from "./routes/assignmentRoute.js";
import submissionRoute from "./routes/submissionRoute.js";
import announcementRoute from "./routes/announcementRoute.js";

// Set DNS resolution order to ipv4first and set public DNS servers to avoid querySrv ECONNREFUSED on Windows
dns.setDefaultResultOrder("ipv4first");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (error) {
  console.warn("Unable to set DNS servers:", error);
}

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/assignments", assignementRoute);
app.use("/api/submissions", submissionRoute);
app.use("/api/announcements", announcementRoute);

// Root route
app.get("/", (req, res) => {
  res.send("Lernova Instructor Auth API is running...");
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
