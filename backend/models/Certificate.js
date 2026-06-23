import mongoose from "mongoose";

const { Schema } = mongoose;

const certificateSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    completionDate: {
      type: Date,
      required: true,
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    verificationUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent the same student from getting duplicate certificates for the same course
certificateSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export default mongoose.model("Certificate", certificateSchema);
