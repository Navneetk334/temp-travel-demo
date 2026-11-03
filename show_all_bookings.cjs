const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function showAllBookings() {
  const all = await prisma.booking.findMany({
    include: { customer: true, vehicle: true }
  });
  console.log("TOTAL BOOKINGS IN DATABASE:", all.length);
  all.forEach((b, i) => {
    console.log(`\n--- BOOKING #${i+1} ---`);
    console.log("ID:", b.id);
    console.log("BookingNumber:", b.bookingNumber);
    console.log("Customer:", b.customer?.name, "Phone:", b.customer?.phone, "Email:", b.customer?.email);
    console.log("Vehicle:", b.vehicle?.registrationNumber, b.vehicle?.model);
    console.log("Status:", b.status);
    console.log("Amount:", b.totalAmount, "Net:", b.netAmount);
    console.log("Type:", b.type);
    console.log("CreatedAt:", b.createdAt);
    console.log("Notes:", b.notes);
  });
}

showAllBookings().finally(() => prisma.$disconnect());

