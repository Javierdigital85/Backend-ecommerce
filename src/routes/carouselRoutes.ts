import express from "express";
import * as carouselController from "../controllers/carouselController";

const router = express.Router();

router.get("/", carouselController.getAllSlides);
router.get("/:id", carouselController.getSlideById);
router.post("/", carouselController.createSlide);
router.put("/:id", carouselController.updateSlide);
router.delete("/:id", carouselController.deleteSlide);

export default router;
