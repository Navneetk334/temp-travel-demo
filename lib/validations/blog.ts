import { z } from "zod";

// Slug format validator (alphanumeric and dashes)
const slugSchema = z
  .string()
  .min(2, "Slug must be at least 2 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must only contain lowercase letters, numbers, and hyphens (e.g. travel-tips)");

// Validates blog posts creation and editing
export const blogPostSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  slug: slugSchema,
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  featuredImage: z.string().url("Invalid image URL").or(z.string().length(0)).optional().nullable(),
  published: z.boolean().default(false),
  categoryId: z.string().uuid("Please select a valid category"),
  tags: z.array(z.string().min(1, "Tag cannot be empty")).default([]),
  seoTitle: z.string().max(70, "SEO Title should not exceed 70 characters").optional().nullable(),
  seoDescription: z.string().max(160, "SEO Description should not exceed 160 characters").optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
});

// Validates blog categories creation
export const blogCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: slugSchema,
  description: z.string().optional().nullable(),
});
