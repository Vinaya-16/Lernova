import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import coursesModel from "./models/coursesModel.js";
import Student from "./models/Student.js";
import Enrollment from "./models/Enrollment.js";

// Load env
dotenv.config({ path: "./.env" });

dns.setDefaultResultOrder("ipv4first");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (error) {
  console.warn("Unable to set DNS servers:", error);
}

const run = async () => {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database successfully!");

    const courses = await coursesModel.find({});
    console.log(`\nFound ${courses.length} courses:`);
    courses.forEach(c => {
      console.log(`- [${c._id}] "${c.title}" by instructor ${c.instructorId} - Price: $${c.price || 0} - Enrolled: ${c.enrolledStudents?.length || 0} students (Status: ${c.status})`);
    });

    const students = await Student.find({});
    console.log(`\nFound ${students.length} students/users:`);
    students.forEach(s => {
      console.log(`- [${s._id}] ${s.name} (${s.email}) - Role: ${s.role}`);
    });

    const enrollments = await Enrollment.find({});
    console.log(`\nFound ${enrollments.length} enrollments in collection 'enrollment':`);
    enrollments.forEach(e => {
      console.log(`- [${e._id}] Student: ${e.studentId} -> Course: ${e.courseId} - Price Paid: $${e.price} - Status: ${e.paymentStatus} - Name: ${e.fullName || 'N/A'}`);
    });

  } catch (err) {
    console.error("Error during check:", err);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected.");
  }
};

run();
