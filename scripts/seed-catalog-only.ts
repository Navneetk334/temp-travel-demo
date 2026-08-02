import { PrismaClient, AdminRole, UserRole, VehicleStatus, MediaType } from "@prisma/client";

const prisma = new PrismaClient();

async function seedCatalogOnly() {
  console.log("Seeding Catalog items (Fleet, Tour Packages, Blog Posts, Gallery, Testimonials, Admins, Drivers)...");

  // 1. Clear existing tables
  await prisma.razorpayPayment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.corporateLead.deleteMany({});
  await prisma.rentalLead.deleteMany({});
  await prisma.contactLead.deleteMany({});
  await prisma.gallery.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.blogPost.deleteMany({});
  await prisma.blogCategory.deleteMany({});
  await prisma.fleetVehicle.deleteMany({});
  await prisma.vehicleCategory.deleteMany({});
  await prisma.tourPackage.deleteMany({});
  await prisma.packageCategory.deleteMany({});
  await prisma.siteSetting.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.admin.deleteMany({});

  // 2. Admins
  const superAdmin = await prisma.admin.create({
    data: {
      name: "Navneet Kumar",
      email: "admin@temptravels.com",
      passwordHash: "$2a$12$m.wWAx.WlIOJaTxyDRn0ku14SJkcJYFIcu4OH8Tno2sWbHBC6ak86", // admin123
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  await prisma.admin.create({
    data: {
      name: "Ramesh Sharma",
      email: "ramesh@temptravels.com",
      passwordHash: "$2a$12$m.wWAx.WlIOJaTxyDRn0ku14SJkcJYFIcu4OH8Tno2sWbHBC6ak86",
      role: AdminRole.MANAGER,
      isActive: true,
    },
  });

  // 3. Drivers
  const driverNames = ["Rajesh Yadav", "Suresh Kumar", "Amit Singh", "Vijay Pal", "Vikram Rathore", "Karan Sharma", "Arjun Dev", "Harpreet Singh"];
  const drivers = [];
  for (let i = 0; i < driverNames.length; i++) {
    const d = await prisma.user.create({
      data: {
        name: driverNames[i],
        email: `driver${i + 1}@temptravels.com`,
        phone: `+91999999910${i}`,
        passwordHash: "$2a$12$m.wWAx.WlIOJaTxyDRn0ku14SJkcJYFIcu4OH8Tno2sWbHBC6ak86",
        role: UserRole.DRIVER,
        isActive: true,
      },
    });
    drivers.push(d);
  }

  // 4. Vehicle Categories & Fleet Vehicles
  const sedanCat = await prisma.vehicleCategory.create({
    data: {
      name: "Executive Sedan",
      slug: "executive-sedan",
      description: "Comfortable 4-seater sedans for corporate commuting, city travel, and airport transit.",
      imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341",
      baseHourlyRate: "250.00",
      baseKmsRate: "14.00",
      extraHrRate: "150.00",
      extraKmRate: "14.00",
      outstationKmRate: "14.00",
    },
  });

  const suvCat = await prisma.vehicleCategory.create({
    data: {
      name: "Premium SUV",
      slug: "premium-suv",
      description: "Spacious 6-7 seater SUVs suitable for long outstation trips, executive transit, and family vacations.",
      imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf",
      baseHourlyRate: "400.00",
      baseKmsRate: "20.00",
      extraHrRate: "250.00",
      extraKmRate: "20.00",
      outstationKmRate: "20.00",
    },
  });

  const luxuryCat = await prisma.vehicleCategory.create({
    data: {
      name: "Luxury Class",
      slug: "luxury-class",
      description: "High-end luxury sedans and SUVs for VIP delegation, C-suite executives, and weddings.",
      imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935",
      baseHourlyRate: "1200.00",
      baseKmsRate: "65.00",
      extraHrRate: "800.00",
      extraKmRate: "65.00",
      outstationKmRate: "65.00",
    },
  });

  const tempoCat = await prisma.vehicleCategory.create({
    data: {
      name: "Tempo Traveller",
      slug: "tempo-traveller",
      description: "12 to 26 seater pushback luxury minibuses for corporate team outings and group tours.",
      imageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e",
      baseHourlyRate: "600.00",
      baseKmsRate: "28.00",
      extraHrRate: "400.00",
      extraKmRate: "28.00",
      outstationKmRate: "28.00",
    },
  });

  const fleetModels = [
    { make: "Maruti Suzuki", model: "Dzire", reg: "MH12PQ1001", cat: sedanCat.id, cap: 4, fuel: "DIESEL", trans: "MANUAL", rate: "14.00", daily: "2800.00" },
    { make: "Hyundai", model: "Aura", reg: "MH12PQ1002", cat: sedanCat.id, cap: 4, fuel: "CNG", trans: "MANUAL", rate: "13.50", daily: "2700.00" },
    { make: "Honda", model: "City", reg: "MH12PQ1003", cat: sedanCat.id, cap: 4, fuel: "PETROL", trans: "AUTOMATIC", rate: "16.00", daily: "3200.00" },
    { make: "Toyota", model: "Innova Crysta", reg: "MH12PQ2001", cat: suvCat.id, cap: 7, fuel: "DIESEL", trans: "MANUAL", rate: "20.00", daily: "4200.00" },
    { make: "Toyota", model: "Innova Hycross", reg: "MH12PQ2002", cat: suvCat.id, cap: 7, fuel: "HYBRID", trans: "AUTOMATIC", rate: "24.00", daily: "4800.00" },
    { make: "Mahindra", model: "XUV700", reg: "MH12PQ2003", cat: suvCat.id, cap: 7, fuel: "DIESEL", trans: "AUTOMATIC", rate: "22.00", daily: "4500.00" },
    { make: "Mercedes-Benz", model: "E-Class", reg: "MH12PQ3001", cat: luxuryCat.id, cap: 4, fuel: "DIESEL", trans: "AUTOMATIC", rate: "70.00", daily: "15000.00" },
    { make: "BMW", model: "5 Series", reg: "MH12PQ3002", cat: luxuryCat.id, cap: 4, fuel: "PETROL", trans: "AUTOMATIC", rate: "65.00", daily: "14000.00" },
    { make: "Force", model: "Urbania 17 Seater", reg: "MH12PQ4001", cat: tempoCat.id, cap: 17, fuel: "DIESEL", trans: "MANUAL", rate: "30.00", daily: "6500.00" },
    { make: "Force", model: "Tempo Traveller 12D", reg: "MH12PQ4002", cat: tempoCat.id, cap: 12, fuel: "DIESEL", trans: "MANUAL", rate: "26.00", daily: "5500.00" }
  ];

  for (let i = 0; i < fleetModels.length; i++) {
    const f = fleetModels[i];
    await prisma.fleetVehicle.create({
      data: {
        make: f.make,
        model: f.model,
        registrationNumber: f.reg,
        categoryId: f.cat,
        capacity: f.cap,
        fuelType: f.fuel,
        transmission: f.trans,
        perKmRate: f.rate,
        baseDailyRate: f.daily,
        status: VehicleStatus.AVAILABLE,
        driverId: i < drivers.length ? drivers[i].id : null,
      },
    });
  }

  // 5. Package Categories & Tour Packages
  const heritageCat = await prisma.packageCategory.create({
    data: {
      name: "Heritage & Cultural",
      slug: "heritage-cultural",
      description: "Explore India's historic monuments, royal palaces, and ancient architecture.",
    },
  });

  const natureCat = await prisma.packageCategory.create({
    data: {
      name: "Hill Stations & Nature",
      slug: "hill-stations-nature",
      description: "Rejuvenate in serene mountain valleys, waterfalls, and tea plantations.",
    },
  });

  const tourPackagesData = [
    {
      title: "Golden Triangle Heritage Circuit (5 Days)",
      slug: "golden-triangle-heritage-circuit-5-days",
      destination: "Delhi - Agra - Jaipur",
      categoryId: heritageCat.id,
      durationDays: 5,
      durationNights: 4,
      basePrice: "14999.00",
      offerPrice: "12499.00",
      isFeatured: true,
      status: "PUBLISHED",
      description: "Experience the majestic charm of North India covering Taj Mahal, Amber Fort, and Red Fort with private chauffeur driven AC cabs.",
      itinerary: [
        { day: 1, title: "Arrival in Delhi", description: "Pickup from airport/station, check-in at hotel and visit Qutub Minar & India Gate." },
        { day: 2, title: "Delhi Sightseeing & Drive to Agra", description: "Visit Red Fort, Humayun Tomb and drive to Agra via Yamuna Expressway." },
        { day: 3, title: "Agra Taj Mahal & Drive to Jaipur", description: "Sunrise visit to Taj Mahal, Agra Fort and evening drive to Pink City Jaipur." },
        { day: 4, title: "Jaipur Forts & Palaces", description: "Explore Amber Fort with elephant ride, Hawa Mahal, City Palace and Jantar Mantar." },
        { day: 5, title: "Jaipur Shopping & Departure", description: "Explore Johari Bazaar for handicrafts and transfer back to Delhi airport." }
      ],
      inclusions: ["Chauffeur driven AC Innova", "3-Star Hotel Accommodation", "Daily Breakfast", "Toll, Parking & Fuel Charges"],
      exclusions: ["Monument Entry Fees", "Personal Meals & Drinks", "Flight/Train Tickets"],
      images: ["https://images.unsplash.com/photo-1548013146-72479768bada", "https://images.unsplash.com/photo-1524492412937-b28074a5d7da"],
      seoTitle: "Golden Triangle 5 Days Tour Package | Temp Travel",
      seoDescription: "Book 5-day Golden Triangle Delhi Agra Jaipur luxury car tour package with private driver.",
    },
    {
      title: "Mahabaleshwar & Panchgani Hill Escape (3 Days)",
      slug: "mahabaleshwar-panchgani-hill-escape-3-days",
      destination: "Mahabaleshwar - Panchgani - Wai",
      categoryId: natureCat.id,
      durationDays: 3,
      durationNights: 2,
      basePrice: "8999.00",
      offerPrice: "7499.00",
      isFeatured: true,
      status: "PUBLISHED",
      description: "Refresh yourself amidst strawberry farms, Arthur's seat viewpoint, and Venna Lake in a private AC SUV.",
      itinerary: [
        { day: 1, title: "Pune/Mumbai Pickup to Panchgani", description: "Scenic hill climb to Panchgani, visit Table Land and Parsi Point." },
        { day: 2, title: "Mahabaleshwar Sightseeing", description: "Visit Old Mahabaleshwar temples, Elphinstone point and Venna Lake boat ride." },
        { day: 3, title: "Mapro Garden & Departure", description: "Enjoy fresh strawberry cream at Mapro Garden and comfortable return ride." }
      ],
      inclusions: ["Private AC SUV Sedan", "Strawberry Farm Visit", "2 Nights Hotel Stay", "Breakfast & Tolls"],
      exclusions: ["Boating Tickets", "Lunch & Dinner"],
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb", "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05"],
      seoTitle: "Mahabaleshwar 3 Days Tour Package | Temp Travel Car Rentals",
      seoDescription: "Book Mahabaleshwar Panchgani weekend car rental tour package from Mumbai or Pune.",
    }
  ];

  for (const t of tourPackagesData) {
    await prisma.tourPackage.create({ data: t as any });
  }

  // 6. Blog Categories & Blog Posts
  const travelTipsCat = await prisma.blogCategory.create({
    data: {
      name: "Travel Guides & Tips",
      slug: "travel-guides-tips",
      description: "Expert advice on road trips, route navigation, packing lists, and car rentals.",
    },
  });

  const b2bCat = await prisma.blogCategory.create({
    data: {
      name: "Corporate Commute B2B",
      slug: "corporate-commute-b2b",
      description: "Insights on employee transport automation, EV fleet integration, and corporate transit compliance.",
    },
  });

  await prisma.blogPost.create({
    data: {
      title: "Top 10 Scenic Road Trips from Pune in Car Rentals",
      slug: "top-10-scenic-road-trips-from-pune-car-rentals",
      summary: "Discover breath-taking weekend getaway road trips from Pune to Mahabaleshwar, Lonavala, and Konkan beaches with private cab rentals.",
      content: "<h2>1. Pune to Mahabaleshwar via NH48</h2><p>Experience lush greenery, strawberry farms, and mountain air on this smooth 120km highway drive.</p><h2>2. Pune to Malshej Ghat</h2><p>Witness cascading waterfalls, misty mountain passes, and flamingo bird sightings during monsoon and winter seasons.</p>",
      featuredImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      published: true,
      publishedAt: new Date(),
      categoryId: travelTipsCat.id,
      tags: ["pune", "road-trips", "car-rental", "mahabaleshwar"],
      authorId: superAdmin.id,
      seoTitle: "Top 10 Road Trips from Pune | Temp Travel Guides",
      seoDescription: "Explore 10 best weekend road trips from Pune with chauffeur driven AC cabs.",
    },
  });

  await prisma.blogPost.create({
    data: {
      title: "How Employee Roster Automation Reduces B2B Fleet Costs by 30%",
      slug: "how-employee-roster-automation-reduces-b2b-fleet-costs",
      summary: "Learn how enterprise corporate commute management platforms optimize employee shift routes and eliminate empty miles.",
      content: "<h2>Optimizing Route Density</h2><p>By grouping employees according to geofenced pick-up zones, fleet managers cut fuel overheads significantly.</p><h2>Real-Time GPS Tracking</h2><p>Enhance women employee safety with automated SOS panic buttons and live dispatch telemetry.</p>",
      featuredImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
      published: true,
      publishedAt: new Date(),
      categoryId: b2bCat.id,
      tags: ["b2b", "employee-transport", "corporate-cabs", "fleet-automation"],
      authorId: superAdmin.id,
      seoTitle: "B2B Employee Roster Fleet Automation | Temp Travel Corporate",
      seoDescription: "Reduce corporate transit expenditure with automated employee cab dispatching and route clustering.",
    },
  });

  // 7. Gallery Media Items
  const galleryItems = [
    { title: "Toyota Innova Crysta Premium SUV Fleet", imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341", mediaType: MediaType.IMAGE, category: "fleet", sortOrder: 1 },
    { title: "Golden Triangle Heritage Sightseeing Cab", imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada", mediaType: MediaType.IMAGE, category: "tours", sortOrder: 2 },
    { title: "Corporate Employee Transport Bus & Minibus", imageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e", mediaType: MediaType.IMAGE, category: "corporate", sortOrder: 3 },
    { title: "Executive Luxury Chauffeur Sedan", imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935", mediaType: MediaType.IMAGE, category: "fleet", sortOrder: 4 }
  ];

  for (const item of galleryItems) {
    await prisma.gallery.create({ data: item });
  }

  // 8. Testimonials
  const testimonialsData = [
    {
      authorName: "Rahul Mehta",
      authorRole: "Senior HR Lead",
      companyName: "TCS Hinjewadi",
      content: "Managing 400+ daily employee shift transit used to take hours. Temp Travel's automated roster system and punctual fleet simplified our entire corporate mobility.",
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      isFeatured: true,
      status: "APPROVED",
    },
    {
      authorName: "Priya Sharma",
      authorRole: "Family Traveler",
      companyName: "Mumbai",
      content: "We booked an Innova Crysta for a 5-day Konkan family tour. Clean vehicle, polite driver, and transparent per-km billing without hidden charges!",
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
      isFeatured: true,
      status: "APPROVED",
    }
  ];

  for (const item of testimonialsData) {
    await prisma.testimonial.create({ data: item });
  }

  // 9. Site Settings
  await prisma.siteSetting.create({
    data: {
      key: "general_config",
      value: {
        siteName: "Temp Travel Car Rentals Pvt Ltd",
        contactEmail: "support@temptravels.com",
        contactPhone: "+91 99999 99999",
        officeAddress: "Unit 402, Pinnacle Business Park, Hinjewadi Phase 1, Pune, Maharashtra 411057",
        supportHours: "24/7 Dispatch Control Room",
      },
      description: "General Site Configuration Settings",
    },
  });

  console.log("==========================================");
  console.log("Catalog Items Seeded Successfully!");
  console.log("Preserved EMPTY State for Real Live Testing: Corporate Leads = 0, Rental Leads = 0, Contact Leads = 0, Bookings = 0, Razorpay Payments = 0.");
}

seedCatalogOnly()
  .catch((e) => {
    console.error("Error seeding catalog:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
