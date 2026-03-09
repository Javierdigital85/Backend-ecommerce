import { z } from "zod";

export const carouselSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
  image: z.string().min(1, "Image must be a valid URL"),
  order: z.number().min(0).default(0),
  active: z.boolean().default(true),
});
