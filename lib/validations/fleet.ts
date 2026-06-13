import { z } from "zod";

// Validates Vehicle Categories
export const vehicleCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Invalid slug format (lowercase, numbers, hyphens only)"),
  description: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  baseHourlyRate: z.number().positive("Base hourly rate must be positive"),
  baseKmsRate: z.number().positive("Base kms rate must be positive"),
  extraHrRate: z.number().positive("Extra hr rate must be positive"),
  extraKmRate: z.number().positive("Extra km rate must be positive"),
  outstationKmRate: z.number().positive("Outstation km rate must be positive"),
});

// Validates individual vehicles in the fleet
export const fleetVehicleSchema = z.object({
  model: z.string().min(2, "Model must be at least 2 characters"),
  make: z.string().min(2, "Make must be at least 2 characters"),
  registrationNumber: z.string()
    .min(5, "Registration number must be at least 5 characters")
    .regex(/^[A-Z]{2}[0-9a-zA-Z-]{3,10}$/, "Invalid registration number format (e.g. MH12PQ9999 or MH-12-PQ-9999)"),
  categoryId: z.string().uuid("Invalid category ID"),
  capacity: z.number().int().min(1, "Capacity must be at least 1 seat"),
  status: z.enum(["AVAILABLE", "ON_TRIP", "MAINTENANCE", "INACTIVE"]).default("AVAILABLE"),
  driverId: z.string().uuid("Invalid driver ID").optional().nullable(),
});

// Validates Vehicle/Rental Lead forms
export const fleetInquirySchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  pickupLocation: z.string().min(3, "Pickup location must be at least 3 characters"),
  dropLocation: z.string().optional(),
  pickupDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date/time format" }),
  returnDateTime: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), { message: "Invalid return date/time format" }),
  vehicleCategoryId: z.string().uuid("Invalid vehicle category ID"),
});
