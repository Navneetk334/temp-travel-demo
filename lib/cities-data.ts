export interface CityDetails {
  name: string;
  formattedName: string;
  stateCode: string;
  postalCode: string;
  streetAddress: string;
  phone: string;
  airport: string;
  corporateHubs: string[];
  description: string;
  metaDescription: string;
  keywords: string[];
  localQuotes: string[];
  faqs: { question: string; answer: string }[];
}

export const CITIES_DATA: Record<string, CityDetails> = {
  delhi: {
    name: "delhi",
    formattedName: "Delhi NCR",
    stateCode: "DL",
    postalCode: "110001",
    streetAddress: "GF-12, Tolstoy House, Tolstoy Marg, Connaught Place",
    phone: "+91-9999999991",
    airport: "Indira Gandhi International Airport (IGI) Terminal 3",
    corporateHubs: [
      "Gurugram Cyber City",
      "Noida Sector 62",
      "Connaught Place (CP)",
      "Okhla Industrial Area",
      "DLF Cyber Hub",
    ],
    description:
      "TEMP TRAVEL CAR RENTALS PVT LTD is Delhi's leading corporate transport provider. We specialize in high-volume employee transportation services, executive airport transfers at IGI Airport, and premium local & outstation car rentals across Delhi, Gurugram, Noida, and Faridabad.",
    metaDescription:
      "Looking for premium corporate cab service or car rental in Delhi NCR? Temp Travel provides safe employee transportation, airport transfers, and outstation packages.",
    keywords: [
      "Corporate Cab Service Delhi",
      "Corporate Transportation Delhi",
      "Employee Transportation Service",
      "Airport Transfer Delhi",
      "Car Rental Delhi",
      "Travel Agency Delhi",
      "Delhi Noida Gurugram Cab Services",
    ],
    localQuotes: [
      "Connaught Place to Noida Sector 62 executive commutes are fully automated.",
      "Vetted drivers are compliant with Delhi-NCR transport regulations.",
      "Clean CNG and commercial fuel fleets to adhere to regional emissions regulations.",
    ],
    faqs: [
      {
        question: "How do you manage B2B roster routing in Delhi NCR?",
        answer: "We use automated route planning software to group employee pickup coordinates across Noida, Gurugram, and Delhi, optimizing trip counts and saving up to 25% in operational logistics expenses."
      },
      {
        question: "Do you offer outstation round-trips from Delhi?",
        answer: "Yes, we provide outstation car rentals to Jaipur, Agra, Chandigarh, Haridwar, and Dehradun with luxury SUVs and Tempo Travellers."
      }
    ]
  },
  mumbai: {
    name: "mumbai",
    formattedName: "Mumbai",
    stateCode: "MH",
    postalCode: "400051",
    streetAddress: "Flat No C-102, Shanti Vihar, Lokhandwala Complex, Kandivali East",
    phone: "+91-9999999992",
    airport: "Chhatrapati Shivaji Maharaj International Airport (CSMIA) Terminal 2",
    corporateHubs: [
      "Bandras-Kurla Complex (BKC)",
      "Nariman Point",
      "Andheri East IT Park",
      "Lower Parel",
      "Nirlon Knowledge Park (Goregaon)",
    ],
    description:
      "TEMP TRAVEL CAR RENTALS PVT LTD serves the financial capital with top-tier executive transportation and car rentals. We manage large-scale employee pickup-drop dispatches for MNCs in BKC and Goregaon, airport transfers to CSMIA, and scenic tours to Lonavala, Pune, and Goa.",
    metaDescription:
      "Premium Corporate Cab Services and local car rental in Mumbai. Vetted professional drivers, GPS-enabled premium cars, and reliable airport dispatches.",
    keywords: [
      "Corporate Cab Service Mumbai",
      "Corporate Transportation Mumbai",
      "Employee Transportation Mumbai",
      "Airport Transfer Mumbai",
      "Car Rental Mumbai",
      "Travel Agency Mumbai",
      "BKC Corporate Cab Rentals",
    ],
    localQuotes: [
      "High-efficiency executive shuttles across BKC, Nariman Point, and Andheri.",
      "Reliable Terminal 2 airport dispatches with dedicated driver paging.",
      "Fully compliant fleet with active Maharashtra state permits.",
    ],
    faqs: [
      {
        question: "Can we rent luxury vehicles like Fortuner in Mumbai?",
        answer: "Yes, we maintain a fleet of premium SUVs (Innova Crysta, Fortuner) and luxury sedans for corporate executives and VIP airport pickups."
      },
      {
        question: "Are your drivers trained for heavy Mumbai monsoon traffic?",
        answer: "All our drivers undergo specialized safety and defensive driving courses, and our 24/7 command center monitors active weather bulletins and re-routes vehicles dynamically."
      }
    ]
  },
  pune: {
    name: "pune",
    formattedName: "Pune",
    stateCode: "MH",
    postalCode: "411057",
    streetAddress: "Building B, Hinjewadi Phase 1 IT Park",
    phone: "+91-9999999993",
    airport: "Pune International Airport (Lohegaon)",
    corporateHubs: [
      "Hinjewadi IT Park Phase 1, 2 & 3",
      "Magarpatta Cybercity",
      "Kharadi IT Park",
      "Viman Nagar",
      "Talawade IT Park",
    ],
    description:
      "TEMP TRAVEL CAR RENTALS PVT LTD provides premium mobility systems in Pune. We are the chief partner for HR departments across Hinjewadi and Magarpatta, delivering automated employee cabs, local corporate transfers, and weekend tourist packages to Mahabaleshwar and Lonavala.",
    metaDescription:
      "Efficient employee transportation services and outstation car rental in Pune. Get top-tier cabs, verified chauffeurs, and customized tour packages.",
    keywords: [
      "Corporate Cab Service Pune",
      "Corporate Transportation Pune",
      "Employee Transportation Pune",
      "Airport Transfer Pune",
      "Car Rental Pune",
      "Travel Agency Pune",
      "Hinjewadi Corporate Employee Cabs",
    ],
    localQuotes: [
      "Comprehensive rosters serving IT Parks in Hinjewadi, Kharadi, and Magarpatta.",
      "Airport transfer coordination to Lohegaon Airport.",
      "Regular weekend dispatches to Mahabaleshwar, Lavasa, and Lonavala.",
    ],
    faqs: [
      {
        question: "Do you specialize in corporate monthly subscriptions in Pune?",
        answer: "Yes, we provide monthly car rental subscriptions for corporations, complete with a dedicated account supervisor and monthly automated billing reports."
      },
      {
        question: "Do you have passenger capacity for group excursions?",
        answer: "We support team-building outstation trips with 13-seater, 17-seater, and 26-seater Tempo Travellers as well as luxury buses."
      }
    ]
  },
  bangalore: {
    name: "bangalore",
    formattedName: "Bangalore",
    stateCode: "KA",
    postalCode: "560048",
    streetAddress: "Tech Park Boulevard, Whitefield",
    phone: "+91-9999999994",
    airport: "Kempegowda International Airport (KIA) Terminal 2",
    corporateHubs: [
      "Whitefield IT Hub",
      "Electronic City Phase 1 & 2",
      "Manyata Tech Park",
      "Outer Ring Road (ORR) IT Corridor",
      "Bagmane Tech Park",
    ],
    description:
      "TEMP TRAVEL CAR RENTALS PVT LTD is the primary transit choice in Bangalore. We power corporate mobility for the Silicon Valley of India, executing employee transport routes, premium airport dispatches to KIA, and scenic tourist trips to Nandi Hills, Mysore, and Coorg.",
    metaDescription:
      "Reliable corporate transportation and car rentals in Bangalore. Book premium employee cabs and airport transfers in Whitefield and Electronic City.",
    keywords: [
      "Corporate Cab Service Bangalore",
      "Corporate Transportation Bangalore",
      "Employee Transportation Bangalore",
      "Airport Transfer Bangalore",
      "Car Rental Bangalore",
      "Travel Agency Bangalore",
      "Whitefield Corporate Cab Rentals",
    ],
    localQuotes: [
      "Roster routing configured for tech corridor lanes like ORR, Whitefield, and Electronic City.",
      "Fast-track airport taxi service to KIA Airport Terminal 2.",
      "Customized outstation tour packages to Mysore, Coorg, Ooty, and Wayanad.",
    ],
    faqs: [
      {
        question: "How do you ensure employee safety during night shifts in Bangalore?",
        answer: "Every vehicle is equipped with active GPS tracking and emergency panic buttons. We enforce strict compliance including mandatory driver verification and escorts for female employees travelling during night slots."
      },
      {
        question: "Can we track our employee transport usage?",
        answer: "Yes, our B2B corporate SPOC dashboard logs boarding times, route paths, drop timestamps, and driver details for transparency."
      }
    ]
  },
};

