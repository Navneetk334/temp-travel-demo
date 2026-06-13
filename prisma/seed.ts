import { PrismaClient, UserRole, AdminRole, VehicleStatus, BookingType, BookingStatus, OutstationType, PaymentStatus, MediaType, LeadStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Clear existing records
  await prisma.razorpayPayment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.gallery.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.blogPost.deleteMany({});
  await prisma.blogCategory.deleteMany({});
  await prisma.corporateLead.deleteMany({});
  await prisma.rentalLead.deleteMany({});
  await prisma.contactLead.deleteMany({});
  await prisma.fleetVehicle.deleteMany({});
  await prisma.vehicleCategory.deleteMany({});
  await prisma.tourPackage.deleteMany({});
  await prisma.packageCategory.deleteMany({});
  await prisma.siteSetting.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.admin.deleteMany({});

  console.log("Database cleared. Seeding tables...");

  // ==========================================
  // 1. Admins & Users (Drivers / Customers / SPOCs)
  // ==========================================
  const superAdmin = await prisma.admin.create({
    data: {
      name: "Navneet Kumar",
      email: "admin@temptravels.com",
      passwordHash: "$2a$12$tD9Y59DqD784lXUvJ9L9XeR82R2gBfE8L9l6UeQ9qXbV8T9yT9nCq", // admin123
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  const managerAdmin = await prisma.admin.create({
    data: {
      name: "Ramesh Sharma",
      email: "ramesh@temptravels.com",
      passwordHash: "$2a$12$tD9Y59DqD784lXUvJ9L9XeR82R2gBfE8L9l6UeQ9qXbV8T9yT9nCq",
      role: AdminRole.MANAGER,
      isActive: true,
    },
  });

  // Seed Drivers
  const drivers = [];
  const driverNames = ["Rajesh Yadav", "Suresh Kumar", "Amit Singh", "Vijay Pal", "Vikram Rathore", "Karan Sharma", "Arjun Dev", "Harpreet Singh"];
  for (let i = 0; i < driverNames.length; i++) {
    const name = driverNames[i];
    const email = `driver${i + 1}@temptravels.com`;
    const phone = `+91999999910${i}`;
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: "$2a$12$tD9Y59DqD784lXUvJ9L9XeR82R2gBfE8L9l6UeQ9qXbV8T9yT9nCq",
        role: UserRole.DRIVER,
        isActive: true,
      },
    });
    drivers.push(user);
  }

  // Seed Customers
  const customers = [];
  const customerNames = ["Ananya Sen", "Sunita Vyas", "Karan Johar", "Rohan Mehta", "Pooja Hegde"];
  for (let i = 0; i < customerNames.length; i++) {
    const name = customerNames[i];
    const email = `customer${i + 1}@gmail.com`;
    const phone = `+91987654321${i}`;
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: "$2a$12$tD9Y59DqD784lXUvJ9L9XeR82R2gBfE8L9l6UeQ9qXbV8T9yT9nCq",
        role: UserRole.CUSTOMER,
        isActive: true,
      },
    });
    customers.push(user);
  }

  console.log("Users and Admins seeded.");

  // ==========================================
  // 2. Vehicle Categories & Fleet Vehicles
  // ==========================================
  const categoriesData = [
    { name: "Hatchback", slug: "hatchback", desc: "Compact & fuel-efficient cabs for daily city commutes.", hr: 120, km: 12, exHr: 100, exKm: 10, outKm: 11 },
    { name: "Sedan", slug: "sedan", desc: "Comfortable sedans for business commutes & executive transfers.", hr: 150, km: 15, exHr: 120, exKm: 12, outKm: 13 },
    { name: "SUV", slug: "suv", desc: "Spacious SUVs for family road trips & corporate airport runs.", hr: 220, km: 20, exHr: 180, exKm: 15, outKm: 16 },
    { name: "Luxury", slug: "luxury", desc: "Premium vehicles for VIP transport & corporate executives.", hr: 500, km: 45, exHr: 400, exKm: 35, outKm: 40 },
    { name: "Tempo Traveller", slug: "tempo-traveller", desc: "High capacity passenger vehicles for group excursions.", hr: 400, km: 35, exHr: 300, exKm: 25, outKm: 28 },
  ];

  const categoryMap: Record<string, string> = {};
  for (const c of categoriesData) {
    const cat = await prisma.vehicleCategory.create({
      data: {
        name: c.name,
        slug: c.slug,
        description: c.desc,
        baseHourlyRate: c.hr,
        baseKmsRate: c.km,
        extraHrRate: c.exHr,
        extraKmRate: c.exKm,
        outstationKmRate: c.outKm,
        imageUrl: `/images/categories/${c.slug}.jpg`,
      },
    });
    categoryMap[c.slug] = cat.id;
  }

  // Seeding 23 Fleet Vehicles
  const fleetData = [
    // 5 Hatchbacks
    { model: "WagonR", make: "Maruti Suzuki", cat: "hatchback", cap: 4, reg: "DL 1CA 1101" },
    { model: "i10 Grand", make: "Hyundai", cat: "hatchback", cap: 4, reg: "DL 1CA 1102" },
    { model: "Tiago", make: "Tata Motors", cat: "hatchback", cap: 4, reg: "DL 1CA 1103" },
    { model: "Celerio", make: "Maruti Suzuki", cat: "hatchback", cap: 4, reg: "DL 1CA 1104" },
    { model: "Kwid", make: "Renault", cat: "hatchback", cap: 4, reg: "DL 1CA 1105" },
    // 5 Sedans
    { model: "Dzire", make: "Maruti Suzuki", cat: "sedan", cap: 4, reg: "DL 3CB 2201" },
    { model: "Etios", make: "Toyota", cat: "sedan", cap: 4, reg: "DL 3CB 2202" },
    { model: "Amaze", make: "Honda", cat: "sedan", cap: 4, reg: "DL 3CB 2203" },
    { model: "Aura", make: "Hyundai", cat: "sedan", cap: 4, reg: "DL 3CB 2204" },
    { model: "City", make: "Honda", cat: "sedan", cap: 4, reg: "DL 3CB 2205" },
    // 5 SUVs
    { model: "Innova Crysta", make: "Toyota", cat: "suv", cap: 7, reg: "HR 26CR 3301" },
    { model: "Ertiga", make: "Maruti Suzuki", cat: "suv", cap: 6, reg: "HR 26CR 3302" },
    { model: "XUV700", make: "Mahindra", cat: "suv", cap: 7, reg: "HR 26CR 3303" },
    { model: "Carens", make: "Kia", cat: "suv", cap: 6, reg: "HR 26CR 3304" },
    { model: "Fortuner", make: "Toyota", cat: "suv", cap: 7, reg: "HR 26CR 3305" },
    // 5 Luxury Cars
    { model: "E-Class", make: "Mercedes-Benz", cat: "luxury", cap: 4, reg: "DL 1C AA 8801" },
    { model: "5 Series", make: "BMW", cat: "luxury", cap: 4, reg: "DL 1C AA 8802" },
    { model: "A6", make: "Audi", cat: "luxury", cap: 4, reg: "DL 1C AA 8803" },
    { model: "Camry", make: "Toyota", cat: "luxury", cap: 4, reg: "DL 1C AA 8804" },
    { model: "XF", make: "Jaguar", cat: "luxury", cap: 4, reg: "DL 1C AA 8805" },
    // 3 Tempo Travellers
    { model: "Traveller 13S", make: "Force Motors", cat: "tempo-traveller", cap: 13, reg: "DL 1V 4401" },
    { model: "Traveller 17S", make: "Force Motors", cat: "tempo-traveller", cap: 17, reg: "DL 1V 4402" },
    { model: "Traveller 26S", make: "Force Motors", cat: "tempo-traveller", cap: 26, reg: "DL 1V 4403" },
  ];

  for (let i = 0; i < fleetData.length; i++) {
    const v = fleetData[i];
    await prisma.fleetVehicle.create({
      data: {
        model: v.model,
        make: v.make,
        registrationNumber: v.reg,
        categoryId: categoryMap[v.cat],
        capacity: v.cap,
        status: VehicleStatus.AVAILABLE,
        // Assign first few vehicles to drivers
        driverId: i < drivers.length ? drivers[i].id : null,
      },
    });
  }

  console.log("Fleet categories and 23 vehicles seeded.");

  // ==========================================
  // 3. Package Categories & 12 Tour Packages
  // ==========================================
  const domCat = await prisma.packageCategory.create({
    data: { name: "Domestic Tours", slug: "domestic", description: "Incredible India tour packages." },
  });
  const intCat = await prisma.packageCategory.create({
    data: { name: "International Tours", slug: "international", description: "Global holiday escapes." },
  });

  const tourPackagesData = [
    // Domestic Packages
    {
      title: "Coastal Goa Gateway Route",
      slug: "coastal-goa-gateway",
      description: "Experience premium beaches, historic Portuguese forts, and sunset backwater cruises.",
      durationDays: 5,
      durationNights: 4,
      basePrice: 24999.00,
      catId: domCat.id,
      inclusions: ["3-star Beach Resort Accommodation", "Daily Breakfast & Dinner", "North & South Goa Sightseeing Tour", "Airport pick and drop"],
      exclusions: ["Flight tickets", "Water sports charges", "Lunch and personal expenses"],
      hotels: "Resort Rio / Whispering Palms Beach Resort",
      destinations: "North Goa, South Goa, Panaji",
      itinerary: [
        { day: 1, title: "Arrive in Goa", description: "Meet our representative at the airport and transfer to hotel. Rest of the day at leisure." },
        { day: 2, title: "North Goa Beaches Tour", description: "Visit Calangute, Baga, and Anjuna beaches. Enjoy water sports activities." },
        { day: 3, title: "South Goa Heritage Tour", description: "Visit Basilica of Bom Jesus, Mangueshi Temple, and Miramar Beach." },
        { day: 4, title: "Mandovi River Cruise", description: "Enjoy a beautiful evening ferry cruise with traditional Goan dances." },
        { day: 5, title: "Departure", description: "Check out from hotel and transfer back to the airport for your onward journey." },
      ],
    },
    {
      title: "Snowy Manali Adventure Tour",
      slug: "snowy-manali-adventure",
      description: "Explore the scenic snow-capped valleys of Himachal, Solang Valley, and Rohtang Pass.",
      durationDays: 6,
      durationNights: 5,
      basePrice: 16500.00,
      catId: domCat.id,
      inclusions: ["Deluxe Hotel Stay", "Volvo Bus Transfers from Delhi NCR", "Private Cab for Local Sightseeing", "Solang Valley Excursion"],
      exclusions: ["Rohtang Pass permission charges", "Adventure sports entry fees"],
      hotels: "Solang Valley Resort / Snow Valley Resorts",
      destinations: "Manali, Solang Valley, Kullu",
      itinerary: [
        { day: 1, title: "Delhi to Manali Overnighter", description: "Board luxury Volvo coach from Majnu ka Tilla, Delhi." },
        { day: 2, title: "Manali Arrival & Local Visit", description: "Check-in to resort, visit Hadimba Temple and Mall Road." },
        { day: 3, title: "Solang Valley Snow Point", description: "Enjoy paragliding, zorbing, and ropeways in Solang Valley." },
        { day: 4, title: "Kullu & Kasol Day Excursion", description: "Rafting in Beas River, visit Manikaran hot water springs." },
        { day: 5, title: "Shopping & Delhi Departure", description: "Free day for shopping in local market. Board evening bus to Delhi." },
        { day: 6, title: "Arrive in Delhi", description: "Arrive back in Delhi NCR in the morning." },
      ],
    },
    {
      title: "Royal Rajasthan Palace Route",
      slug: "royal-rajasthan-palace",
      description: "Relive history through the majestic palaces, forts, and sand dunes of Jaipur, Jodhpur, and Udaipur.",
      durationDays: 7,
      durationNights: 6,
      basePrice: 29990.00,
      catId: domCat.id,
      inclusions: ["Heritage Hotel Accommodations", "Camel Safari in Thar Desert Jaisalmer", "Daily Traditional Breakfast", "Chauffeur Driven Sedan Tour"],
      exclusions: ["Monument entry fees", "Guide charges"],
      hotels: "Jaipur Palace / Desert Palace Jaisalmer / Udaipur Lake Resort",
      destinations: "Jaipur, Jodhpur, Jaisalmer, Udaipur",
      itinerary: [
        { day: 1, title: "Jaipur Arrival & Heritage Walk", description: "Check-in and visit Hawa Mahal and Johari Bazaar." },
        { day: 2, title: "Amber Fort & City Palace", description: "Explore Amber Fort with elephant ride, Albert Hall Museum." },
        { day: 3, title: "Jaipur to Jodhpur", description: "Drive to Jodhpur, visit Mehrangarh Fort and Jaswant Thada." },
        { day: 4, title: "Desert Jaisalmer Camp", description: "Drive to Sam Sand Dunes. Enjoy sunset camel safari and folk dance." },
        { day: 5, title: "Jaisalmer Fort Sightseeing", description: "Explore the golden living fort and ancient Patwon ki Haveli." },
        { day: 6, title: "Udaipur Lake Excursion", description: "Drive to Udaipur. Boat ride in Lake Pichola at sunset." },
        { day: 7, title: "Udaipur Airport Drop", description: "Check out and transfer to Udaipur airport." },
      ],
    },
    {
      title: "Scenic Kerala Houseboat Escape",
      slug: "scenic-kerala-houseboat",
      description: "Soak in the serene backwaters, tea gardens, and wildlife of Munnar, Thekkady, and Alleppey.",
      durationDays: 6,
      durationNights: 5,
      basePrice: 19800.00,
      catId: domCat.id,
      inclusions: ["Premium Houseboat stay with all meals", "Munnar Tea Garden tours", "Spice plantation walks in Thekkady", "Private cab transfers"],
      exclusions: ["Kathakali show entry fees", "Boat safari charges"],
      hotels: "Munnar Valley Resort / Lakes & Lagoons Houseboat",
      destinations: "Mochi, Munnar, Thekkady, Alleppey",
      itinerary: [
        { day: 1, title: "Cochin to Munnar Drive", description: "Pickup and drive past beautiful Valara and Cheeyappara waterfalls." },
        { day: 2, title: "Munnar Tea Plantation Tour", description: "Visit Mattupetty Dam, Echo Point, and Eravikulam National Park." },
        { day: 3, title: "Thekkady Spice Plantations", description: "Drive to Thekkady. Spice garden tour, elephant rides." },
        { day: 4, title: "Houseboat check-in Alleppey", description: "Board traditional Kettuvallam houseboat. Cruise through backwaters." },
        { day: 5, title: "Cochin Sightseeing", description: "Drive back to Cochin, visit Chinese Fishing Nets and Fort Kochi." },
        { day: 6, title: "Cochin Airport Drop", description: "Departure transfer to Cochin International Airport." },
      ],
    },
    {
      title: "Heavenly Kashmir Valley Retreat",
      slug: "heavenly-kashmir-retreat",
      description: "Experience paradise on earth in Srinagar, Gulmarg, and Pahalgam.",
      durationDays: 6,
      durationNights: 5,
      basePrice: 26400.00,
      catId: domCat.id,
      inclusions: ["Luxury Houseboat Stay in Dal Lake", "Shikara Ride", "Gulmarg Gondola Ride Phase 1 Tickets", "Private Chauffeur Sedan"],
      exclusions: ["Pony rides in Pahalgam", "Aru Valley local cabs"],
      hotels: "Kashmir Houseboats / Pine & Peak Pahalgam",
      destinations: "Srinagar, Gulmarg, Pahalgam",
      itinerary: [
        { day: 1, title: "Srinagar Arrival", description: "Transfer to premium Houseboat on Dal Lake, sunset Shikara Ride." },
        { day: 2, title: "Mughal Gardens Tour", description: "Visit Shalimar, Nishat, and Chashme Shahi gardens." },
        { day: 3, title: "Gulmarg Day Excursion", description: "Drive to Gulmarg, Gondola cable car ride over pine woods." },
        { day: 4, title: "Srinagar to Pahalgam", description: "Drive to Pahalgam. Enroute visit saffron fields and Avantipura ruins." },
        { day: 5, title: "Pahalgam Valley Explorations", description: "Visit Betaab Valley, Lidder River walks, and local market." },
        { day: 6, title: "Srinagar Airport Departure", description: "Return transfer to Srinagar airport." },
      ],
    },
    {
      title: "Shimla Hills Heritage Getaway",
      slug: "shimla-hills-heritage",
      description: "Charming colonial architecture, pine forests, and toy train experiences in Shimla & Kufri.",
      durationDays: 4,
      durationNights: 3,
      basePrice: 12900.00,
      catId: domCat.id,
      inclusions: ["Hotel stay with breakfast", "Mall Road heritage walk", "Kufri adventure park transfers", "Delhi NCR pickup and drop"],
      exclusions: ["Toy train tickets", "Personal expenses"],
      hotels: "Hotel Radisson Shimla / East Bourne Resort",
      destinations: "Shimla, Kufri, Chail",
      itinerary: [
        { day: 1, title: "Delhi to Shimla Drive", description: "Scenic drive from Delhi to Shimla, check-in to resort." },
        { day: 2, title: "Kufri Snow Point Excursion", description: "Explore Kufri, enjoy horse riding, visit Himalayan Zoo." },
        { day: 3, title: "Shimla Local & Mall Road", description: "Visit Viceregal Lodge, Christ Church, Ridge, and Jakhoo Temple." },
        { day: 4, title: "Shimla to Delhi Return", description: "Drive back to Delhi NCR and drop off at your residence." },
      ],
    },
    {
      title: "Scenic Andaman Island Getaway",
      slug: "scenic-andaman-island",
      description: "White sand beaches, pristine coral reefs, and historical heritage in Port Blair and Havelock.",
      durationDays: 6,
      durationNights: 5,
      basePrice: 32000.00,
      catId: domCat.id,
      inclusions: ["Beachside resort stay", "Cruise ferry transfers (Port Blair-Havelock)", "Radhanagar Beach visit", "Cellular Jail Sound & Light Show"],
      exclusions: ["Scuba diving charges", "Lunch and dinner"],
      hotels: "Symphony Palms Havelock / Peerless Resort Port Blair",
      destinations: "Port Blair, Havelock Island, Neil Island",
      itinerary: [
        { day: 1, title: "Arrive Port Blair", description: "Meet at airport, visit Cellular Jail and enjoy evening Light Show." },
        { day: 2, title: "Port Blair to Havelock Ferry", description: "Take premium cruise ferry to Havelock Island. Relax on beach." },
        { day: 3, title: "Radhanagar Beach Sunset", description: "Visit Asia's best beach, Radhanagar, for crystal clear swimming." },
        { day: 4, title: "Elephant Beach Snorkeling", description: "Speed boat to Elephant beach for coral reef snorkeling." },
        { day: 5, title: "Havelock to Port Blair", description: "Return ferry back to Port Blair, shopping at Sagarika Emporium." },
        { day: 6, title: "Port Blair Departure", description: "Checkout and transfer to Port Blair airport." },
      ],
    },

    // International Packages
    {
      title: "Dubai Skyline & Desert Luxury",
      slug: "dubai-skyline-desert",
      description: "Witness modern architecture marvels, Burj Khalifa, global shopping, and sand dune safaris.",
      durationDays: 5,
      durationNights: 4,
      basePrice: 48999.00,
      catId: intCat.id,
      inclusions: ["Burj Khalifa 124th Floor Entry Ticket", "Desert Safari with BBQ Dinner & Belly Dance", "Dhow Cruise Marina Dinner", "UAE Tourist Visa and Insurance"],
      exclusions: ["Flights", "Tourism Dirham Tax (approx. $5/night)"],
      hotels: "Hilton Garden Inn / Rove Downtown",
      destinations: "Dubai, Sharjah",
      itinerary: [
        { day: 1, title: "Dubai Arrival & Marina Cruise", description: "Arrive at Dubai airport, transfer to hotel. Evening Marina Dhow Cruise." },
        { day: 2, title: "Dubai City Tour & Burj Khalifa", description: "Photo stops at Atlantis Palms, Jumeirah Beach. Visit Burj Khalifa observatory." },
        { day: 3, title: "Desert Safari Extravaganza", description: "Morning free. Afternoon 4x4 dune bashing, BBQ dinner at desert camp." },
        { day: 4, title: "Abu Dhabi Day Excursion", description: "Visit grand Sheikh Zayed Mosque and Yas Island Ferrari World." },
        { day: 5, title: "Departure", description: "Airport transfer for departure flight." },
      ],
    },
    {
      title: "Tropical Thailand Beaches Tour",
      slug: "tropical-thailand-beaches",
      description: "Relax on the sandy shores of Phuket, Phi Phi Islands, and explore vibrant Bangkok.",
      durationDays: 6,
      durationNights: 5,
      basePrice: 34500.00,
      catId: intCat.id,
      inclusions: ["Phi Phi Island Tour by Speedboat", "Bangkok City Temple Tour", "Phuket-Bangkok Flight Ticket", "Daily Breakfast Buffet"],
      exclusions: ["National Park entry fees (approx. $12)", "Thailand Visa on Arrival charges"],
      hotels: "Novotel Phuket Resort / Century Park Bangkok",
      destinations: "Phuket, Bangkok, Phi Phi Islands",
      itinerary: [
        { day: 1, title: "Phuket Arrival", description: "Transfer to Phuket resort, evening Patong Beach walk." },
        { day: 2, title: "Phi Phi Island Day Trip", description: "Boat ride to Maya Bay, snorkeling, buffet lunch on island." },
        { day: 3, title: "Phuket City Explorer", description: "Visit Big Buddha, Wat Chalong, and Karon viewpoint." },
        { day: 4, title: "Phuket to Bangkok Flight", description: "Fly to Bangkok, check-in, free evening at local markets." },
        { day: 5, title: "Bangkok Temples & Shopping", description: "Visit Wat Pho (Reclining Buddha), shopping at MBK Center." },
        { day: 6, title: "Bangkok Airport Drop", description: "Airport transfer for departure flight." },
      ],
    },
    {
      title: "Singapore Garden City Highlights",
      slug: "singapore-garden-city",
      description: "Discover futuristic landscapes, Sentosa Island, Universal Studios, and Gardens by the Bay.",
      durationDays: 5,
      durationNights: 4,
      basePrice: 56000.00,
      catId: intCat.id,
      inclusions: ["Universal Studios Singapore Entry", "Night Safari Adventure tickets", "Gardens by the Bay Double Conservatories", "Sentosa Cable Car & Wing of Time show"],
      exclusions: ["Flights", "Visa processing fees"],
      hotels: "Hotel Boss / Orchard Rendezvous Hotel",
      destinations: "Singapore, Sentosa",
      itinerary: [
        { day: 1, title: "Singapore Arrival & Night Safari", description: "Arrive at Changi, check-in. Evening Night Safari tram ride." },
        { day: 2, title: "City Tour & Gardens by the Bay", description: "Merlion photo stop, visit Flower Dome and Cloud Forest." },
        { day: 3, title: "Universal Studios Day Trip", description: "Full day of thrilling rides and movie-themed attractions." },
        { day: 4, title: "Sentosa Island Play Day", description: "Cable car, SEA Aquarium, evening Wings of Time show." },
        { day: 5, title: "Jewel Changi & Departure", description: "Visit Jewel vortex waterfall, airport transfer." },
      ],
    },
    {
      title: "Serene Bali Paradise Escape",
      slug: "serene-bali-paradise",
      description: "Explore volcanic landscapes, pristine beaches, Hindu temples, and swing valleys in Ubud.",
      durationDays: 6,
      durationNights: 5,
      basePrice: 38900.00,
      catId: intCat.id,
      inclusions: ["Ubud Kintamani Volcano Tour with buffet lunch", "Bali Jungle Swing experience", "Tanah Lot Temple Sunset Tour", "Private SUV tour transfers"],
      exclusions: ["Flights", "Tipping and drinks"],
      hotels: "Ubud Valley Resort / Grand Hyatt Nusa Dua",
      destinations: "Ubud, Kuta, Nusa Dua, Tanah Lot",
      itinerary: [
        { day: 1, title: "Bali Arrival & Uluwatu Temple", description: "Pickup, check-in, visit cliffside Uluwatu Temple." },
        { day: 2, title: "Ubud Valley & Jungle Swing", description: "Try the iconic giant swing, visit Tegalalang Rice Terraces." },
        { day: 3, title: "Kintamani Volcano & Batur Lake", description: "Drive up to Mt Batur view, buffet lunch facing volcano." },
        { day: 4, title: "Nusa Penida Speedboat Trip", description: "Visit Kelingking Beach (T-Rex) and Angel's Billabong." },
        { day: 5, title: "Tanah Lot Sunset Tour", description: "Visit the offshore temple of Tanah Lot for sunset photos." },
        { day: 6, title: "Denpasar Airport Departure", description: "Transfer to airport for return flight." },
      ],
    },
    {
      title: "Maldives Private Lagoon Escape",
      slug: "maldives-lagoon-escape",
      description: "Live in paradise inside a private overwater villa overlooking white sand reefs.",
      durationDays: 5,
      durationNights: 4,
      basePrice: 89000.00,
      catId: intCat.id,
      inclusions: ["4 Nights in Premium Overwater Villa", "All Inclusive Meals (Breakfast, Lunch, Dinner & Drinks)", "Speedboat transfers from Male Airport", "Complimentary Snorkeling equipment"],
      exclusions: ["Flights", "Optional private dinners"],
      hotels: "Adaaran Club Rannalhi / Centara Ras Fushi Resort",
      destinations: "Male, Kaafu Atoll",
      itinerary: [
        { day: 1, title: "Male Airport to Resort Speedboat", description: "Arrive at Male, take speedboat to resort island. Welcome drinks." },
        { day: 2, title: "Water Sports & Snorkeling", description: "Explore the house reef. Snorkel alongside stingrays and sea turtles." },
        { day: 3, title: "Spa & Sunset Cruise", description: "Pamper yourself with Balinese Spa therapy. Evening Dhoni Sunset Cruise." },
        { day: 4, title: "Leisure Overwater Day", description: "Relax on the sundeck of your overwater villa and dive directly into lagoon." },
        { day: 5, title: "Male Airport Return Transfer", description: "Speedboat back to Male International Airport for departure." },
      ],
    },
  ];

  for (const pkg of tourPackagesData) {
    await prisma.tourPackage.create({
      data: {
        title: pkg.title,
        slug: pkg.slug,
        description: pkg.description,
        durationDays: pkg.durationDays,
        durationNights: pkg.durationNights,
        basePrice: pkg.basePrice,
        inclusions: pkg.inclusions,
        exclusions: pkg.exclusions,
        images: [`/images/tours/${pkg.slug}-1.jpg`, `/images/tours/${pkg.slug}-2.jpg`],
        status: "ACTIVE",
        categoryId: pkg.catId,
        seoTitle: `${pkg.title} | Temp Travel`,
        seoDescription: `Book the ${pkg.title} online. Includes stays at ${pkg.hotels}, itineraries, inclusions and guides.`,
        seoKeywords: `${pkg.destinations}, tour packages, travel agency`,
        itinerary: pkg.itinerary as any,
      },
    });
  }

  console.log("12 Tour Packages seeded.");

  // ==========================================
  // 4. Blog Categories & 20 Blog Posts
  // ==========================================
  const blogCats = [
    { name: "Corporate Mobility", slug: "corporate-mobility", description: "Solutions for employee transportation and business logistics." },
    { name: "Travel Guides", slug: "travel-guides", description: "Detailed itineraries and sightseeing tips for holiday makers." },
    { name: "Safety & Compliance", slug: "safety-compliance", description: "Chauffeur vetting, safety checklists, and transit regulations." },
    { name: "Road Travel Tips", slug: "travel-tips", description: "General tips for planning car rentals and outstation road trips." },
  ];

  const blogCatMap: Record<string, string> = {};
  for (const bc of blogCats) {
    const cat = await prisma.blogCategory.create({
      data: bc,
    });
    blogCatMap[bc.slug] = cat.id;
  }

  const blogPostsData = [
    // Corporate Transportation & Employee Commute (6 posts)
    {
      title: "Optimizing Corporate Cab Roster Schedules for IT Parks",
      slug: "optimizing-corporate-roster-schedules",
      summary: "How HR managers can use routing tools to reduce B2B transport expenses and improve employee punctuality.",
      content: "Employee commutes are a critical operational line for corporate enterprises. Efficient roster scheduling requires grouping pickup coordinates, optimizing vehicle seat fills, and reducing dead-mileages. In Delhi, Noida, and Gurugram IT corridors, smart route optimization algorithms have cut transport costs by up to 25% while ensuring employees arrive on time. Contact Temp Travel to deploy automated route dispatch systems for your workplace.",
      cat: "corporate-mobility",
      tags: ["corporate", "roster-management", "delhi-ncr", "b2b-logistics"]
    },
    {
      title: "Safety Compliance Protocols in Employee Transportation Services",
      slug: "employee-transport-safety-compliance",
      summary: "Vetting chauffeurs, active GPS tracking, and SOS panic button compliance protocols.",
      content: "Security is non-negotiable in B2B employee transit. Standard operating procedures mandate background verification of drivers, active GPS trackers in all fleet cabs, and working SOS emergency buttons linked to a 24/7 command center. Additionally, late-night shifts require escort systems for female staff members to ensure safe drop-offs. At Temp Travel, we ensure 100% compliance with ISO standards across our fleet.",
      cat: "safety-compliance",
      tags: ["safety", "compliance", "gps-tracking", "drivers"]
    },
    {
      title: "The Shift Towards Green Mobility: Electric & CNG Fleets in Corporates",
      slug: "green-mobility-corporate-cabs",
      summary: "Reducing carbon footprints using CNG and electric cabs for daily B2B commutes in Delhi-NCR.",
      content: "Environmental sustainability is shifting corporate preferences toward clean energy. With Delhi-NCR enforcing strict winter emissions control, the demand for CNG sedans and electric employee shuttles has surged. Leading MNCs are integrating ESG metrics directly into their transport vendor contracts, preferring fleets that reduce daily carbon footprints.",
      cat: "corporate-mobility",
      tags: ["green-mobility", "cng-cabs", "corporate-esg", "delhi"]
    },
    {
      title: "Why Fixed-Route Shuttle Services Beat Multi-Point Cabs for Offices",
      slug: "office-shuttle-vs-individual-cabs",
      summary: "Analyzing the cost-benefit of office buses versus individual cabs for business logistics.",
      content: "For offices with high-volume staff shifts, individual point-to-point cabs can lead to massive overheads. Setting up dedicated point-to-point shuttle routes between nearest metro hubs and the office campus consolidates passenger commutes, reduces traffic congestion at entry bays, and cuts logistics budgets drastically.",
      cat: "corporate-mobility",
      tags: ["office-shuttle", "cabs", "commute-costs", "metro-pickup"]
    },
    {
      title: "How Automated Billing Simplifies Vendor Management for HR Teams",
      slug: "automated-billing-vendor-management",
      summary: "Eliminating manual invoice audits with digitized trip logs and route verification.",
      content: "Manual audit of paper trip sheets is a logistical nightmare for HR departments. Digital SPOC dashboards log pickup/drop timestamps, actual routes taken via GPS, and distance travelled. This produces consolidated monthly invoices with 100% audit accuracy, eliminating billing disputes.",
      cat: "corporate-mobility",
      tags: ["automated-billing", "hr-tools", "vendor-audit", "logistics"]
    },
    {
      title: "Guide to Selecting the Right Corporate Cab Partner in Delhi NCR",
      slug: "selecting-corporate-cab-partner-delhi",
      summary: "Critical factors: fleet capacity, compliance audits, driver training, and SLA structures.",
      content: "Selecting a transport partner requires reviewing their commercial permits, insurance coverage, active fleet size, and driver training certifications. A reliable partner like Temp Travel Car Rentals guarantees 99% SLA uptime and transparent dispute resolutions.",
      cat: "corporate-mobility",
      tags: ["corporate-cab", "vendor-selection", "delhi-ncr", "cabs"]
    },

    // Airport Transfers (4 posts)
    {
      title: "How to Avoid Delayed Pickups at IGI Airport Terminal 3",
      slug: "avoid-airport-pickup-delays",
      summary: "Navigating terminal parking, commercial arrival lanes, and chauffeur paging hacks.",
      content: "IGI Airport Terminal 3 is one of the busiest terminals globally. Booking an airport transfer with dedicated chauffeur paging saves hassle. Chauffeurs wait at the arrivals gate with a nameplate, avoiding pickup lane confusion. Learn more about booking executive transfers with Temp Travel.",
      cat: "travel-tips",
      tags: ["airport-transfer", "igi-airport", "delhi", "cabs"]
    },
    {
      title: "Streamlining Airport Transfers for VIP Delegates & Corporate Clients",
      slug: "vip-airport-transfers-best-practices",
      summary: "Meeting foreign clients with premium luxury sedans and professional chauffeurs.",
      content: "When meeting international delegates, first impressions matter. Providing a luxury sedan (like BMW 5 Series or Audi A6) with a bilingual driver ensures comfort. Pre-booking flight tracking ensures chauffeurs adjust pickup times according to flight status automatically.",
      cat: "corporate-mobility",
      tags: ["vip-transfer", "luxury-cars", "delhi-airport", "hospitality"]
    },
    {
      title: "Pre-Booking vs Spot Cabs at Delhi Airport: A Complete Analysis",
      slug: "prebooking-vs-spot-airport-cabs",
      summary: "Comparing pricing transparency, vehicle condition, and wait times at airport terminals.",
      content: "Spot cabs often charge surge prices and have long queues. Pre-booking with Temp Travel guarantees fixed pricing, clean sanitized cabs, and zero wait times. This guide compares airport transport options.",
      cat: "travel-tips",
      tags: ["airport-cab", "taxi-booking", "delhi-airport", "fixed-fare"]
    },
    {
      title: "A Business Traveler's Guide to Quick Airport Commutes in Bangalore",
      slug: "bangalore-airport-commute-guide",
      summary: "Navigating the distance between KIA Terminal 2 and major business hubs like Whitefield.",
      content: "Kempegowda International Airport is located far from the city center. Travelling to Whitefield or Electronic City requires route planning. Booking an airport taxi ensure drivers bypass traffic using tollways.",
      cat: "travel-tips",
      tags: ["bangalore", "kia-airport", "whitefield", "airport-transit"]
    },

    // Travel Guides & Packages (6 posts)
    {
      title: "The Ultimate 5-Day Goa Road Trip Itinerary",
      slug: "goa-road-trip-itinerary",
      summary: "Discover offbeat heritage sites, beach shacks, and spice farms with your private SUV.",
      content: "Goa is best explored by road. From heritage tours in Old Goa Basilica to sunset views at Fort Aguada, having a dedicated private cab makes sightseeing comfortable. Our 5-day package covers both North and South Goa in detail.",
      cat: "travel-guides",
      tags: ["goa-guide", "road-trip", "beach-holiday", "tours"]
    },
    {
      title: "Planning a Safe Family Trip to Manali & Solang Valley by Road",
      slug: "manali-solang-road-trip-guide",
      summary: "Essential advice for mountain driving, Solang adventure bookings, and winter routes.",
      content: "Mountain driving requires expertise. Booking a private Tempo Traveller or 4x4 SUV with an experienced hill driver is recommended for Solang Valley and Rohtang Pass. Our drivers are trained for snowy weather and high altitude roads.",
      cat: "travel-guides",
      tags: ["manali-guide", "mountain-road", "family-tours", "himachal"]
    },
    {
      title: "Delhi Golden Triangle Route: Jaipur, Agra, and Delhi Heritage Tour",
      slug: "golden-triangle-heritage-guide",
      summary: "A complete guide to the cultural gems along the Yamuna Expressway and NH48.",
      content: "The Golden Triangle connects Delhi, Agra, and Jaipur. Using a private car rental allows you to stop at monument checkpoints like Fatehpur Sikri and Chand Baori at your own pace.",
      cat: "travel-guides",
      tags: ["golden-triangle", "jaipur-agra", "heritage-india", "road-trip"]
    },
    {
      title: "Uncovering the Best Backwater Routes in Kerala",
      slug: "kerala-backwater-houseboat-routes",
      summary: "Choosing houseboat packages in Alleppey and Kumarakom for the ultimate vacation.",
      content: "Kerala's backwaters offer serene views. Choosing the right houseboat route in Alleppey makes all the difference. Our packages integrate premium houseboat stays with private cab transfers to Munnar's tea hills.",
      cat: "travel-guides",
      tags: ["kerala-backwaters", "houseboat", "munnar", "kerala-tourism"]
    },
    {
      title: "Top 10 Weekend Hill Station Road Trips from Delhi",
      slug: "weekend-hill-road-trips-delhi",
      summary: "Beat the Delhi summer heat: Mussoorie, Shimla, Lansdowne, and Nainital guides.",
      content: "For a weekend escape, hills near Delhi like Lansdowne and Nainital are ideal. Renting an outstation cab ensures you avoid driving fatigue and enjoy the winding scenic mountain roads.",
      cat: "travel-guides",
      tags: ["weekend-trip", "delhi-getaway", "hill-station", "cabs"]
    },
    {
      title: "Andaman Islands: Travel Checklist for First-Time Visitors",
      slug: "andaman-islands-first-time-checklist",
      summary: "Ferry bookings, cellular jail entry timings, and Havelock Island beach guides.",
      content: "Andaman requires planning, especially for cruise ferries between Port Blair and Havelock. Having a local tour manager coordinates hotel pickups, water sports, and historical tours smoothly.",
      cat: "travel-guides",
      tags: ["andaman-checklist", "havelock", "beach-tours", "island-vacation"]
    },

    // Car Rentals & Tips (4 posts)
    {
      title: "Deciding Between Outstation Cabs vs Self-Drive for Long Trips",
      slug: "outstation-cabs-vs-self-drive",
      summary: "Comparing driving fatigue, highway toll management, insurance coverage, and overall costs.",
      content: "Self-drive cars might seem flexible but come with hidden costs and driving fatigue. Booking an outstation cab with a professional chauffeur allows you to relax, work on your laptop, and travel safely.",
      cat: "travel-tips",
      tags: ["outstation-cab", "self-drive", "road-safety", "travel-budget"]
    },
    {
      title: "Road Safety Guidelines: Checklist Before Commencing a Highway Trip",
      slug: "highway-road-safety-checklist",
      summary: "Tyre pressure checks, brake maintenance, emergency triangles, and toll tags.",
      content: "Before hitting the highway, ensure your vehicle is in top condition. Our fleet at Temp Travel undergoes rigorous pre-trip checklists, including tyre treads, engine oils, and functional Fastags.",
      cat: "safety-compliance",
      tags: ["road-safety", "highway-driving", "car-maintenance", "checklists"]
    },
    {
      title: "How to Avoid Hidden Charges on Outstation Car Rentals",
      slug: "avoid-hidden-charges-car-rentals",
      summary: "Understanding state taxes, driver night allowances, toll tolls, and fuel calculations.",
      content: "Many travel operators quote low base fares but add hefty state permit taxes and driver charges later. Temp Travel believes in transparent billing. Our quotes include driver allowances, fuel, and clean terms.",
      cat: "travel-tips",
      tags: ["car-rental", "transparent-billing", "outstation-trip", "cabs"]
    },
    {
      title: "The Ultimate Guide to Renting a Tempo Traveller for Group Excursions",
      slug: "tempo-traveller-rental-guide-group",
      summary: "Comparing 13-seater luxury coaches and 26-seater buses for family outings and events.",
      content: "When travelling in large groups, booking multiple cars separates the family. A 13-seater or 26-seater Tempo Traveller consolidates the group, offering pushback seats, individual AC vents, and ample luggage space.",
      cat: "travel-tips",
      tags: ["tempo-traveller", "group-travel", "minibus-rental", "family-tours"]
    },
  ];

  for (const post of blogPostsData) {
    await prisma.blogPost.create({
      data: {
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        content: post.content,
        featuredImage: `/images/blog/${post.slug}.jpg`,
        published: true,
        publishedAt: new Date(),
        authorId: superAdmin.id,
        categoryId: blogCatMap[post.cat],
        tags: post.tags,
        seoTitle: `${post.title} | Temp Travel Blog`,
        seoDescription: post.summary.slice(0, 150),
        seoKeywords: post.tags.join(", "),
      },
    });
  }

  console.log("20 Blog posts seeded.");

  // ==========================================
  // 5. Testimonials (20 entries)
  // ==========================================
  const testimonialsData = [
    { name: "Rahul Mehta", role: "HR Lead", company: "TCS Noida", content: "Managing employee shifts for 500+ staff used to take hours. Temp Travel's routing software optimized everything. Punctual, safe, and cost-effective.", rating: 5, featured: true, service: "Corporate Transportation" },
    { name: "Preeti Sharma", role: "Manager", company: "Leisure Travel Group", content: "Booked a Manali package for my family. The Innova Crysta was clean, the driver was courteous, and the itinerary was perfect.", rating: 5, featured: true, service: "Tour Packages" },
    { name: "Vikram Malhotra", role: "Executive VP", company: "Morgan Stanley Mumbai", content: "Very reliable airport pick-up services in Delhi and Mumbai. Chauffeurs meet you at the arrivals terminal on time. Highly recommended.", rating: 5, featured: true, service: "Airport Transfers" },
    { name: "Sandeep Joshi", role: "SPOC Admin", company: "Capgemini Gurugram", content: "We transitioned to Temp Travel for our late-night employee transport. The real-time tracking dashboard and female escort compliance are outstanding.", rating: 5, featured: false, service: "Corporate Transportation" },
    { name: "Ananya Deshmukh", role: "Tourist", company: null, content: "The Goa tour was extremely well coordinated. Our driver knew all the scenic spots. Zero hassle with parking or hotel pickups.", rating: 5, featured: false, service: "Tour Packages" },
    { name: "Amitabh Verma", role: "Travel Coordinator", company: "Wipro Technologies", content: "Temp Travel has been our logistics partner for 3 years. Their compliance standards and billing transparency are commendable.", rating: 5, featured: false, service: "Corporate Transportation" },
    { name: "Siddharth Goel", role: "Director", company: "Goel Steels Delhi", content: "Rented a luxury BMW 5 Series for a VIP client. The car was spotless and the chauffeur was professional.", rating: 5, featured: false, service: "Car Rental" },
    { name: "Jaspreet Kaur", role: "HR Manager", company: "Genpact Noida", content: "Their billing dashboard makes vendor management simple. Clear logs, no discrepancies.", rating: 5, featured: false, service: "Corporate Transportation" },
    { name: "Nikhil Kamath", role: "Customer", company: null, content: "Rented a 17-seater Tempo Traveller for a family trip to Agra. Very comfortable ride for elderly family members.", rating: 4, featured: false, service: "Car Rental" },
    { name: "Meenakshi Sundaram", role: "Tourist", company: null, content: "Our Kerala backwater trip was magical. Stays and houseboat coordination were first-class.", rating: 5, featured: false, service: "Tour Packages" },
    { name: "Vivek Oberoi", role: "Admin Head", company: "HCL Tech Noida", content: "ISO compliance and regular vehicle audits make them a safe corporate transport vendor.", rating: 5, featured: false, service: "Corporate Transportation" },
    { name: "Priya Nair", role: "Customer", company: null, content: "Airport drop-offs are always punctual. Fastag and toll management are handled by the driver.", rating: 4, featured: false, service: "Airport Transfers" },
    { name: "Aditya Roy", role: "Business Executive", company: "Deloitte Gurugram", content: "The billing process is seamless. Excellent customer service response.", rating: 5, featured: false, service: "Car Rental" },
    { name: "Ritu Phogat", role: "Customer", company: null, content: "Scenic Rajasthan heritage tour was beautiful. Safe driver and very good guide suggestions.", rating: 5, featured: false, service: "Tour Packages" },
    { name: "Gaurav Sen", role: "Director", company: "Acme India", content: "Outstanding executive cab coordination during our corporate summit in Delhi.", rating: 5, featured: false, service: "Corporate Transportation" },
    { name: "Manisha Koirala", role: "Tourist", company: null, content: "Beautifully organized Bali package. Felt extremely safe as a solo woman traveler.", rating: 5, featured: false, service: "Tour Packages" },
    { name: "Rishabh Pant", role: "Customer", company: null, content: "Prompt responses from the customer service desk during midnight emergencies.", rating: 4, featured: false, service: "Car Rental" },
    { name: "Smriti Mandhana", role: "Tourist", company: null, content: "Loved the Maldives overwater villa booking. Best rates and smooth speedboat transfers.", rating: 5, featured: false, service: "Tour Packages" },
    { name: "Harish Iyer", role: "Admin Lead", company: "Infosys Bangalore", content: "Reliable airport transfers for our remote employees. Transparent pricing structures.", rating: 5, featured: false, service: "Airport Transfers" },
    { name: "Neha Dhupia", role: "Customer", company: null, content: "Rented a luxury coach for a destination wedding in Jaipur. Smooth ride and excellent coordinator.", rating: 5, featured: false, service: "Car Rental" },
  ];

  for (const t of testimonialsData) {
    await prisma.testimonial.create({
      data: {
        authorName: t.name,
        authorRole: t.role,
        companyName: t.company,
        content: t.content,
        rating: t.rating,
        isFeatured: t.featured,
        avatarUrl: `/images/testimonials/avatar-${t.name.toLowerCase().replace(" ", "-")}.jpg`,
        status: "APPROVED",
      },
    });
  }

  console.log("20 Testimonials seeded.");

  // ==========================================
  // 6. Corporate Clients (15 entries)
  // ==========================================
  const corporateClients = [
    { name: "TCS", ind: "IT Services", desc: "Providing employee commute rosters for Noida Sector 62 campus." },
    { name: "Capgemini", ind: "Consulting", desc: "Managing daily shuttle routes to Gurugram Cyber City office." },
    { name: "Morgan Stanley", ind: "Finance", desc: "Providing executive airport transfers in Mumbai and Delhi." },
    { name: "Wipro", ind: "IT Services", desc: "Corporate cab vendor for regional offices in Delhi NCR." },
    { name: "Genpact", ind: "BPO/KPO", desc: "24/7 night shift transportation partner for Gurgaon office." },
    { name: "HCL Tech", ind: "IT Services", desc: "Providing staff transport and dispatch operations." },
    { name: "Deloitte", ind: "Consulting", desc: "Executive car rental subscriber for visiting global delegates." },
    { name: "Infosys", ind: "IT Services", desc: "Airport shuttle provider for Bangalore tech corridor." },
    { name: "Google India", ind: "Technology", desc: "VIP delegate transportation provider during summits." },
    { name: "Amazon India", ind: "E-Commerce", desc: "Providing transport logistics for corporate staff." },
    { name: "EY India", ind: "Consulting", desc: "Executive outstation cab subscriber for regional project audits." },
    { name: "KPMG", ind: "Consulting", desc: "Providing point-to-point shuttle routes." },
    { name: "Tata Power", ind: "Energy", desc: "Corporate transport fleet provider for regional offices." },
    { name: "Airtel", ind: "Telecom", desc: "Executive mobility and corporate meeting shuttle partner." },
    { name: "Accenture", ind: "IT Services", desc: "High-volume employee pickup and drop transport provider." },
  ];

  for (const client of corporateClients) {
    await prisma.siteSetting.create({
      data: {
        key: `corp_client_${client.name.toLowerCase()}`,
        value: {
          name: client.name,
          industry: client.ind,
          description: client.desc,
          logoUrl: `/images/clients/logo-${client.name.toLowerCase()}.png`,
        },
        description: `Corporate client profile for ${client.name}`,
      },
    });
  }

  console.log("15 Corporate clients seeded as SiteSettings.");

  // ==========================================
  // 7. Gallery (90 entries)
  // ==========================================
  const mediaCategories = ["fleet", "corporate", "tours"];
  for (const cat of mediaCategories) {
    for (let i = 1; i <= 30; i++) {
      await prisma.gallery.create({
        data: {
          title: `${cat.charAt(0).toUpperCase() + cat.slice(1)} Gallery Item ${i}`,
          imageUrl: `/images/gallery/${cat}-${i}.jpg`,
          mediaType: MediaType.IMAGE,
          category: cat,
          sortOrder: i,
        },
      });
    }
  }

  console.log("90 Gallery records seeded.");

  // ==========================================
  // 8. Site Settings (Company Info, Home, FAQs)
  // ==========================================
  await prisma.siteSetting.create({
    data: {
      key: "company_info",
      value: {
        overview: "TEMP TRAVEL CAR RENTALS PVT LTD is a premier corporate transit and leisure travel management company based in India. We operate premium corporate commuter systems, airport transfers, and customized tours.",
        aboutUs: "Established in 2012, Temp Travel operates with a compliant fleet across major business metros. We prioritize passenger safety, transparent billing, and 24/7 support desks.",
        mission: "To deliver safe, compliant, and cost-effective transportation logistics and leisure travel experiences.",
        vision: "To become India's primary choice for corporate employee transportation and customized leisure holiday packages.",
        values: ["Safety First", "Integrity & Transparency", "Customer Obsession", "Operational Excellence"],
        whyUs: ["ISO 9001:2015 Compliance", "Defensive Driver Vetting", "Automated Roster Routing", "24/7 Command Center Support"],
        stats: { completedRides: "500K+", corporateContracts: "120+", hubs: "30+", rating: "4.9/5" },
        serviceAreas: ["Delhi NCR", "Mumbai Metro", "Pune City", "Bangalore Tech Hub", "Goa Coast", "Nashik Hub"],
      },
      description: "Core company profile, stats, values, and operational regions.",
    },
  });

  await prisma.siteSetting.create({
    data: {
      key: "homepage_content",
      value: {
        hero: {
          headline: "Redefining Corporate Mobility & Premium Tours",
          subheadline: "Providing luxury corporate commutes, local rentals, outstation trips, and customized travel packages across major metropolitan cities.",
          ctaBook: "Book Cabs Online",
          ctaContact: "Setup Corporate Account",
        },
        servicesDesc: {
          corporate: "High-volume employee roster commutes, GPS-monitored corporate shuttles, and automated billing logs.",
          rentals: "Chauffeur-driven local hourly rentals and outstation tour transfers with vetted drivers.",
          tours: "Customized holiday packages covering beach resorts, hill stations, and cultural heritages.",
        },
      },
      description: "Homepage hero, services descriptions, and call-to-action copy.",
    },
  });

  // Seed 30 FAQs
  const faqsList = [
    // Corporate Transport (10 FAQs)
    { q: "How do you verify driver backgrounds?", a: "We run background checks, driver license validation, and police records checks for all chauffeurs." },
    { q: "Do vehicles have active GPS tracking?", a: "Yes, every vehicle is fitted with live GPS tracking modules linked to our command dashboard." },
    { q: "How are night shift drops for female staff secured?", a: "We enforce strict security checklists including mandatory male escorts for late night pickups and drops." },
    { q: "Can we integrate automated roster routing?", a: "Yes, our B2B SPOC portal parses bulk shift Excel sheets and compiles optimized route logs automatically." },
    { q: "What compliance standards do you adhere to?", a: "We are ISO 9001:2015 compliant and hold valid commercial permits, state tax receipts, and premium insurance covers." },
    { q: "How does the automated billing system work?", a: "Chauffeurs complete digital trip logs verified by actual GPS trail data, producing audited monthly invoices." },
    { q: "Can we request monthly cab subscriptions?", a: "Yes, we offer monthly rental subscriptions for corporate executives and office commutes." },
    { q: "How do you handle emergency breakdown recovery?", a: "We maintain reserve vehicles near operational corridors to dispatch replacement cabs within 30-45 minutes." },
    { q: "Do you supply electric or CNG vehicles?", a: "Yes, we maintain a fleet of clean energy CNG sedans and electric employee coaches in Delhi-NCR." },
    { q: "What SLA terms do you guarantee?", a: "We guarantee 99% route punctuality and vehicle dispatch SLAs, backed by penalties for delays." },

    // Car Rentals (10 FAQs)
    { q: "What is included in the hourly rental rate?", a: "Hourly rentals include fuel, vehicle, and chauffeur. Parking and tolls are charged at actuals." },
    { q: "Do you offer self-drive rentals?", a: "No, we specialize exclusively in chauffeur-driven executive car rentals and tours." },
    { q: "How are outstation night allowances computed?", a: "Driver night allowances apply for trips extending past 10:00 PM, covering driver lodging and boarding." },
    { q: "Are state border taxes included in outstation quotes?", a: "Yes, outstation quotes can be customized to include state border permit fees or billed at actuals." },
    { q: "Can I book a cab for a full week outstation trip?", a: "Yes, you can rent sedans, SUVs, or Tempo Travellers for multi-day outstation tour routes." },
    { q: "What is your fuel billing policy?", a: "Fares are calculated based on garage-to-garage distance or selected package boundaries." },
    { q: "Do your cabs have working AC in mountain terrain?", a: "Yes, our hill-permit vehicles have high-power AC units that drivers run as requested." },
    { q: "Can we request a specific vehicle model?", a: "Yes, you can specify model requirements (e.g. Innova Crysta, Fortuner) during booking confirmation." },
    { q: "How do I communicate with the driver?", a: "We dispatch driver contact details, name, and vehicle number via SMS/Email 4 hours before pickup time." },
    { q: "Is smoking or alcohol consumption allowed in cars?", a: "No, we enforce a strict clean cabin policy. Smoking and drinking are prohibited." },

    // Tours & Payments (10 FAQs)
    { q: "How can I customize a tour package?", a: "You can send your travel dates and route details to our tour desk to compile custom hotel and transport packages." },
    { q: "What payment gateways are integrated?", a: "We use Razorpay to accept credit cards, debit cards, UPI, net banking, and wallets." },
    { q: "Do you require advance payments for bookings?", a: "Yes, we require a 20-50% advance deposit to confirm hotel bookings and vehicle dispatches." },
    { q: "What is the cancellation policy for tour packages?", a: "Cancellations 15 days before travel receive a 100% refund. Inside 15 days, refunds are subject to hotel cancellation terms." },
    { q: "How long does a refund processing take?", a: "Confirmed refunds are credited back to the original source account via Razorpay within 5-7 business days." },
    { q: "Are flight tickets included in tour prices?", a: "Our base prices cover land transfers, sightseeing, and hotel stays. Flights can be added on request." },
    { q: "Can we pay the balance amount directly to the driver?", a: "Yes, balance payments can be paid directly to the driver in cash or paid online before trip completion." },
    { q: "Do you provide tour guide services?", a: "We arrange certified local guides at heritage checkpoints upon request." },
    { q: "What happens if a flight is delayed?", a: "We monitor flight arrival feeds at major terminals to adjust driver pickup times automatically." },
    { q: "Are driver tips included in package costs?", a: "Driver tips are not mandatory and left entirely to your discretion based on service quality." },
  ];

  await prisma.siteSetting.create({
    data: {
      key: "faqs",
      value: faqsList,
      description: "List of 30 structured FAQs covering corporate commutes, rentals, and payments.",
    },
  });

  console.log("Site Settings and 30 FAQs seeded.");

  // ==========================================
  // 9. Lead Generation (25 Corp, 25 Rental, 25 Tour)
  // ==========================================
  const indianNames = [
    "Rajesh Gupta", "Sunita Rao", "Amit Mishra", "Priya Nair", "Sandeep Patil",
    "Vikram Kapoor", "Komal Sharma", "Rohan Verma", "Anjali Bose", "Harish Kumar",
    "Divya Reddy", "Karan Johar", "Shweta Tiwari", "Arjun Rampal", "Renu Bala",
    "Sanjay Dutt", "Meera Sen", "Vijay Mallya", "Suresh Raina", "Gaurav Kapur",
    "Aditi Rao", "Abhishek Shah", "Neha Kakkar", "Kunal Bahl", "Manish Malhotra"
  ];

  const companiesList = [
    "Acme India", "Tech Synergy", "Vikas Holdings", "Apex Telecom", "Zenith Consultants",
    "Delta Soft", "Future Logistics", "Bharat Exports", "Hindustan Retail", "Core Infra",
    "Navin Ventures", "Pioneer Media", "Standard Cabs Co", "Metropolis Health", "Prime Steels"
  ];

  // 25 Corporate Leads
  for (let i = 0; i < 25; i++) {
    await prisma.corporateLead.create({
      data: {
        companyName: companiesList[i % companiesList.length] + ` Pvt Ltd`,
        contactName: indianNames[i],
        email: `corporate${i + 1}@${companiesList[i % companiesList.length].toLowerCase().replace(" ", "")}.com`,
        phone: `+9198765432${i.toString().padStart(2, "0")}`,
        employeeCount: 50 + (i * 20),
        pickupLocations: "Delhi, Noida, Gurugram",
        serviceType: "Employee Commute Shift transport",
        requirements: `Provide 24/7 B2B employee cab support, daily shift roster planning. Expected passenger volume: ${50 + (i * 20)} employees daily.`,
        notes: i % 3 === 0 ? "Qualified lead, scheduling manager negotiation meeting." : "Fresh lead received from website form.",
        status: i % 4 === 0 ? LeadStatus.QUALIFIED : i % 5 === 0 ? LeadStatus.CONTACTED : LeadStatus.NEW,
      },
    });
  }

  // 25 Rental Leads
  const vehicleCats = await prisma.vehicleCategory.findMany();
  for (let i = 0; i < 25; i++) {
    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + i + 2);
    await prisma.rentalLead.create({
      data: {
        pickupLocation: "Connaught Place, Delhi",
        dropLocation: "Hinjewadi IT Park, Pune",
        pickupDateTime: pickupDate,
        returnDateTime: i % 2 === 0 ? new Date(pickupDate.getTime() + 48 * 3600 * 1000) : null,
        vehicleCategoryId: vehicleCats[i % vehicleCats.length].id,
        customerName: indianNames[24 - i],
        email: `rental${i + 1}@gmail.com`,
        phone: `+9199999992${i.toString().padStart(2, "0")}`,
        tripType: i % 2 === 0 ? "ROUND_TRIP" : "ONE_WAY",
        notes: i % 4 === 0 ? "Driver assigned, booking confirmed." : "Fresh outstation lead.",
        status: i % 3 === 0 ? LeadStatus.CONTACTED : LeadStatus.NEW,
      },
    });
  }

  // 25 Contact/Tour leads (seeded as ContactLead table)
  for (let i = 0; i < 25; i++) {
    await prisma.contactLead.create({
      data: {
        name: indianNames[i],
        email: `contact${i + 1}@gmail.com`,
        phone: `+9197777773${i.toString().padStart(2, "0")}`,
        subject: i % 2 === 0 ? "Leisure Tour Package Query" : "B2B Partnership Proposal",
        message: `Looking to request pricing charts and itinerary details for travel route planning. Please contact as soon as possible.`,
        status: i % 4 === 0 ? LeadStatus.CONTACTED : LeadStatus.NEW,
      },
    });
  }

  console.log("75 leads seeded successfully.");

  // ==========================================
  // 10. Bookings & 25 Razorpay Payments
  // ==========================================
  // Get package references
  const packages = await prisma.tourPackage.findMany();
  const customerUser = customers[0];

  for (let i = 0; i < 25; i++) {
    const bookingNo = `BKG-${10000 + i}`;
    const amount = 10000 + (i * 2000);
    const tax = amount * 0.05;
    const net = amount + tax;

    const bkg = await prisma.booking.create({
      data: {
        bookingNumber: bookingNo,
        customerId: customerUser.id,
        vehicleCategoryId: vehicleCats[i % vehicleCats.length].id,
        type: BookingType.TOUR_PACKAGE,
        status: i % 5 === 0 ? BookingStatus.COMPLETED : i % 6 === 0 ? BookingStatus.CANCELLED : BookingStatus.CONFIRMED,
        pickupDateTime: new Date(),
        pickupLocation: "IGI Airport Terminal 3, Delhi",
        dropLocation: "Radisson Hotel Jaipur",
        totalAmount: amount,
        taxAmount: tax,
        netAmount: net,
        tourPackageId: packages[i % packages.length].id,
        notes: `Demo booking ledger details. Order ID reference #${10000 + i}`,
      },
    });

    // Seed payment record matching this booking
    await prisma.razorpayPayment.create({
      data: {
        bookingId: bkg.id,
        razorpayOrderId: `order_live_${10000 + i}_xyz`,
        razorpayPaymentId: i % 6 === 0 ? null : `pay_live_${10000 + i}_abc`,
        status: i % 6 === 0 ? PaymentStatus.FAILED : i % 5 === 0 ? PaymentStatus.REFUNDED : PaymentStatus.SUCCESS,
        amount: net,
        currency: "INR",
        gatewayResponse: {
          method: "card",
          bank: "HDFC",
          wallet: null,
          card_id: "card_8973abc",
          vpa: null,
          email: customerUser.email,
          contact: customerUser.phone,
        },
      },
    });
  }

  console.log("25 Bookings & matching Razorpay payment entries seeded.");
  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding process:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
