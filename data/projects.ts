export interface GalleryProject {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  category: "fleet" | "tours" | "corporate";
  featured: boolean;
  year: string;
  location: string;
  subtitle: string;
  description: string;
}

export const GALLERY_PROJECTS: GalleryProject[] = [
  {
    id: "proj-1",
    title: "Toyota Innova Hycross — Executive Business Fleet",
    slug: "innova-hycross-business-fleet",
    coverImage: "/images/fleet-suv.png",
    category: "fleet",
    featured: true,
    year: "2026",
    location: "Delhi NCR",
    subtitle: "Hybrid MPV / MUV Mobility",
    description: "Premium hybrid MPV equipped with captain seats, automated climate zones, and GPS tracking for seamless corporate transfers."
  },
  {
    id: "proj-2",
    title: "Mercedes-Benz E-Class — VIP Chauffeur Series",
    slug: "mercedes-e-class-vip",
    coverImage: "/images/categories/luxury.jpg",
    category: "fleet",
    featured: true,
    year: "2026",
    location: "New Delhi",
    subtitle: "Ultra Luxury Sedan",
    description: "Diplomatic grade VIP transfers featuring bilingual chauffeurs, ambient lighting, and zero-delay airport meet & greet."
  },
  {
    id: "proj-3",
    title: "Golden Triangle Heritage Expedition — Delhi, Agra & Jaipur",
    slug: "golden-triangle-tour",
    coverImage: "/images/categories/suv.jpg",
    category: "tours",
    featured: true,
    year: "2026",
    location: "North India",
    subtitle: "Curated 5-Day Heritage Package",
    description: "Private chauffeur-driven tour visiting Taj Mahal, Amber Fort, and Qutub Minar with luxury SUV comfort."
  },
  {
    id: "proj-4",
    title: "IGI Terminal 3 — Corporate Express Airport Shuttle",
    slug: "igi-airport-express-shuttle",
    coverImage: "/images/categories/sedan.jpg",
    category: "corporate",
    featured: true,
    year: "2026",
    location: "Delhi IGI Airport",
    subtitle: "24/7 Aviation Mobility",
    description: "Dedicated flight-tracked airport cabs providing instant terminal pickups and corporate automated billing."
  },
  {
    id: "proj-5",
    title: "Manali & Solang Valley Highway Expedition",
    slug: "manali-solang-highway-tour",
    coverImage: "/images/categories/tempo-traveller.jpg",
    category: "tours",
    featured: true,
    year: "2026",
    location: "Himachal Pradesh",
    subtitle: "High-Altitude Group Journey",
    description: "Luxury 17-seater Tempo Traveller expedition tailored for family groups traversing snow passes safely."
  },
  {
    id: "proj-6",
    title: "BMW 5 Series — Executive Corporate Commute",
    slug: "bmw-5-series-executive",
    coverImage: "/images/categories/luxury.jpg",
    category: "fleet",
    featured: false,
    year: "2025",
    location: "Gurugram Hub",
    subtitle: "German Precision Fleet",
    description: "High-end corporate daily mobility engineered for CEO and board member office commutes."
  },
  {
    id: "proj-7",
    title: "Goa Coastal Highway & Heritage Beach Circuit",
    slug: "goa-coastal-circuit-tour",
    coverImage: "/images/categories/hatchback.jpg",
    category: "tours",
    featured: false,
    year: "2025",
    location: "North & South Goa",
    subtitle: "Scenic Highway Escape",
    description: "Custom road trip itinerary covering Old Goa Basilica, Fort Aguada, and secluded pristine coastlines."
  },
  {
    id: "proj-8",
    title: "Force Urbania 17S — High-Capacity Corporate Bus",
    slug: "force-urbania-corporate-shuttle",
    coverImage: "/images/categories/tempo-traveller.jpg",
    category: "corporate",
    featured: false,
    year: "2026",
    location: "Bengaluru Tech Parks",
    subtitle: "Next-Gen Employee Commute",
    description: "Ultra-spacious ergonomic passenger van configured for corporate shift transports and event logistics."
  }
];
