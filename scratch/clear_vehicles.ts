import prisma from "../lib/prisma";

async function clearVehicles() {
  try {
    const deleted = await prisma.fleetVehicle.deleteMany({});
    console.log("Deleted database vehicles count:", deleted.count);
  } catch (e) {
    console.log("Database offline or table empty, skipping Prisma deleteMany.");
  }
}

clearVehicles().catch(console.error).finally(() => prisma.$disconnect());
