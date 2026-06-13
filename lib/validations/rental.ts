import { z } from "zod";

// Validates Public B2C Car Rental Inquiries
export const rentalLeadSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  pickupLocation: z.string().min(3, "Pickup location must be at least 3 characters"),
  dropLocation: z.string().optional().nullable(),
  pickupDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid pickup date/time format" }),
  returnDateTime: z.string().optional().nullable().refine((val) => !val || !isNaN(Date.parse(val)), { message: "Invalid return date/time format" }),
  vehicleCategoryId: z.string().uuid("Invalid vehicle category ID"),
  tripType: z.string().min(3, "Please specify a trip type"),
});

// Validates Admin Updates to Rental Inquiries
export const rentalLeadAdminUpdateSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "LOST", "ARCHIVED"]),
  notes: z.string().optional().nullable(),
});
