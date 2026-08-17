import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearDemoLeadsAndBookings() {
  console.log("Clearing demo leads and bookings only...");

  await prisma.razorpayPayment.deleteMany({});
  console.log("✔ Cleared Razorpay Payments");

  await prisma.booking.deleteMany({});
  console.log("✔ Cleared Bookings");

  await prisma.corporateLead.deleteMany({});
  console.log("✔ Cleared Corporate Leads");

  await prisma.rentalLead.deleteMany({});
  console.log("✔ Cleared Rental Leads");

  await prisma.contactLead.deleteMany({});
  console.log("✔ Cleared Contact Leads");

  console.log("==========================================");
  console.log("Demo leads & bookings removed!");
  console.log("Preserved: Fleet Vehicles, Tour Packages, Blog Posts, Gallery, Testimonials, Categories, and Admin Accounts.");
}

clearDemoLeadsAndBookings()
  .catch((e) => {
    console.error("Error clearing demo leads:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
