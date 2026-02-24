import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products/images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  } as any,
});

const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products/videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "webm"],
  } as any,
});

export const uploadImage = multer({ storage: imageStorage });
export const uploadVideo = multer({ storage: videoStorage });
