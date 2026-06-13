import { z } from "zod";

export const contactLeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable().or(z.literal("")),
  subject: z.string().optional().nullable().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
