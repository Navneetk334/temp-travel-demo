import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rentalLeadSchema } from "@/lib/validations/rental";
import { verifyAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const tripType = searchParams.get("tripType") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = (status === "CONVERTED" || status === "WON") ? "WON" : status;
    }

    const buildRentalTripCondition = (tType: string) => {
      if (tType.toLowerCase() === "local") {
        return {
          AND: [
            {
              OR: [
                { tripType: { contains: "Local", mode: "insensitive" } },
                { tripType: { contains: "Hourly", mode: "insensitive" } },
              ]
            },
            {
              NOT: [
                { tripType: { contains: "Outstation", mode: "insensitive" } },
                { tripType: { contains: "Pickup", mode: "insensitive" } },
                { tripType: { contains: "Airport", mode: "insensitive" } },
                { tripType: { contains: "Tour", mode: "insensitive" } },
              ]
            }
          ]
        };
      }
      if (tType.toLowerCase() === "outstation") {
        return {
          AND: [
            {
              OR: [
                { tripType: { contains: "Outstation", mode: "insensitive" } },
                { tripType: { contains: "One Way", mode: "insensitive" } },
                { tripType: { contains: "Round Trip", mode: "insensitive" } },
              ]
            },
            {
              NOT: [
                { tripType: { contains: "Local", mode: "insensitive" } },
                { tripType: { contains: "Hourly", mode: "insensitive" } },
                { tripType: { contains: "Pickup", mode: "insensitive" } },
                { tripType: { contains: "Airport", mode: "insensitive" } },
                { tripType: { contains: "Tour", mode: "insensitive" } },
              ]
            }
          ]
        };
      }
      return { tripType: { contains: tType, mode: "insensitive" } };
    };

    if (tripType) {
      Object.assign(where, buildRentalTripCondition(tripType));
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { pickupLocation: { contains: search, mode: "insensitive" } },
        { dropLocation: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy object
    let orderBy: any = { createdAt: sortOrder };
    if (sortBy === "customerName") {
      orderBy = { customerName: sortOrder };
    } else if (sortBy === "pickupDateTime") {
      orderBy = { pickupDateTime: sortOrder };
    } else if (sortBy === "createdAt") {
      orderBy = { createdAt: sortOrder };
    }

    // Total matching records count
    const totalCount = await prisma.rentalLead.count({ where });

    // Fetch paginated records with vehicleCategory join
    const leads = await prisma.rentalLead.findMany({
      where,
      include: {
        vehicleCategory: {
          select: { id: true, name: true, slug: true }
        }
      },
      orderBy,
      skip,
      take: limit,
    });

    // Pipeline counts for stats header (filtered by tripType if specified)
    const countWhere: any = {};
    if (tripType) {
      Object.assign(countWhere, buildRentalTripCondition(tripType));
    }

    const [newCount, contactedCount, qualifiedCount, negotiationCount, wonCount, dispatchedCount, lostCount, archivedCount] = await Promise.all([
      prisma.rentalLead.count({ where: { ...countWhere, status: "NEW" } }),
      prisma.rentalLead.count({ where: { ...countWhere, status: "CONTACTED" } }),
      prisma.rentalLead.count({ where: { ...countWhere, status: "QUALIFIED" } }),
      prisma.rentalLead.count({ where: { ...countWhere, status: "NEGOTIATION" } }),
      prisma.rentalLead.count({ where: { ...countWhere, status: "WON" } }),
      prisma.rentalLead.count({ where: { ...countWhere, status: "DISPATCHED" } }),
      prisma.rentalLead.count({ where: { ...countWhere, status: "LOST" } }),
      prisma.rentalLead.count({ where: { ...countWhere, status: "ARCHIVED" } }),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    const mappedLeads = leads.map((lead: any) => {
      let bookingRef = (lead as any).bookingRef || null;
      if (!bookingRef && lead.notes) {
        const refMatch = lead.notes.match(/\[(?:BookingRef|Ref|PNR):\s*([a-zA-Z0-9_-]+)\]/i);
        if (refMatch) bookingRef = refMatch[1].trim();
      }
      return {
        ...lead,
        bookingRef,
        status: lead.status === "WON" ? "CONVERTED" : lead.status,
      };
    });

    return NextResponse.json({
      leads: mappedLeads,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
      stats: {
        total: newCount + contactedCount + qualifiedCount + negotiationCount + wonCount + dispatchedCount + lostCount + archivedCount,
        NEW: newCount,
        CONTACTED: contactedCount,
        QUALIFIED: qualifiedCount,
        NEGOTIATION: negotiationCount,
        CONVERTED: wonCount,
        DISPATCHED: dispatchedCount,
        WON: wonCount,
        LOST: lostCount,
        ARCHIVED: archivedCount,
      }
    }, { 
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    console.error("GET /api/rental/lead error:", error);
    return NextResponse.json({ error: "Failed to fetch rental inquiries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    const cleanPhone = (rawBody.phone || "").replace(/[\s-]/g, "");
    const formattedPhone = cleanPhone.startsWith("+")
      ? cleanPhone
      : (cleanPhone.length === 10 ? `+91${cleanPhone}` : (cleanPhone ? `+${cleanPhone}` : "+919820112233"));

    const sanitizedBody = {
      customerName: (rawBody.customerName || rawBody.contactName || "Customer Lead").trim(),
      email: (rawBody.email && rawBody.email.trim()) || `${formattedPhone.replace(/\D/g, "") || "dispatch"}@lead.temptravel.in`,
      phone: formattedPhone,
      pickupLocation: (rawBody.pickupLocation || rawBody.pickupLocations || "Pickup Location").trim(),
      dropLocation: rawBody.dropLocation ? String(rawBody.dropLocation).trim() : null,
      pickupDateTime: rawBody.pickupDateTime || new Date().toISOString(),
      returnDateTime: rawBody.returnDateTime || null,
      vehicleCategoryId: rawBody.vehicleCategoryId || "",
      tripType: (rawBody.tripType || rawBody.serviceType || "Local Hourly Rental").trim(),
      notes: rawBody.notes || rawBody.requirements || ""
    };

    const result = rentalLeadSchema.safeParse(sanitizedBody);
    const dataToSave = result.success ? result.data : sanitizedBody;
    const targetStatus = (rawBody.status === "CONVERTED" || rawBody.status === "WON") ? "WON" : (rawBody.status || "NEW");

    try {
      let catId = rawBody.vehicleCategoryId;
      let validCat = null;
      if (catId) {
        validCat = await prisma.vehicleCategory.findUnique({ where: { id: catId } }).catch(() => null);
      }
      if (!validCat) {
        validCat = await prisma.vehicleCategory.findFirst().catch(() => null);
      }

      if (validCat) {
        const lead = await prisma.rentalLead.create({
          data: {
            customerName: dataToSave.customerName,
            email: dataToSave.email,
            phone: dataToSave.phone,
            pickupLocation: dataToSave.pickupLocation,
            dropLocation: dataToSave.dropLocation || null,
            pickupDateTime: new Date(dataToSave.pickupDateTime),
            returnDateTime: dataToSave.returnDateTime ? new Date(dataToSave.returnDateTime) : null,
            vehicleCategoryId: validCat.id,
            tripType: dataToSave.tripType,
            notes: rawBody.notes || rawBody.requirements || null,
            status: targetStatus as any,
          },
        });
        return NextResponse.json({
          ...lead,
          status: lead.status === "WON" ? "CONVERTED" : lead.status,
        }, { status: 201 });
      }
    } catch (dbError) {
      console.warn("Database unavailable for rental lead creation, generating fallback response:", dbError);
    }

    const fallbackLead = {
      id: `rent_${Date.now()}`,
      ...dataToSave,
      vehicleCategoryId: rawBody.vehicleCategoryId || "default",
      status: (rawBody.status === "WON" || rawBody.status === "CONVERTED") ? "CONVERTED" : (rawBody.status || "NEW"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return NextResponse.json(fallbackLead, { status: 201 });
  } catch (error) {
    console.error("POST /api/rental/lead error:", error);
    return NextResponse.json({ error: "Failed to process rental inquiry." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes, tripType, serviceType } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing lead id" }, { status: 400 });
    }

    const dbStatus = (status === "CONVERTED" || status === "WON") ? "WON" : status;
    const finalTripType = tripType || serviceType;

    let updatedResult: any = null;

    const rawPhone = (body.phone || "").toString();
    const cleanPhoneDigits = rawPhone.replace(/\D/g, "").slice(-10);

    // Check if lead exists in RentalLead (by id, fallback by phone)
    let existingRental = await prisma.rentalLead.findUnique({ where: { id } });
    if (!existingRental && cleanPhoneDigits.length === 10) {
      existingRental = await prisma.rentalLead.findFirst({
        where: { phone: { contains: cleanPhoneDigits } },
        orderBy: { createdAt: "desc" },
      });
    }

    if (existingRental) {
      const targetRentalId = existingRental.id;
      const isSwitchingToPickupOrCorp = finalTripType && (
        finalTripType.toLowerCase().includes("pickup") ||
        finalTripType.toLowerCase().includes("drop") ||
        finalTripType.toLowerCase().includes("airport") ||
        finalTripType.toLowerCase().includes("transfer") ||
        finalTripType.toLowerCase().includes("point") ||
        finalTripType.toLowerCase().includes("corporate")
      );

      if (isSwitchingToPickupOrCorp) {
        // Migrate from RentalLead to CorporateLead
        const isCorp = finalTripType.toLowerCase().includes("corporate") || finalTripType.toLowerCase().includes("working");
        const migratedCorp = await prisma.corporateLead.create({
          data: {
            id: targetRentalId,
            companyName: isCorp ? "Corporate Client" : "Individual",
            contactName: existingRental.customerName,
            email: existingRental.email,
            phone: existingRental.phone,
            pickupLocations: existingRental.pickupLocation,
            serviceType: finalTripType,
            requirements: `Pickup Address: ${existingRental.pickupLocation}. Drop Address: ${existingRental.dropLocation || "N/A"}.`,
            notes: notes !== undefined ? notes : existingRental.notes,
            status: (dbStatus || existingRental.status) as any,
            createdAt: existingRental.createdAt,
          }
        });

        await prisma.rentalLead.delete({ where: { id: targetRentalId } });
        updatedResult = {
          ...migratedCorp,
          customerName: migratedCorp.contactName,
          tripType: migratedCorp.serviceType,
          status: migratedCorp.status === "WON" ? "CONVERTED" : migratedCorp.status
        };
      } else {
        const updated = await prisma.rentalLead.update({
          where: { id: targetRentalId },
          data: {
            ...(dbStatus ? { status: dbStatus as any } : {}),
            ...(notes !== undefined ? { notes } : {}),
            ...(finalTripType ? { tripType: finalTripType } : {}),
          }
        });
        updatedResult = {
          ...updated,
          status: updated.status === "WON" ? "CONVERTED" : updated.status
        };
      }
    } else {
      // Check if lead exists in CorporateLead (by id, fallback by phone)
      let existingCorp = await prisma.corporateLead.findUnique({ where: { id } });
      if (!existingCorp && cleanPhoneDigits.length === 10) {
        existingCorp = await prisma.corporateLead.findFirst({
          where: { phone: { contains: cleanPhoneDigits } },
          orderBy: { createdAt: "desc" },
        });
      }

      if (existingCorp) {
        const targetCorpId = existingCorp.id;
        const isSwitchingToRental = finalTripType && (
          finalTripType.toLowerCase().includes("local") ||
          finalTripType.toLowerCase().includes("hourly") ||
          finalTripType.toLowerCase().includes("outstation")
        );

        if (isSwitchingToRental) {
          // Migrate from CorporateLead to RentalLead
          const defaultCat = await prisma.vehicleCategory.findFirst();
          let dropLoc = null;
          if (existingCorp.requirements) {
            const dropMatch = existingCorp.requirements.match(/(?:Drop Address|Drop Location|Drop):\s*([^.\n]+(?:\.[^.\n]+)*?)(?=\.\s*(?:Pickup Time|Drop Time|Fare|Advance|Car|Chauffeur|Notes|$)|$|\n)/i);
            if (dropMatch && dropMatch[1]) dropLoc = dropMatch[1].trim();
          }

          const migratedRental = await prisma.rentalLead.create({
            data: {
              id: targetCorpId,
              customerName: existingCorp.contactName,
              email: existingCorp.email,
              phone: existingCorp.phone,
              pickupLocation: existingCorp.pickupLocations || "Pickup Location",
              dropLocation: dropLoc,
              pickupDateTime: existingCorp.createdAt || new Date(),
              vehicleCategoryId: defaultCat?.id || "default",
              tripType: finalTripType,
              notes: notes !== undefined ? notes : existingCorp.notes,
              status: (dbStatus || existingCorp.status) as any,
              createdAt: existingCorp.createdAt,
            }
          });

          await prisma.corporateLead.delete({ where: { id: targetCorpId } });
          updatedResult = {
            ...migratedRental,
            status: migratedRental.status === "WON" ? "CONVERTED" : migratedRental.status
          };
        } else {
          const updatedCorp = await prisma.corporateLead.update({
            where: { id: targetCorpId },
            data: {
              ...(dbStatus ? { status: dbStatus as any } : {}),
              ...(notes !== undefined ? { notes } : {}),
              ...(finalTripType ? { serviceType: finalTripType } : {}),
            }
          });
          updatedResult = {
            ...updatedCorp,
            customerName: updatedCorp.contactName,
            tripType: updatedCorp.serviceType,
            status: updatedCorp.status === "WON" ? "CONVERTED" : updatedCorp.status
          };
        }
      } else {
        return NextResponse.json({ error: "Lead not found in database" }, { status: 404 });
      }
    }

    if (finalTripType && updatedResult?.phone) {
      try {
        const cleanPhone = updatedResult.phone.replace(/\D/g, "").slice(-10);
        const matchingCustomers = await prisma.user.findMany({
          where: { phone: { contains: cleanPhone } },
          select: { id: true }
        });
        const customerIds = matchingCustomers.map((c) => c.id);

        let newBookingType = "LOCAL_RENTAL";
        const stLower = finalTripType.toLowerCase();
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
            updatedNotes = updatedNotes.replace(/\[TripType:\s*([^\]]+)\]/i, `[TripType: ${finalTripType}]`);
          } else {
            updatedNotes = `[TripType: ${finalTripType}] ${updatedNotes}`.trim();
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
        console.warn("Could not sync rental booking type to active bookings:", syncErr);
      }
    }

    return NextResponse.json(updatedResult);
  } catch (err: any) {
    console.error("PUT /api/rental/lead error:", err);
    return NextResponse.json({ error: err.message || "Failed to update rental lead" }, { status: 500 });
  }
}

export const PATCH = PUT;

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing lead id" }, { status: 400 });
    }

    try {
      await prisma.rentalLead.delete({ where: { id } });
    } catch (e) {
      await prisma.corporateLead.delete({ where: { id } }).catch(() => null);
    }

    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/rental/lead error:", err);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
