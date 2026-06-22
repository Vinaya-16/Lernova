// models/enrollmentModel.js
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
    
    // ========== PROGRESS TRACKING FIELDS ==========
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
      }
    ],
    videoProgress: {
      type: Map,
      of: Number,
      default: {},
    },
    lastWatchedVideo: {
      type: mongoose.Schema.Types.ObjectId,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    totalWatchTime: {
      type: Number,
      default: 0,
    },
    
    // ========== BILLING DETAILS ==========
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

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ studentId: 1, progress: 1 });
enrollmentSchema.index({ courseId: 1, progress: 1 });
enrollmentSchema.index({ lastActivity: -1 });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema, "enrollment");

export default Enrollment;