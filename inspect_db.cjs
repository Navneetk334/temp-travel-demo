const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const bookings = await prisma.booking.findMany({
    include: {
      customer: true,
      vehicle: true,
    }
  });
  console.log("=== BOOKINGS IN PRISMA (" + bookings.length + ") ===");
  bookings.forEach(b => {
    console.log(`ID: ${b.id}, Number: ${b.bookingNumber}, Customer: ${b.customer?.name} (${b.customer?.phone}), Status: ${b.status}, Total: ${b.totalAmount}`);
  });

  const rentalLeads = await prisma.rentalLead.findMany();
  console.log("\n=== RENTAL LEADS IN PRISMA (" + rentalLeads.length + ") ===");
  rentalLeads.forEach(r => {
    console.log(`ID: ${r.id}, Name: ${r.customerName}, Phone: ${r.phone}, Status: ${r.status}, TripType: ${r.tripType}, CreatedAt: ${r.createdAt}`);
  });

  const corporateLeads = await prisma.corporateLead.findMany();
  console.log("\n=== CORPORATE LEADS IN PRISMA (" + corporateLeads.length + ") ===");
  corporateLeads.forEach(c => {
    console.log(`ID: ${c.id}, Company: ${c.companyName}, Contact: ${c.contactPerson}, Phone: ${c.phone}, Status: ${c.status}`);
  });

  const contactLeads = await prisma.contactLead.findMany();
  console.log("\n=== CONTACT LEADS IN PRISMA (" + contactLeads.length + ") ===");
  contactLeads.forEach(c => {
    console.log(`ID: ${c.id}, Name: ${c.name}, Email: ${c.email}, Status: ${c.status}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());

