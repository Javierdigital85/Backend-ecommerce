import { Router } from "express";
import {
  uploadImage,
  uploadVideo,
  uploadCarouselImage,
} from "../middleware/uploadMiddleware";

const router = Router();

router.post("/image", uploadImage.single("image"), (req, res) => {
  res.json({ url: req.file?.path });
});

router.post("/video", uploadVideo.single("video"), (req, res) => {
  res.json({ url: req.file?.path });
});

router.post("/carousel", uploadCarouselImage.single("image"), (req, res) => {
  res.json({ url: req.file?.path });
});

export default router;
