import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    resource_type: "video",
    folder: "lms/videos",
    allowed_formats: ["mp4", "mov"],
  },
});

export const uploadVideo = multer({ storage });
export default cloudinary;