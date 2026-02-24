import z from "zod";

export const productSchema = z.object({
  name: z.string().min(3).max(50),
  name_es: z.string().min(3).max(50).optional(),
  description: z.string().min(10).max(254),
  description_es: z.string().min(10).max(254).optional(),
  price: z.number().min(1),
  stock: z.number().min(0).int(),
  images: z.array(z.string().url().min(1)),
  videoUrl: z.string().nullable().optional(),
  videoSource: z.enum(["cloudinary", "youtube"]).nullable().optional(),
});
