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
import quizRoute from "./routes/quizRoute.js";
import discussionRoute from "./routes/discussionRoute.js";
import studentRoute from "./routes/studentRoute.js";
import reviewRoute from "./routes/reviewRoute.js";

import certificateRoutes from "./routes/certificateRoutes.js";


dns.setDefaultResultOrder("ipv4first");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (error) {
  console.warn("Unable to set DNS servers:", error);
}

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/assignments", assignementRoute);
app.use("/api/submissions", submissionRoute);
app.use("/api/announcements", announcementRoute);
app.use("/api/quizzes", quizRoute);
app.use("/api/discussions", discussionRoute);
app.use("/api/students", studentRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/certificates", certificateRoutes);

app.get("/", (req, res) => {
  res.send("Lernova Instructor Auth API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});