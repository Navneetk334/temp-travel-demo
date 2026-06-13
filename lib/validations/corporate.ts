import { z } from "zod";

// Validates Public B2B Corporate Leads
export const corporateLeadSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactName: z.string().min(2, "Contact person name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number (E.164 format)"),
  employeeCount: z.number().int().positive("Employee count must be positive").optional().nullable(),
  pickupLocations: z.string().min(3, "Please detail at least one pickup location").optional().nullable(),
  serviceType: z.string().min(3, "Please select or describe a service type"),
  requirements: z.string().min(10, "Please describe requirements in at least 10 characters").optional().nullable(),
});

// Validates Admin updates to B2B leads (Status & Notes)
export const leadAdminUpdateSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "LOST", "ARCHIVED"]),
  notes: z.string().optional().nullable(),
});
