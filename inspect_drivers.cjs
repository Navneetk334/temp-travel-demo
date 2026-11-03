const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function inspectDrivers() {
  try {
    const drivers = await prisma.user.findMany({
      where: { role: "DRIVER" }
    });
    console.log("Database drivers count:", drivers.length);
    drivers.forEach(d => {
      console.log(`Driver ID: ${d.id}, Name: ${d.name}, Phone: ${d.phone}, Aadhaar: ${d.aadhaarNumber}, PAN: ${d.panNumber}, License: ${d.licenseNumber}, Photo: ${d.photoUrl ? "HAS_PHOTO" : "NO_PHOTO"}`);
    });
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
inspectDrivers();

