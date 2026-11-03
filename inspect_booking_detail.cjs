const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const b = await prisma.booking.findUnique({
    where: { bookingNumber: "TT-FFE86C" },
    include: {
      customer: true,
      vehicle: true,
      vehicleCategory: true,
      payments: true,
    }
  });
  console.log("Booking TT-FFE86C:", JSON.stringify(b, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

