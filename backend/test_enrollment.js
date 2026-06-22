import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import { enrollCourse } from "./controllers/coursesController.js";
import Student from "./models/Student.js";
import coursesModel from "./models/coursesModel.js";
import Enrollment from "./models/Enrollment.js";

// Load env
dotenv.config({ path: "./.env" });

dns.setDefaultResultOrder("ipv4first");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (error) {
  console.warn("Unable to set DNS servers:", error);
}

// Helper to create mock response object
const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for testing.");

    // 1. Get or Create a test student
    let student = await Student.findOne({ email: "enrollment_test@student.com" });
    if (!student) {
      student = await Student.create({
        name: "Test Student",
        email: "enrollment_test@student.com",
        password: "password123",
      });
    }

    // 2. Find test courses (one free, one paid)
    const freeCourse = await coursesModel.findOne({ price: 0 });
    const paidCourse = await coursesModel.findOne({ price: { $gt: 0 } });

    if (!freeCourse || !paidCourse) {
      throw new Error("Could not find both a free course and a paid course in the database for testing.");
    }

    console.log(`\nTesting with:`);
    console.log(`- Free course: "${freeCourse.title}" (ID: ${freeCourse._id}, Price: $${freeCourse.price})`);
    console.log(`- Paid course: "${paidCourse.title}" (ID: ${paidCourse._id}, Price: $${paidCourse.price})`);

    // Clean up previous test enrollments to ensure test repeatability
    await Enrollment.deleteMany({ studentId: student._id });
    await Student.findByIdAndUpdate(student._id, { $pull: { enrolledCourses: { $in: [freeCourse._id, paidCourse._id] } } });
    await coursesModel.findByIdAndUpdate(freeCourse._id, { $pull: { enrolledStudents: student._id } });
    await coursesModel.findByIdAndUpdate(paidCourse._id, { $pull: { enrolledStudents: student._id } });

    // ───────────────────────────────────────────────────────────────────
    // Test Case 1: Free Course Enrollment (Should succeed with no form data)
    // ───────────────────────────────────────────────────────────────────
    console.log("\n[Test Case 1] Enrolling in a FREE course...");
    const req1 = {
      params: { id: freeCourse._id.toString() },
      user: { id: student._id.toString() },
      body: {}, // no form data
    };
    const res1 = mockResponse();

    await enrollCourse(req1, res1);

    if (res1.statusCode !== 200 || !res1.body.success) {
      console.error("Test Case 1 FAILED:", res1.statusCode, res1.body);
      process.exit(1);
    }
    console.log("-> Success! Free enrollment API response:", res1.body);

    // Verify DB record
    const dbEnroll1 = await Enrollment.findOne({ studentId: student._id, courseId: freeCourse._id });
    if (!dbEnroll1 || dbEnroll1.paymentStatus !== "free") {
      console.error("Test Case 1 DB verification FAILED:", dbEnroll1);
      process.exit(1);
    }
    console.log("-> DB verified! Enrollment document is stored correctly with 'free' status.");

    // ───────────────────────────────────────────────────────────────────
    // Test Case 2: Paid Course Enrollment without Billing Details (Should fail)
    // ───────────────────────────────────────────────────────────────────
    console.log("\n[Test Case 2] Enrolling in a PAID course WITHOUT billing details...");
    const req2 = {
      params: { id: paidCourse._id.toString() },
      user: { id: student._id.toString() },
      body: {}, // empty body
    };
    const res2 = mockResponse();

    await enrollCourse(req2, res2);

    if (res2.statusCode !== 400 || res2.body.success) {
      console.error("Test Case 2 FAILED: Expected failure, but got", res2.statusCode, res2.body);
      process.exit(1);
    }
    console.log("-> Success! API correctly rejected enrollment with 400 Bad Request:", res2.body.message);

    // ───────────────────────────────────────────────────────────────────
    // Test Case 3: Paid Course Enrollment WITH Billing & Payment Details (Should succeed)
    // ───────────────────────────────────────────────────────────────────
    console.log("\n[Test Case 3] Enrolling in a PAID course WITH billing details...");
    const billingData = {
      fullName: "Test Student",
      email: "enrollment_test@student.com",
      phoneNumber: "+1 555-0199",
      address: "123 Test Street",
      city: "Testville",
      state: "TS",
      zipCode: "12345",
      paymentMethod: "Credit Card",
      cardholderName: "Test Student",
      transactionId: "TXN-TEST123456",
    };

    const req3 = {
      params: { id: paidCourse._id.toString() },
      user: { id: student._id.toString() },
      body: billingData,
    };
    const res3 = mockResponse();

    await enrollCourse(req3, res3);

    if (res3.statusCode !== 200 || !res3.body.success) {
      console.error("Test Case 3 FAILED:", res3.statusCode, res3.body);
      process.exit(1);
    }
    console.log("-> Success! Paid enrollment API response:", res3.body);

    // Verify DB record
    const dbEnroll2 = await Enrollment.findOne({ studentId: student._id, courseId: paidCourse._id });
    if (!dbEnroll2) {
      console.error("Test Case 3 DB verification FAILED: Document not found");
      process.exit(1);
    }
    console.log("-> DB verified! Enrollment document found in Atlas:");
    console.log(`   - Payment Status: ${dbEnroll2.paymentStatus}`);
    console.log(`   - Price: $${dbEnroll2.price}`);
    console.log(`   - Phone: ${dbEnroll2.phoneNumber}`);
    console.log(`   - Address: ${dbEnroll2.address}, ${dbEnroll2.city}, ${dbEnroll2.state} ${dbEnroll2.zipCode}`);
    console.log(`   - Payment Method: ${dbEnroll2.paymentMethod}`);
    console.log(`   - Transaction ID: ${dbEnroll2.transactionId}`);

    // Verify duplicate enrollment rejection
    console.log("\n[Test Case 4] Attempting duplicate enrollment...");
    const res4 = mockResponse();
    await enrollCourse(req3, res4);
    if (res4.statusCode !== 400 || res4.body.success) {
      console.error("Test Case 4 FAILED: Expected failure for duplicate, but got", res4.statusCode, res4.body);
      process.exit(1);
    }
    console.log("-> Success! API correctly rejected duplicate enrollment:", res4.body.message);

    // Clean up test data
    console.log("\nCleaning up test data...");
    await Enrollment.deleteMany({ studentId: student._id });
    await Student.findByIdAndDelete(student._id);
    await coursesModel.findByIdAndUpdate(freeCourse._id, { $pull: { enrolledStudents: student._id } });
    await coursesModel.findByIdAndUpdate(paidCourse._id, { $pull: { enrolledStudents: student._id } });
    console.log("Cleanup complete. All tests PASSED!");

  } catch (err) {
    console.error("Test Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
};

test();
