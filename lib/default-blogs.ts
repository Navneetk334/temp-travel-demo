export interface BlogCategoryData {
  id: string;
  name: string;
  slug: string;
  description: string;
  articleCount?: number;
  createdAt: string;
}

export interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  category: string;
  categorySlug?: string;
  summary: string;
  content: string;
  author: string;
  authorEmail?: string;
  date: string;
  createdAt: string;
  updatedAt?: string;
  published: boolean;
  status: "PUBLISHED" | "DRAFT" | "SCHEDULED";
  views: number;
  coverImage: string;
  featuredImage?: string;
  seoKeywords: string;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  readTime?: string;
}

export const DEFAULT_BLOG_CATEGORIES: BlogCategoryData[] = [
  {
    id: "cat-1",
    name: "Outstation Trips",
    slug: "outstation-trips",
    description: "Inter-city round trips, weekend getaways, and highway travel guides across India.",
    articleCount: 1,
    createdAt: "2026-08-01"
  },
  {
    id: "cat-2",
    name: "Corporate Travel",
    slug: "corporate-travel",
    description: "Executive chauffeurs, corporate employee transit solutions, and business hub connectivity.",
    articleCount: 1,
    createdAt: "2026-08-01"
  },
  {
    id: "cat-3",
    name: "Airport Transfers",
    slug: "airport-transfers",
    description: "Dedicated 24/7 airport terminal pickup and drop shuttles with real-time flight tracking.",
    articleCount: 1,
    createdAt: "2026-08-01"
  },
  {
    id: "cat-4",
    name: "Local City Guides",
    slug: "local-city-guides",
    description: "Full-day hourly 8hr/80km local sightseeing, point-to-point transfers and city exploration.",
    articleCount: 0,
    createdAt: "2026-08-01"
  }
];

