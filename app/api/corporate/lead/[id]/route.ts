import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { leadAdminUpdateSchema } from "@/lib/validations/corporate";
import { verifyAdmin } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const lead = await prisma.corporateLead.findUnique({
      where: { id },
    });

    if (lead) {
      return NextResponse.json({
        ...lead,
        status: lead.status === "WON" ? "CONVERTED" : lead.status,
      }, { status: 200 });
    }

    // Fallback: check if lead exists in RentalLead
    const rentalLead = await prisma.rentalLead.findUnique({
      where: { id },
    });

    if (rentalLead) {
      return NextResponse.json({
        id: rentalLead.id,
        companyName: "Individual",
        contactName: rentalLead.customerName,
        email: rentalLead.email,
        phone: rentalLead.phone,
        pickupLocations: rentalLead.pickupLocation,
        pickupLocation: rentalLead.pickupLocation,
        dropLocation: rentalLead.dropLocation,
        serviceType: rentalLead.tripType || "Local Rental",
        requirements: rentalLead.notes || "",
        notes: rentalLead.notes || "",
        status: rentalLead.status === "WON" ? "CONVERTED" : rentalLead.status,
        createdAt: rentalLead.createdAt,
        updatedAt: rentalLead.updatedAt,
      }, { status: 200 });
    }

    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  } catch (error) {
    console.error(`GET /api/corporate/lead/${id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const result = leadAdminUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { status, tripType, serviceType, ...restData } = result.data;
    const dbStatus = status === "CONVERTED" ? "WON" : status;
    const resolvedServiceType = serviceType || tripType;

    // Check if lead currently exists in CorporateLead
    const existingCorp = await prisma.corporateLead.findUnique({ where: { id } });
    let updatedLeadResult: any = null;

    if (existingCorp) {
      const isSwitchingToRental = resolvedServiceType && (
        resolvedServiceType.toLowerCase().includes("local") ||
        resolvedServiceType.toLowerCase().includes("hourly") ||
        resolvedServiceType.toLowerCase().includes("outstation")
      );

      if (isSwitchingToRental) {
        // Automatically migrate from CorporateLead to RentalLead table
        const defaultCat = await prisma.vehicleCategory.findFirst();
        let dropLocation = null;
        if (existingCorp.requirements) {
          const dropMatch = existingCorp.requirements.match(/(?:Drop Address|Drop Location|Drop):\s*([^.\n]+(?:\.[^.\n]+)*?)(?=\.\s*(?:Pickup Time|Drop Time|Fare|Advance|Car|Chauffeur|Notes|$)|$|\n)/i);
          if (dropMatch && dropMatch[1]) dropLocation = dropMatch[1].trim();
        }

        const migratedRental = await prisma.rentalLead.create({
          data: {
            id,
            customerName: existingCorp.contactName,
            email: existingCorp.email,
            phone: existingCorp.phone,
            pickupLocation: existingCorp.pickupLocations || "Pickup Location",
            dropLocation,
            pickupDateTime: existingCorp.createdAt || new Date(),
            vehicleCategoryId: defaultCat?.id || "default",
            tripType: resolvedServiceType,
            notes: restData.notes !== undefined ? restData.notes : existingCorp.notes,
            status: (dbStatus || existingCorp.status) as any,
            createdAt: existingCorp.createdAt,
          }
        });

        await prisma.corporateLead.delete({ where: { id } });
        updatedLeadResult = {
          ...migratedRental,
          companyName: existingCorp.companyName,
          contactName: migratedRental.customerName,
          serviceType: migratedRental.tripType,
          status: migratedRental.status === "WON" ? "CONVERTED" : migratedRental.status
        };
      } else {
        const updatedCorp = await prisma.corporateLead.update({
          where: { id },
          data: {
            ...restData,
            ...(resolvedServiceType !== undefined ? { serviceType: resolvedServiceType } : {}),
            ...(dbStatus ? { status: dbStatus as any } : {}),
          },
        });
        updatedLeadResult = {
          ...updatedCorp,
          status: updatedCorp.status === "WON" ? "CONVERTED" : updatedCorp.status
        };
      }
    } else {
      // Check if lead exists in RentalLead (previously migrated or created as rental)
      const existingRental = await prisma.rentalLead.findUnique({ where: { id } });
      if (existingRental) {
        const isSwitchingToCorpOrPickup = resolvedServiceType && (
          resolvedServiceType.toLowerCase().includes("pickup") ||
          resolvedServiceType.toLowerCase().includes("drop") ||
          resolvedServiceType.toLowerCase().includes("airport") ||
          resolvedServiceType.toLowerCase().includes("transfer") ||
          resolvedServiceType.toLowerCase().includes("corporate") ||
          resolvedServiceType.toLowerCase().includes("point")
        );

        if (isSwitchingToCorpOrPickup) {
          // Migrate back to CorporateLead table
          const isCorp = resolvedServiceType.toLowerCase().includes("corporate") || resolvedServiceType.toLowerCase().includes("working");
          const migratedCorp = await prisma.corporateLead.create({
            data: {
              id,
              companyName: isCorp ? "Corporate Client" : "Individual",
              contactName: existingRental.customerName,
              email: existingRental.email,
              phone: existingRental.phone,
              pickupLocations: existingRental.pickupLocation,
              serviceType: resolvedServiceType,
              requirements: `Pickup Address: ${existingRental.pickupLocation}. Drop Address: ${existingRental.dropLocation || "N/A"}.`,
              notes: restData.notes !== undefined ? restData.notes : existingRental.notes,
              status: (dbStatus || existingRental.status) as any,
              createdAt: existingRental.createdAt,
            }
          });

          await prisma.rentalLead.delete({ where: { id } });
          updatedLeadResult = {
            ...migratedCorp,
            status: migratedCorp.status === "WON" ? "CONVERTED" : migratedCorp.status
          };
        } else {
          const updatedRental = await prisma.rentalLead.update({
            where: { id },
            data: {
              ...(dbStatus ? { status: dbStatus as any } : {}),
              ...(restData.notes !== undefined ? { notes: restData.notes } : {}),
              ...(resolvedServiceType ? { tripType: resolvedServiceType } : {}),
            }
          });
          updatedLeadResult = {
            ...updatedRental,
            companyName: "Individual",
            contactName: updatedRental.customerName,
            serviceType: updatedRental.tripType,
            status: updatedRental.status === "WON" ? "CONVERTED" : updatedRental.status
          };
        }
      } else {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
    }

    if (resolvedServiceType && updatedLeadResult?.phone) {
      try {
        const cleanPhone = updatedLeadResult.phone.replace(/\D/g, "").slice(-10);
        const matchingCustomers = await prisma.user.findMany({
          where: { phone: { contains: cleanPhone } },
          select: { id: true }
        });
        const customerIds = matchingCustomers.map((c) => c.id);

        let newBookingType = "LOCAL_RENTAL";
        const stLower = resolvedServiceType.toLowerCase();
        if (stLower.includes("outstation")) newBookingType = "OUTSTATION";
        else if (stLower.includes("airport") || stLower.includes("pickup") || stLower.includes("drop") || stLower.includes("transfer")) {
          newBookingType = "AIRPORT_TRANSFER";
        } else if (stLower.includes("tour")) newBookingType = "TOUR_PACKAGE";

        const bookingsToUpdate = await prisma.booking.findMany({
          where: {
            OR: [
              { customerId: { in: customerIds } },
              { notes: { contains: id } }
            ]
          }
        });

        for (const b of bookingsToUpdate) {
          let updatedNotes = b.notes || "";
          if (updatedNotes.includes("[TripType:")) {
            updatedNotes = updatedNotes.replace(/\[TripType:\s*([^\]]+)\]/i, `[TripType: ${resolvedServiceType}]`);
          } else {
            updatedNotes = `[TripType: ${resolvedServiceType}] ${updatedNotes}`.trim();
          }
          await prisma.booking.update({
            where: { id: b.id },
            data: {
              type: newBookingType as any,
              notes: updatedNotes
            }
          });
        }
      } catch (syncErr) {
        console.warn("Could not sync booking type to active bookings:", syncErr);
      }
    }

    return NextResponse.json(updatedLeadResult, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/corporate/lead/${id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const PATCH = PUT;

export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Delete from whichever table contains the record
    try {
      await prisma.corporateLead.delete({
        where: { id: id },
      });
    } catch (e) {
      // not in corporateLead, try rentalLead
      await prisma.rentalLead.delete({
        where: { id: id },
      }).catch(() => null);
    }

    try {
      revalidatePath("/admin");
      revalidatePath("/admin/corporate-leads");
      revalidatePath("/admin/corporate-inquiry-leads");
      revalidatePath("/admin/local-rental-leads");
      revalidatePath("/admin/outstation-leads");
    } catch (e) {
      console.warn("revalidatePath error in DELETE /api/corporate/lead/[id]:", e);
    }

    return NextResponse.json({ message: "Lead deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/corporate/lead/${id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
