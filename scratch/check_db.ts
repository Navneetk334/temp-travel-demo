import prisma from "../lib/prisma";

async function check() {
  const count = await prisma.fleetVehicle.count();
  console.log("DATABASE_FLEET_VEHICLE_COUNT:", count);
  const vehicles = await prisma.fleetVehicle.findMany();
  console.log("DB_VEHICLES:", JSON.stringify(vehicles, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
