import { RequestHandler } from "express";
import { carouselSchema } from "../schemas/carouselSchema";
import CarouselModel from "../models/Carousel";
import { ZodError } from "zod";

export const getAllSlides: RequestHandler = async (req, res) => {
  try {
    const slides = await CarouselModel.find({ active: true }).sort("order");
    res.status(200).json({ slides, message: "Slides obtained successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching slides" });
  }
};

export const getSlideById: RequestHandler = async (req, res) => {
  try {
    const slide = await CarouselModel.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: "Slide not found" });
    }
    res.status(200).json({ slide });
  } catch (error) {
    res.status(500).json({ message: "Error fetching slide" });
  }
};

export const createSlide: RequestHandler = async (req, res) => {
  try {
    const newSlide = await CarouselModel.create(req.body);
    res.status(201).json({ newSlide });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json(error.issues.map((issue) => ({ message: issue.message })));
    }
    res.status(500).json({ message: "Error creating slide" });
  }
};

export const updateSlide: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedSlide = await CarouselModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!updatedSlide) {
      return res.status(404).json({ message: "Slide not found" });
    }
    res.status(200).json({ updatedSlide });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json(error.issues.map((issue) => ({ message: issue.message })));
    }
    res.status(500).json({ message: "Error updating slide" });
  }
};

export const deleteSlide: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteSlide = await CarouselModel.findByIdAndDelete(id);
    if (!deleteSlide) {
      return res.status(404).json({ message: "Slide not found" });
    }
    res.status(200).json({ message: "Slide deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting slide" });
  }
};