export function getCityDetails(city: string): CityDetails {
  const normalized = city.toLowerCase().trim();
  if (CITIES_DATA[normalized]) {
    return CITIES_DATA[normalized];
  }

  // Generate dynamic fallback details for other cities
  const formattedCity = city.charAt(0).toUpperCase() + city.slice(1);
  return {
    name: normalized,
    formattedName: formattedCity,
    stateCode: "IN",
    postalCode: "400001",
    streetAddress: `Temp Travel Hub, Central Area, ${formattedCity}`,
    phone: "+91-9999999999",
    airport: `${formattedCity} Domestic Airport`,
    corporateHubs: [
      "Downtown Business Park",
      "Industrial Growth Center",
      "Central IT Hub",
    ],
    description:
      `TEMP TRAVEL CAR RENTALS PVT LTD provides standard corporate travel and taxi services in ${formattedCity}. We support customized corporate cabs, verified airport transfers, and local & outstation bookings.`,
    metaDescription:
      `Rent a car in ${formattedCity} with Temp Travel. We provide corporate transportation, airport pickup services, and outstation trips with premium vehicles.`,
    keywords: [
      `Corporate Cab Service ${formattedCity}`,
      `Corporate Transportation ${formattedCity}`,
      `Employee Transportation ${formattedCity}`,
      `Airport Transfer ${formattedCity}`,
      `Car Rental ${formattedCity}`,
      `Travel Agency ${formattedCity}`,
    ],
    localQuotes: [
      `Prompt airport transfer dispatches to ${formattedCity} Airport.`,
      "Vetted, background-verified professional drivers.",
      "Clean, modern, and sanitized cars.",
    ],
    faqs: [
      {
        question: `How do I book a corporate cab service in ${formattedCity}?`,
        answer: "You can book directly using our website inquiry form or contact our 24/7 helpdesk to set up a B2B corporate account."
      },
      {
        question: "What vehicle categories are available?",
        answer: "We support Hatchbacks, Sedans, SUVs, and luxury Tempo Travellers depending on availability in your region."
      }
    ]
  };
}
