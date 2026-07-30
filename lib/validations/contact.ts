import { z } from "zod";

// Validates Public Contact Form Messages
export const contactLeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable().or(z.literal("")),
  subject: z.string().optional().nullable().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Validates Admin Updates to Contact Leads (Mark Read / Replied / Status)
export const contactLeadAdminUpdateSchema = z.object({
  status: z.enum(["NEW", "READ", "CONTACTED", "QUALIFIED", "LOST", "ARCHIVED"]),
});