export const DEFAULT_BLOG_POSTS: BlogPostData[] = [
  {
    id: "art-1",
    title: "Top 10 Outstation Cab Travel Routes from Mumbai to Pune & Mahabaleshwar",
    slug: "top-10-outstation-cab-routes-mumbai-pune",
    category: "Outstation Trips",
    categorySlug: "outstation-trips",
    summary: "Exploring the lush green Western Ghats between Mumbai and Pune requires a reliable, comfortable chauffeur-driven car rental. In this comprehensive guide, we cover the top routes, toll plaza advice, and why booking an Innova Crysta with TEMP TRAVEL CAR RENTALS PVT LTD ensures a stress-free trip.",
    content: `## Why Outstation Travel via Chauffeur-Driven Cab is the Gold Standard

Exploring Maharashtra's most picturesque hill stations and business corridors is best experienced from the comfort of a dedicated, chauffeur-driven luxury vehicle. Whether you're heading from Mumbai to Pune for high-stakes corporate meetings, or escaping to the misty strawberry valleys of Mahabaleshwar and Panchgani for a weekend retreat, having a verified, professional driver eliminates navigation stress and parking woes.

### 1. Mumbai to Pune via Yashwantrao Chavan Expressway
The Mumbai-Pune Expressway (94.5 km) is India's pioneer 6-lane concrete access-controlled tollway. 
- **Travel Time:** 2.5 to 3.5 Hours depending on traffic at Khalapur and Urse toll plazas.
- **Top Vehicle Choice:** Toyota Innova Hycross or Executive Sedan like Honda City for smooth cruising at expressway speeds.
- **Key Pitstops:** Food Mall at Khalapur for quick refreshments, Starbucks, and clean washroom facilities.

### 2. Mumbai to Mahabaleshwar via NH 48
Rising 1,353 meters above sea level, Mahabaleshwar offers sweeping views of the Western Ghats.
- **Distance:** ~260 km from South Mumbai.
- **Route Highlights:** Travel through the scenic Pasarni Ghat near Wai.
- **Sightseeing Must-Visits:** Arthur's Seat, Elephant's Head Point, Venna Lake, and Mapro Garden for fresh strawberry treats.

### 3. Mumbai to Lonavala & Khandala
Perfect for quick day trips or overnight stays during monsoon and winter seasons.
- **Distance:** ~85 km from Mumbai.
- **Attractions:** Tiger's Leap, Bhushi Dam, Karla Caves, and legendary chikki outlets at Lonavala bazaar.

---

### Key Travel Tips for Outstation Rides:
1. **Choose the Right Fleet Class:** For hilly ghats, opt for SUV classes (Innova Crysta, Fortuner) for superior road grip and ample luggage space.
2. **Transparent Tolls & Permits:** At TEMP TRAVEL, all outstation packages feature transparent toll calculations, interstate commercial permits, and structured driver allowances.
3. **24/7 Roadside Assistance:** All TEMP TRAVEL fleet vehicles undergo multi-point safety checks before every inter-city dispatch.

Book your outstation ride with TEMP TRAVEL CAR RENTALS PVT LTD today for an unmatched chauffeur experience!`,
    author: "TEMP TRAVEL Editorial Team",
    authorEmail: "editorial@temptravels.com",
    date: "2026-08-20",
    createdAt: "2026-08-20T10:00:00.000Z",
    status: "PUBLISHED",
    published: true,
    views: 1420,
    coverImage: "/images/hero-car.png",
    featuredImage: "/images/hero-car.png",
    seoKeywords: "Mumbai Pune Cab, Outstation Taxi, Innova Crysta, Mahabaleshwar Cab, Pune Car Rental",
    seoTitle: "Top 10 Outstation Cab Routes from Mumbai to Pune & Mahabaleshwar | Temp Travel",
    seoDescription: "Book premium chauffeur-driven outstation cabs from Mumbai to Pune, Lonavala, and Mahabaleshwar with TEMP TRAVEL. Transparent rates and verified drivers.",
    tags: ["Outstation", "Mumbai", "Pune", "Mahabaleshwar", "RoadTrips"],
    readTime: "5 min read"
  },
  {
    id: "art-2",
    title: "Corporate Employee Transit Solutions: Maximizing Productivity in BKC & Powai",
    slug: "corporate-employee-transit-solutions-mumbai",
    category: "Corporate Travel",
    categorySlug: "corporate-travel",
    summary: "Corporate logistics in Mumbai's business hubs require punctual, ISO 9001-certified chauffeur services. TEMP TRAVEL delivers automated roster management and real-time GPS telematics for multinational firms.",
    content: `## Modernizing Enterprise Employee Mobility in Mumbai

Corporate transit is no longer just about getting employees from Point A to Point B—it is a critical pillar of corporate duty of care, employee safety, punctuality, and operational efficiency. In bustling commercial districts such as Bandra Kurla Complex (BKC), Powai, Lower Parel, and Mindspace Airoli, traffic congestion can cost executives valuable working hours.

### The Challenges of Enterprise Commuting
- **Unpredictable Shift Logistics:** 24/7 IT/ITeS and Financial Services shifts require strict pickup timing windows.
- **Safety & Compliance:** Stringent regulatory compliance for night shifts, mandatory female employee escort protocols, and verified chauffeurs with background verification (Aadhaar, Police clearance).
- **Billing Overhead:** Fragmented receipt management and manual reconciliation across multiple cab vendors create administrative burdens.

### How TEMP TRAVEL Solves Corporate Mobility
1. **Centralized Digital Roster Management:** Dynamic routing and shift allocation software reduces fleet idling and optimizes fuel consumption.
2. **Real-time GPS Telematics & SOS:** Every vehicle is monitored 24/7 via telematics with panic buttons and geo-fencing.
3. **Consolidated GST Invoicing:** Single monthly invoice with complete trip break-ups, SAC code classifications, and full GST input tax credit compatibility.
4. **Executive Chauffeur Roster:** Uniformed, polite, English/Hindi-speaking chauffeurs trained in executive etiquette and defensive driving.

---

### Flexible Fleet Portfolio for Corporate Accounts:
- **Executive Sedans:** Maruti Dzire, Honda City, Hyundai Verna for client visits and airport transit.
- **Premium SUVs:** Toyota Innova Hycross, Fortuner for CXO and board member transit.
- **Employee Shuttles:** Tempo Travellers & luxury buses for group employee shift shuttles.

Partner with TEMP TRAVEL CAR RENTALS PVT LTD to transform your enterprise transportation ecosystem.`,
    author: "Navneet Kumar (Operations HQ)",
    authorEmail: "operations@temptravels.com",
    date: "2026-08-18",
    createdAt: "2026-08-18T09:30:00.000Z",
    status: "PUBLISHED",
    published: true,
    views: 2890,
    coverImage: "/images/hero-car.png",
    featuredImage: "/images/hero-car.png",
    seoKeywords: "Corporate Cabs BKC, Employee Transit Roster, Executive Shuttle Mumbai, Corporate Car Rental",
    seoTitle: "Corporate Employee Transit Solutions in BKC & Powai | Temp Travel",
    seoDescription: "Streamline employee commuting and CXO travel in Mumbai with TEMP TRAVEL's corporate car rentals. Automated rosters and GST billing.",
    tags: ["Corporate", "BKC", "Powai", "ExecutiveTravel", "FleetManagement"],
    readTime: "6 min read"
  },
  {
    id: "art-3",
    title: "Complete Guide to Airport Transfer Rentals at Chhatrapati Shivaji Maharaj Intl T2",
    slug: "airport-transfer-rental-guide-mumbai-t2",
    category: "Airport Transfers",
    categorySlug: "airport-transfers",
    summary: "Avoid airport pickup hassles with TEMP TRAVEL's 24/7 dedicated airport transfer shuttle. Learn about pickup points, transparent billing, and flight tracking integration.",
    content: `## Seamless Terminal Transfers at Mumbai International Airport (BOM)

Chhatrapati Shivaji Maharaj International Airport Terminal 2 (CSMIA T2) is one of the busiest aviation gateways in South Asia. Navigating terminal parking, long app-cab queue lines, and surging peak-hour fares after a tiring long-haul flight can be exhausting. 

With TEMP TRAVEL's dedicated pre-booked airport chauffeur service, your driver waits for you before your plane touches down on the tarmac.

### Key Advantages of Pre-Booking Airport Transfers
- **Real-Time Flight Tracking:** Chauffeurs track incoming flight numbers (AI, 6E, EK, BA) to adjust pickup timings automatically in case of air traffic delays.
- **Flight Delay - Zero Extra Surcharge:** No wait-time penalties if your flight gets delayed or baggage retrieval takes longer.
- **Meet & Greet Service:** Chauffeur greets you at the arrival hall exit pillar with a personalized name placard and assists with heavy luggage.
- **Fixed Transparent Tariffs:** No surge pricing, no hidden nighttime fees, and all toll charges clearly specified upfront.

### Designated T2 Pickup Locations:
1. **Arrivals Pillar Level P4 / P6:** Standard pre-arranged executive car pickup points.
2. **VIP Valet Zone:** Rapid boarding for luxury sedan and VIP delegations.

---

### Step-by-Step Guide to Booking:
1. Provide flight number, arrival date, and destination address on our booking widget.
2. Select your vehicle class (Sedan, Premium SUV, or Luxury).
3. Receive chauffeur name, mobile number, and vehicle registration number via SMS/WhatsApp 2 hours prior to arrival.

Travel in utmost peace and luxury with TEMP TRAVEL CAR RENTALS PVT LTD!`,
    author: "TEMP TRAVEL Editorial Team",
    authorEmail: "editorial@temptravels.com",
    date: "2026-08-15",
    createdAt: "2026-08-15T14:00:00.000Z",
    status: "PUBLISHED",
    published: true,
    views: 3100,
    coverImage: "/images/hero-car.png",
    featuredImage: "/images/hero-car.png",
    seoKeywords: "Mumbai Airport T2 Cab, Pickup Drop Cabs, Sahar Hub Shuttle, Airport Taxi Mumbai",
    seoTitle: "Complete Guide to Airport Transfer Rentals at Mumbai T2 | Temp Travel",
    seoDescription: "Book stress-free 24/7 airport transfers at Mumbai CSMIA Terminal 2 with TEMP TRAVEL. Flight tracking, meet & greet, and zero surge pricing.",
    tags: ["AirportTransfer", "MumbaiAirport", "T2", "Chauffeur", "CabBooking"],
    readTime: "4 min read"
  }
];

export function getEffectiveDefaultBlogs(): BlogPostData[] {
  return DEFAULT_BLOG_POSTS;
}

export function getEffectiveDefaultCategories(): BlogCategoryData[] {
  return DEFAULT_BLOG_CATEGORIES;
}
