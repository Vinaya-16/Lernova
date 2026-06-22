import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["free", "paid"],
      required: true,
    },
    // Billing Details (only for paid courses)
    fullName: {
      type: String,
      required: function() {
        return this.paymentStatus === "paid";
      },
    },
    email: {
      type: String,
      required: function() {
        return this.paymentStatus === "paid";
      },
    },
    phoneNumber: {
      type: String,
      required: function() {
        return this.paymentStatus === "paid";
      },
    },
    address: {
      type: String,
      required: function() {
        return this.paymentStatus === "paid";
      },
    },
    city: {
      type: String,
      required: function() {
        return this.paymentStatus === "paid";
      },
    },
    state: {
      type: String,
      required: function() {
        return this.paymentStatus === "paid";
      },
    },
    zipCode: {
      type: String,
      required: function() {
        return this.paymentStatus === "paid";
      },
    },
    // Payment Details (only for paid courses)
    paymentMethod: {
      type: String,
      required: function() {
        return this.paymentStatus === "paid";
      },
    },
    cardholderName: {
      type: String,
    },
    transactionId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate enrollment for the same student and course
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema, "enrollment");

export default Enrollment;
