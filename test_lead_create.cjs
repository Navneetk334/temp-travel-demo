const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testCreate() {
  try {
    const lead = await prisma.corporateLead.create({
      data: {
        companyName: "Individual",
        contactName: "Test Lead",
        email: "test@temptravel.co.in",
        phone: "+919560332555",
        employeeCount: 1,
        pickupLocations: "T3 Arrival Road",
        serviceType: "Pickup & Drop (Individual)",
        requirements: "Test requirements",
        status: "NEW",
      }
    });
    console.log("Successfully created corporateLead in DB:", lead);
    // Delete it after test
    await prisma.corporateLead.delete({ where: { id: lead.id } });
    console.log("Cleaned up test corporateLead");
  } catch (err) {
    console.error("corporateLead.create failed with error:", err);
  }
}

testCreate().finally(() => prisma.$disconnect());

