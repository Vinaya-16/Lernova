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
    
    // ==================== PROGRESS TRACKING FIELDS ====================
    
    // Overall progress percentage (0-100)
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    
    // Array of video IDs that the student has completed
    completedVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course.videos",
      }
    ],
    
    // Track video watching progress (for resume functionality)
    videoProgress: {
      type: Map,
      of: Number, // Store percentage watched for each video (0-100)
      default: {},
    },
    
    // Last video watched (for resume)
    lastWatchedVideo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course.videos",
    },
    
    // Last activity timestamp
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    
    // Course completion date
    completedAt: {
      type: Date,
    },
    
    // Total time spent watching (in seconds)
    totalWatchTime: {
      type: Number,
      default: 0,
    },
    
    // ==================== BILLING DETAILS ====================
    
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

// Index for faster progress queries
enrollmentSchema.index({ studentId: 1, progress: 1 });
enrollmentSchema.index({ courseId: 1, progress: 1 });
enrollmentSchema.index({ lastActivity: -1 });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema, "enrollment");

export default Enrollment;