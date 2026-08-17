import prisma from "../lib/prisma";

async function main() {
  console.log("Clearing all leads and booking dispatch entries from database...");

  const deletedPayments = await prisma.razorpayPayment.deleteMany({});
  console.log(`Deleted ${deletedPayments.count} RazorpayPayment entries.`);

  const deletedBookings = await prisma.booking.deleteMany({});
  console.log(`Deleted ${deletedBookings.count} Booking entries.`);

  const deletedCorporateLeads = await prisma.corporateLead.deleteMany({});
  console.log(`Deleted ${deletedCorporateLeads.count} CorporateLead entries.`);

  const deletedRentalLeads = await prisma.rentalLead.deleteMany({});
  console.log(`Deleted ${deletedRentalLeads.count} RentalLead entries.`);

  const deletedContactLeads = await prisma.contactLead.deleteMany({});
  console.log(`Deleted ${deletedContactLeads.count} ContactLead entries.`);

  console.log("SUCCESS: All leads and booking dispatch entries removed cleanly.");
}

main()
  .catch((e) => {
    console.error("Error clearing database entries:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
