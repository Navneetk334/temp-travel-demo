import { z } from "zod";

export const galleryItemSchema = z.object({
  title: z.string().optional().nullable(),
  imageUrl: z.string().url("Invalid image URL"),
  mediaType: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  category: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
});
