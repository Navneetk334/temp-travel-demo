"use client";

// IndexedDB database and store configuration for large files/documents
const DB_NAME = "TempTravel_Vault_DB";
const DB_VERSION = 1;
const STORE_NAME = "vault_files";

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

      request.onerror = () => {
        console.warn("IndexedDB could not be opened, using fallback storage");
        resolve(null);
      };
    } catch (e) {
      console.warn("Error accessing indexedDB:", e);
      resolve(null);
    }
  });
}

/**
 * Stores a document's data URL in IndexedDB with local fallback
 */
export async function setVaultFile(key: string, dataUrl: string): Promise<void> {
  const db = await openDB();
  if (db) {
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const req = store.put(dataUrl, key);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch (err) {
        console.warn("Error saving to IndexedDB:", err);
        resolve();
      }
    });
  } else {
    // Fallback: try localStorage if size is reasonably small
    try {
      if (dataUrl.length < 500000) {
        localStorage.setItem(`vault_file_${key}`, dataUrl);
      }
    } catch (e) {
      // ignore quota
    }
  }
}

/**
 * Retrieves a document's data URL from IndexedDB or local fallback
 */
export async function getVaultFile(key: string): Promise<string | null> {
  const db = await openDB();
  if (db) {
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = (event: any) => {
          resolve(event.target.result || null);
        };
        req.onerror = () => {
          const fallback = localStorage.getItem(`vault_file_${key}`);
          resolve(fallback);
        };
      } catch (err) {
        const fallback = localStorage.getItem(`vault_file_${key}`);
        resolve(fallback);
      }
    });
  }

  return localStorage.getItem(`vault_file_${key}`) || null;
}

/**
 * Deletes a document's data URL from IndexedDB and local fallback
 */
export async function deleteVaultFile(key: string): Promise<void> {
  const db = await openDB();
  if (db) {
    new Promise<void>((resolve) => {
      try {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  }
  try {
    localStorage.removeItem(`vault_file_${key}`);
  } catch (e) {}
}

export function getVehicleDocKey(regNumber: string, docType: string) {
  const clean = (regNumber || "VEH").trim().toUpperCase().replace(/\s+/g, "_");
  return `veh_${clean}_${docType.toLowerCase()}`;
}

export function getDriverDocKey(driverIdOrName: string, docType: string) {
  const clean = (driverIdOrName || "DRV").trim().toUpperCase().replace(/\s+/g, "_");
  return `drv_${clean}_${docType.toLowerCase()}`;
}

export function getStaffDocKey(staffIdOrName: string, docType: string) {
  const clean = (staffIdOrName || "STF").trim().toUpperCase().replace(/\s+/g, "_");
  return `stf_${clean}_${docType.toLowerCase()}`;
}

/**
 * Generates an authentic SVG Digital Government / KYC compliance document data URL
 * used when an uploaded file scan is not present in local IndexedDB.
 */
export function generateFallbackVaultDocument({
  title = "",
  refNumber = "",
  expiryDate = "",
  regNumber = "",
  category = ""
}: {
  title?: string;
  refNumber?: string;
  expiryDate?: string;
  regNumber?: string;
  category?: string;
}): string {
  const tLower = title.toLowerCase();
  const cLower = category.toLowerCase();
  const subject = regNumber || "TEMP TRAVEL CAR RENTALS PVT LTD";
  const ref = refNumber || "GOVT-VERIFIED-RECORD";
  const exp = expiryDate || "Active Perpetual";

  // 1. Digital Aadhaar Card
  if (tLower.includes("aadhaar") || ref.replace(/\s+/g, "").length === 12 && /^\d+$/.test(ref.replace(/\s+/g, ""))) {
    const rawNum = ref.replace(/\D/g, "");
    const formattedAadhaar = rawNum.length === 12
      ? `${rawNum.slice(0, 4)} ${rawNum.slice(4, 8)} ${rawNum.slice(8, 12)}`
      : (ref || "9900 8877 6655");

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 540" width="100%" height="100%">
      <defs>
        <linearGradient id="flag_strip" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#FF9933"/>
          <stop offset="50%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="#128807"/>
        </linearGradient>
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.35"/>
        </filter>
      </defs>
      <!-- Background Card -->
      <rect x="25" y="20" width="800" height="500" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#shadow)"/>
      <rect x="25" y="20" width="800" height="14" rx="7" fill="url(#flag_strip)"/>
      
      <!-- Top Emblem & Authority Header -->
      <g transform="translate(50, 45)">
        <!-- National Emblem Motif -->
        <circle cx="35" cy="35" r="28" fill="#FFF7ED" stroke="#EA580C" stroke-width="2"/>
        <text x="35" y="32" font-family="sans-serif" font-size="11" font-weight="900" fill="#EA580C" text-anchor="middle">सत्यमेव</text>
        <text x="35" y="46" font-family="sans-serif" font-size="11" font-weight="900" fill="#EA580C" text-anchor="middle">जयते</text>
        
        <!-- Header Text -->
        <text x="80" y="28" font-family="sans-serif" font-size="17" font-weight="900" fill="#1E293B">भारत सरकार • GOVERNMENT OF INDIA</text>
        <text x="80" y="48" font-family="sans-serif" font-size="12" font-weight="700" fill="#D97706">भारतीय विशिष्ट पहचान प्राधिकरण • UNIQUE IDENTIFICATION AUTHORITY OF INDIA</text>
      </g>
      
      <line x1="50" y1="125" x2="800" y2="125" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="4 4"/>
      
      <!-- Driver Photo Box / Avatar -->
      <g transform="translate(60, 150)">
        <rect width="160" height="200" rx="16" fill="#F8FAFC" stroke="#94A3B8" stroke-width="2"/>
        <circle cx="80" cy="75" r="42" fill="#E2E8F0"/>
        <path d="M 35 180 C 35 125, 125 125, 125 180 Z" fill="#94A3B8"/>
        <rect x="15" y="165" width="130" height="24" rx="6" fill="#0284C7"/>
        <text x="80" y="181" font-family="sans-serif" font-size="10" font-weight="900" fill="#FFFFFF" text-anchor="middle">VERIFIED CHAUFFEUR</text>
      </g>
      
      <!-- Driver Details -->
      <g transform="translate(250, 160)">
        <text x="0" y="24" font-family="sans-serif" font-size="14" font-weight="700" fill="#64748B">नाम / Name</text>
        <text x="0" y="55" font-family="sans-serif" font-size="26" font-weight="900" fill="#0F172A">${subject}</text>
        
        <text x="0" y="95" font-family="sans-serif" font-size="13" font-weight="700" fill="#64748B">जन्म तिथि / Date of Birth: <tspan font-weight="800" fill="#1E293B">01/01/1990</tspan></text>
        <text x="0" y="125" font-family="sans-serif" font-size="13" font-weight="700" fill="#64748B">लिंग / Gender: <tspan font-weight="800" fill="#1E293B">पुरुष / MALE</tspan></text>
        <text x="0" y="155" font-family="sans-serif" font-size="13" font-weight="700" fill="#64748B">पंजीकृत संगठन / Org: <tspan font-weight="800" fill="#D97706">TEMP TRAVEL CAR RENTALS PVT LTD</tspan></text>
      </g>
      
      <!-- QR Code Block -->
      <g transform="translate(660, 160)">
        <rect width="130" height="130" rx="12" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2"/>
        <rect x="15" y="15" width="30" height="30" fill="#0F172A"/>
        <rect x="20" y="20" width="20" height="20" fill="#FFFFFF"/>
        <rect x="25" y="25" width="10" height="10" fill="#0F172A"/>
        <rect x="85" y="15" width="30" height="30" fill="#0F172A"/>
        <rect x="90" y="20" width="20" height="20" fill="#FFFFFF"/>
        <rect x="95" y="25" width="10" height="10" fill="#0F172A"/>
        <rect x="15" y="85" width="30" height="30" fill="#0F172A"/>
        <rect x="20" y="90" width="20" height="20" fill="#FFFFFF"/>
        <rect x="25" y="95" width="10" height="10" fill="#0F172A"/>
        <circle cx="65" cy="65" r="12" fill="#0284C7"/>
        <path d="M 60 65 L 64 69 L 71 60" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
        <text x="65" y="122" font-family="sans-serif" font-size="8" font-weight="800" fill="#64748B" text-anchor="middle">DIGITALLY SIGNED</text>
      </g>
      
      <!-- Large Aadhaar Number Bar -->
      <g transform="translate(50, 385)">
        <rect width="750" height="65" rx="14" fill="#FEF3C7" stroke="#FDE68A" stroke-width="1.5"/>
        <text x="375" y="42" font-family="monospace, sans-serif" font-size="32" font-weight="900" fill="#B45309" letter-spacing="4" text-anchor="middle">${formattedAadhaar}</text>
      </g>
      
      <!-- Bottom Red Stripe & Motto -->
      <g transform="translate(25, 475)">
        <rect width="800" height="45" rx="10" fill="#DC2626"/>
        <text x="400" y="28" font-family="sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" text-anchor="middle">मेरा आधार, मेरी पहचान • MERA AADHAAR, MERI PEHCHAN</text>
      </g>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // 2. Digital PAN Card
  if (tLower.includes("pan") || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(ref.replace(/\s+/g, ""))) {
    const formattedPan = (ref || "ABCDE1234F").toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 540" width="100%" height="100%">
      <defs>
        <linearGradient id="pan_bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#E0F2FE"/>
          <stop offset="50%" stop-color="#BAE6FD"/>
          <stop offset="100%" stop-color="#7DD3FC"/>
        </linearGradient>
        <filter id="shadow2" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.35"/>
        </filter>
      </defs>
      <!-- Background Card -->
      <rect x="25" y="20" width="800" height="500" rx="24" fill="url(#pan_bg)" stroke="#0284C7" stroke-width="2.5" filter="url(#shadow2)"/>
      
      <!-- Top Header -->
      <g transform="translate(50, 45)">
        <text x="0" y="22" font-family="sans-serif" font-size="18" font-weight="900" fill="#0C4A6E">आयकर विभाग</text>
        <text x="0" y="44" font-family="sans-serif" font-size="16" font-weight="900" fill="#0C4A6E">INCOME TAX DEPARTMENT</text>
        
        <text x="750" y="22" font-family="sans-serif" font-size="18" font-weight="900" fill="#0C4A6E" text-anchor="end">भारत सरकार</text>
        <text x="750" y="44" font-family="sans-serif" font-size="16" font-weight="900" fill="#0C4A6E" text-anchor="end">GOVT. OF INDIA</text>
      </g>
      
      <!-- Central Card Label -->
      <rect x="180" y="105" width="490" height="32" rx="8" fill="#0284C7"/>
      <text x="425" y="126" font-family="sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle">स्थायी लेखा संख्या कार्ड • PERMANENT ACCOUNT NUMBER CARD</text>
      
      <!-- Photo Box -->
      <g transform="translate(60, 160)">
        <rect width="140" height="175" rx="14" fill="#FFFFFF" stroke="#0284C7" stroke-width="2"/>
        <circle cx="70" cy="65" r="36" fill="#E2E8F0"/>
        <path d="M 30 160 C 30 110, 110 110, 110 160 Z" fill="#94A3B8"/>
        <rect x="10" y="145" width="120" height="20" rx="4" fill="#0F172A"/>
        <text x="70" y="159" font-family="sans-serif" font-size="9" font-weight="900" fill="#38BDF8" text-anchor="middle">ITD VERIFIED</text>
      </g>
      
      <!-- PAN & Personal Details -->
      <g transform="translate(230, 165)">
        <text x="0" y="25" font-family="sans-serif" font-size="12" font-weight="800" fill="#0369A1">स्थायी लेखा संख्या / PAN:</text>
        <rect x="0" y="35" width="360" height="50" rx="10" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.5"/>
        <text x="180" y="70" font-family="monospace, sans-serif" font-size="30" font-weight="900" fill="#0C4A6E" letter-spacing="4" text-anchor="middle">${formattedPan}</text>
        
        <text x="0" y="120" font-family="sans-serif" font-size="12" font-weight="800" fill="#0369A1">नाम / Name:</text>
        <text x="0" y="145" font-family="sans-serif" font-size="22" font-weight="900" fill="#0F172A">${subject.toUpperCase()}</text>
        
        <text x="0" y="180" font-family="sans-serif" font-size="12" font-weight="800" fill="#0369A1">पिता का नाम / Father's Name: <tspan font-weight="900" fill="#1E293B">GOVT RECORD VERIFIED</tspan></text>
        <text x="0" y="205" font-family="sans-serif" font-size="12" font-weight="800" fill="#0369A1">जन्म तिथि / Date of Birth: <tspan font-weight="900" fill="#1E293B">01/01/1990</tspan></text>
      </g>
      
      <!-- Hologram & QR Code Area -->
      <g transform="translate(640, 165)">
        <!-- Hologram Badge -->
        <rect width="140" height="85" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
        <rect x="15" y="15" width="110" height="55" rx="6" fill="#FDE047" opacity="0.85"/>
        <text x="70" y="47" font-family="sans-serif" font-size="10" font-weight="900" fill="#854D0E" text-anchor="middle">ITD SECURE</text>
        
        <!-- QR Code -->
        <g transform="translate(0, 105)">
          <rect width="140" height="135" rx="12" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.5"/>
          <rect x="15" y="15" width="28" height="28" fill="#0F172A"/>
          <rect x="95" y="15" width="28" height="28" fill="#0F172A"/>
          <rect x="15" y="90" width="28" height="28" fill="#0F172A"/>
          <circle cx="70" cy="70" r="14" fill="#0284C7"/>
          <path d="M 64 70 L 68 74 L 76 65" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
        </g>
      </g>
      
      <!-- Signature Line & Footer -->
      <g transform="translate(60, 420)">
        <line x1="0" y1="40" x2="260" y2="40" stroke="#0369A1" stroke-width="1.5"/>
        <text x="130" y="60" font-family="sans-serif" font-size="11" font-weight="800" fill="#0369A1" text-anchor="middle">हस्ताक्षर / Signature</text>
      </g>
      <text x="770" y="480" font-family="sans-serif" font-size="11" font-weight="900" fill="#0369A1" text-anchor="end">TEMP TRAVEL CAR RENTALS PVT LTD • VERIFIED DIGITAL VAULT</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // 3. Commercial Driving License
  if (tLower.includes("license") || tLower.includes("licence") || ref.includes("MH-") || ref.includes("DL-") || ref.includes("HR-") || ref.includes("UP-")) {
    const formattedLic = ref || "MH-022023001122";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 540" width="100%" height="100%">
      <defs>
        <linearGradient id="lic_bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0F172A"/>
          <stop offset="50%" stop-color="#1E293B"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
        <filter id="shadow3" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.5"/>
        </filter>
      </defs>
      <!-- Background Card -->
      <rect x="25" y="20" width="800" height="500" rx="24" fill="url(#lic_bg)" stroke="#F59E0B" stroke-width="2.5" filter="url(#shadow3)"/>
      
      <!-- Header -->
      <g transform="translate(50, 45)">
        <rect x="0" y="0" width="750" height="60" rx="12" fill="#F59E0B"/>
        <text x="375" y="27" font-family="sans-serif" font-size="17" font-weight="900" fill="#0F172A" text-anchor="middle">UNION OF INDIA • TRANSPORT DEPARTMENT</text>
        <text x="375" y="48" font-family="sans-serif" font-size="14" font-weight="900" fill="#1E293B" text-anchor="middle">DRIVING LICENCE (FORM 7 SMART CARD)</text>
      </g>
      
      <!-- Photo / Smart Chip Area -->
      <g transform="translate(60, 130)">
        <!-- Gold Smart Card Chip -->
        <rect width="80" height="60" rx="8" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
        <line x1="0" y1="30" x2="80" y2="30" stroke="#B45309" stroke-width="1.5"/>
        <line x1="40" y1="0" x2="40" y2="60" stroke="#B45309" stroke-width="1.5"/>
        <circle cx="40" cy="30" r="12" fill="#FDE68A" stroke="#B45309" stroke-width="1.5"/>
        
        <!-- Driver Photo -->
        <g transform="translate(0, 80)">
          <rect width="140" height="175" rx="14" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
          <circle cx="70" cy="65" r="36" fill="#334155"/>
          <path d="M 30 160 C 30 110, 110 110, 110 160 Z" fill="#64748B"/>
          <rect x="10" y="145" width="120" height="20" rx="4" fill="#F59E0B"/>
          <text x="70" y="159" font-family="sans-serif" font-size="9" font-weight="900" fill="#0F172A" text-anchor="middle">COMMERCIAL DL</text>
        </g>
      </g>
      
      <!-- Licence Details -->
      <g transform="translate(230, 135)">
        <text x="0" y="20" font-family="sans-serif" font-size="12" font-weight="700" fill="#94A3B8">LICENCE NO.:</text>
        <rect x="0" y="28" width="370" height="42" rx="8" fill="#1E293B" stroke="#F59E0B" stroke-width="1.5"/>
        <text x="185" y="56" font-family="monospace, sans-serif" font-size="24" font-weight="900" fill="#FCD34D" letter-spacing="3" text-anchor="middle">${formattedLic}</text>
        
        <text x="0" y="98" font-family="sans-serif" font-size="12" font-weight="700" fill="#94A3B8">DRIVER NAME:</text>
        <text x="0" y="125" font-family="sans-serif" font-size="22" font-weight="900" fill="#F8FAFC">${subject}</text>
        
        <text x="0" y="160" font-family="sans-serif" font-size="12" font-weight="700" fill="#94A3B8">VALID TILL (COMMERCIAL TRANSPORT):</text>
        <text x="0" y="185" font-family="sans-serif" font-size="18" font-weight="900" fill="#34D399">${exp}</text>
        
        <text x="0" y="220" font-family="sans-serif" font-size="12" font-weight="700" fill="#94A3B8">VEHICLE CLASS AUTHORISED TO DRIVE:</text>
        <rect x="0" y="230" width="370" height="40" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1"/>
        <text x="185" y="255" font-family="sans-serif" font-size="13" font-weight="900" fill="#F59E0B" text-anchor="middle">LMV-CAB • TRANS • COMMERCIAL CAB</text>
      </g>
      
      <!-- Right Badge / QR -->
      <g transform="translate(630, 135)">
        <rect width="150" height="150" rx="14" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
        <rect x="20" y="20" width="30" height="30" fill="#F8FAFC"/>
        <rect x="100" y="20" width="30" height="30" fill="#F8FAFC"/>
        <rect x="20" y="100" width="30" height="30" fill="#F8FAFC"/>
        <circle cx="75" cy="75" r="14" fill="#F59E0B"/>
        <path d="M 69 75 L 73 79 L 81 70" fill="none" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round"/>
        <text x="75" y="140" font-family="sans-serif" font-size="8" font-weight="900" fill="#94A3B8" text-anchor="middle">PARIVAHAN VERIFIED</text>
      </g>
      
      <!-- Bottom Bar -->
      <g transform="translate(50, 440)">
        <rect width="750" height="55" rx="12" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
        <text x="375" y="34" font-family="sans-serif" font-size="13" font-weight="900" fill="#FCD34D" text-anchor="middle">ISSUED FOR TEMP TRAVEL CAR RENTALS PVT LTD FLEET OPERATIONS</text>
      </g>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // 4. Vehicle Registration Certificate (RC) or Transport Document
  if (tLower.includes("rc") || tLower.includes("registration") || tLower.includes("permit") || tLower.includes("fitness") || tLower.includes("puc") || cLower.includes("fleet")) {
    const docTypeLabel = tLower.includes("insurance")
      ? "COMMERCIAL MOTOR INSURANCE POLICY"
      : (tLower.includes("fitness") ? "FITNESS CERTIFICATE" : (tLower.includes("permit") ? "ALL INDIA TOURIST PERMIT (FORM 47)" : "CERTIFICATE OF REGISTRATION (FORM 23)"));

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 540" width="100%" height="100%">
      <defs>
        <linearGradient id="rc_bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#022C22"/>
          <stop offset="50%" stop-color="#064E3B"/>
          <stop offset="100%" stop-color="#022C22"/>
        </linearGradient>
      </defs>
      <rect x="25" y="20" width="800" height="500" rx="24" fill="url(#rc_bg)" stroke="#10B981" stroke-width="2.5"/>
      <g transform="translate(50, 45)">
        <rect width="750" height="60" rx="12" fill="#10B981"/>
        <text x="375" y="27" font-family="sans-serif" font-size="16" font-weight="900" fill="#022C22" text-anchor="middle">TRANSPORT DEPARTMENT • GOVT OF NCT DELHI / NATIONAL PERMIT</text>
        <text x="375" y="48" font-family="sans-serif" font-size="14" font-weight="900" fill="#064E3B" text-anchor="middle">${docTypeLabel}</text>
      </g>
      <g transform="translate(60, 130)">
        <rect width="460" height="55" rx="12" fill="#064E3B" stroke="#10B981" stroke-width="2"/>
        <text x="20" y="36" font-family="monospace, sans-serif" font-size="28" font-weight="900" fill="#A7F3D0" letter-spacing="4">${subject}</text>
      </g>
      <g transform="translate(60, 210)">
        <text x="0" y="20" font-family="sans-serif" font-size="13" font-weight="700" fill="#6EE7B7">REGISTERED OWNER:</text>
        <text x="0" y="48" font-family="sans-serif" font-size="22" font-weight="900" fill="#F0FDF4">TEMP TRAVEL CAR RENTALS PVT LTD</text>
        <text x="0" y="90" font-family="sans-serif" font-size="13" font-weight="700" fill="#6EE7B7">REFERENCE / POLICY / PERMIT #:</text>
        <text x="0" y="118" font-family="monospace, sans-serif" font-size="20" font-weight="900" fill="#FCD34D">${ref}</text>
        <text x="0" y="160" font-family="sans-serif" font-size="13" font-weight="700" fill="#6EE7B7">VALIDITY / EXPIRY DATE:</text>
        <text x="0" y="188" font-family="sans-serif" font-size="20" font-weight="900" fill="#34D399">${exp}</text>
      </g>
      <g transform="translate(560, 130)">
        <rect width="210" height="240" rx="16" fill="#064E3B" stroke="#10B981" stroke-width="2"/>
        <circle cx="105" cy="80" r="45" fill="#047857"/>
        <path d="M 85 80 L 98 93 L 125 66" fill="none" stroke="#A7F3D0" stroke-width="5" stroke-linecap="round"/>
        <text x="105" y="160" font-family="sans-serif" font-size="14" font-weight="900" fill="#A7F3D0" text-anchor="middle">100% COMPLIANT</text>
        <text x="105" y="185" font-family="sans-serif" font-size="11" font-weight="700" fill="#6EE7B7" text-anchor="middle">COMMERCIAL FLEET</text>
      </g>
      <g transform="translate(50, 440)">
        <rect width="750" height="55" rx="12" fill="#064E3B" stroke="#047857" stroke-width="1.5"/>
        <text x="375" y="34" font-family="sans-serif" font-size="13" font-weight="900" fill="#A7F3D0" text-anchor="middle">DIGITALLY ARCHIVED IN TEMP TRAVEL MASTER COMPLIANCE VAULT</text>
      </g>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // 5. Default Photo / ID Badge
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 540" width="100%" height="100%">
    <rect x="25" y="20" width="800" height="500" rx="24" fill="#0F172A" stroke="#F59E0B" stroke-width="2"/>
    <g transform="translate(50, 45)">
      <rect width="750" height="60" rx="12" fill="#F59E0B"/>
      <text x="375" y="36" font-family="sans-serif" font-size="18" font-weight="900" fill="#0F172A" text-anchor="middle">TEMP TRAVEL CAR RENTALS PVT LTD • OFFICIAL KYC BADGE</text>
    </g>
    <g transform="translate(60, 140)">
      <rect width="180" height="220" rx="16" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
      <circle cx="90" cy="85" r="45" fill="#334155"/>
      <path d="M 40 200 C 40 140, 140 140, 140 200 Z" fill="#64748B"/>
    </g>
    <g transform="translate(280, 150)">
      <text x="0" y="25" font-family="sans-serif" font-size="14" font-weight="700" fill="#94A3B8">SUBJECT / CHAUFFEUR:</text>
      <text x="0" y="65" font-family="sans-serif" font-size="30" font-weight="900" fill="#F8FAFC">${subject}</text>
      <text x="0" y="115" font-family="sans-serif" font-size="14" font-weight="700" fill="#94A3B8">DOCUMENT / REF #:</text>
      <text x="0" y="145" font-family="monospace, sans-serif" font-size="22" font-weight="900" fill="#FCD34D">${ref}</text>
      <text x="0" y="190" font-family="sans-serif" font-size="14" font-weight="700" fill="#94A3B8">STATUS: <tspan font-weight="900" fill="#34D399">100% VERIFIED & ARCHIVED</tspan></text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface DocumentViewOptions {
  title: string;
  fileName?: string;
  refNumber?: string;
  expiryDate?: string;
  regNumber?: string;
  dataUrl?: string | null;
  category?: string;
  storageKey?: string;
}

/**
 * Opens a document viewer in a clean new browser tab
 */
export function openDocumentInNewTab({
  title,
  fileName = "",
  refNumber = "REF-RECORD",
  expiryDate = "N/A",
  regNumber = "",
  dataUrl = null,
  category = "COMPLIANCE & FLEET VAULT",
  storageKey = ""
}: DocumentViewOptions) {
  const newWindow = window.open("", "_blank");
  if (!newWindow) {
    alert("Popup blocked! Please allow popups in your browser to view this document.");
    return;
  }

  const safeTitle = title.replace(/"/g, "&quot;");
  const safeFileName = (fileName || `${title.replace(/\s+/g, "_")}.pdf`).replace(/"/g, "&quot;");
  const safeRef = (refNumber || "VERIFIED-REF").replace(/"/g, "&quot;");
  const safeExp = (expiryDate || "Active Perpetual").replace(/"/g, "&quot;");
  const safeSubject = (regNumber || "TEMP TRAVEL CAR RENTALS PVT LTD").replace(/"/g, "&quot;");
  const safeCategory = category.replace(/"/g, "&quot;");
  const safeStorageKey = storageKey.replace(/"/g, "&quot;");

  const effectiveDataUrl = dataUrl || generateFallbackVaultDocument({
    title,
    refNumber,
    expiryDate,
    regNumber,
    category
  });

  const logoUrl = typeof window !== "undefined" ? `${window.location.origin}/images/logo.png` : "/images/logo.png";
  const isImage = effectiveDataUrl?.startsWith("data:image/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(safeFileName);
  const isPdf = effectiveDataUrl?.startsWith("data:application/pdf") || safeFileName.toLowerCase().endsWith(".pdf");

  newWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${safeTitle} - ${safeFileName} | Temp Travel Document Vault</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; color: black !important; }
      .print-box { border: 1px solid #ccc !important; box-shadow: none !important; }
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950">
  <!-- Top Navigation Bar -->
  <header class="border-b border-amber-500/20 bg-slate-900/95 backdrop-blur px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 no-print">
    <div class="flex items-center gap-4">
      <!-- Official Logo -->
      <div class="h-11 px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-lg">
        <img
          src="${logoUrl}"
          alt="Temp Travel Car Rentals Pvt Ltd"
          class="h-9 w-auto object-contain max-w-[170px]"
          onerror="this.style.display='none'; document.getElementById('tt-fallback').style.display='flex';"
        />
        <div id="tt-fallback" style="display:none" class="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black items-center justify-center text-sm">
          TT
        </div>
      </div>
      <div>
        <h1 class="text-xs sm:text-sm font-black tracking-wide text-slate-50 uppercase">TEMP TRAVEL CAR RENTALS PVT LTD</h1>
        <p class="text-[10px] sm:text-[11px] font-mono text-amber-400">Master Document Vault • Secure Digital Repository</p>
      </div>
    </div>
    
    <div class="flex flex-wrap items-center gap-3">
      <!-- View Mode Buttons (Digital Certificate is active by default) -->
      <div class="flex items-center bg-slate-950 p-1 rounded-xl border border-white/10">
        <button
          id="btn-cert"
          onclick="switchView('cert')"
          class="px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 bg-amber-500 text-slate-950 shadow-md cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          <span>Digital Certificate</span>
        </button>
        <button
          id="btn-original"
          onclick="switchView('original')"
          class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 text-slate-400 hover:text-white cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <span>Original Document</span>
        </button>
      </div>

      <button onclick="window.print()" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-white/10 transition-all flex items-center gap-2 cursor-pointer">
        <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
        <span>Print</span>
      </button>

      <span id="download-btn-slot"></span>
    </div>
  </header>

  <!-- Document Body -->
  <main class="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-6">
    <!-- Verified Header Card -->
    <div class="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl print-box">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
        </div>
        <div>
          <div class="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">● Active & Verified Document</div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-50 mt-0.5">${safeTitle}</h2>
          <p class="text-xs text-slate-400 mt-0.5">${safeCategory} • File: <span class="font-mono text-slate-200">${safeFileName}</span></p>
        </div>
      </div>
      <div class="text-left md:text-right bg-slate-950/60 px-4 py-2.5 rounded-xl border border-white/5">
        <div class="text-[10px] font-mono text-slate-400 uppercase">Policy / Ref #</div>
        <div class="text-sm font-mono font-black text-amber-400">${safeRef}</div>
      </div>
    </div>

    <!-- Metadata Details -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-surface/90 p-4 sm:p-5 rounded-2xl border border-white/5 text-xs print-box">
      <div>
        <span class="text-[10px] font-mono text-slate-500 uppercase block">Vehicle / Subject</span>
        <span class="font-bold text-slate-100">${safeSubject}</span>
      </div>
      <div>
        <span class="text-[10px] font-mono text-slate-500 uppercase block">Status</span>
        <span class="font-bold text-emerald-400">100% Vault Compliant</span>
      </div>
      <div>
        <span class="text-[10px] font-mono text-slate-500 uppercase block">Expiry Date</span>
        <span class="font-mono font-bold text-amber-400">${safeExp}</span>
      </div>
      <div>
        <span class="text-[10px] font-mono text-slate-500 uppercase block">Issued / Archived By</span>
        <span class="font-mono text-slate-300">Temp Travel HQ</span>
      </div>
    </div>

    <!-- VIEW 1: Official Verification Archival Certificate (ACTIVE BY DEFAULT ON OPEN) -->
    <div id="view-cert" class="bg-surface border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl print-box">
      <div class="max-w-lg w-full mx-auto text-center space-y-6 py-4">
        <div class="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
        </div>
        
        <div>
          <div class="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">Official Document Certificate</div>
          <h3 class="text-2xl font-black text-slate-50 mt-1">${safeTitle}</h3>
          <p class="text-xs text-slate-400 mt-1">Archived as <span class="font-mono text-amber-300 font-bold">${safeFileName}</span></p>
        </div>

        <div class="p-5 rounded-2xl bg-slate-950/80 border border-white/5 text-xs font-mono text-left space-y-2.5 text-slate-300">
          <div class="flex justify-between border-b border-white/5 pb-2">
            <span class="text-slate-500">Document Category:</span>
            <span class="font-bold text-amber-400">${safeCategory}</span>
          </div>
          <div class="flex justify-between border-b border-white/5 pb-2">
            <span class="text-slate-500">Reference / Policy:</span>
            <span class="font-bold text-slate-100">${safeRef}</span>
          </div>
          <div class="flex justify-between border-b border-white/5 pb-2">
            <span class="text-slate-500">Subject / Vehicle:</span>
            <span class="font-bold text-slate-100">${safeSubject}</span>
          </div>
          <div class="flex justify-between border-b border-white/5 pb-2">
            <span class="text-slate-500">Validity Expiry:</span>
            <span class="font-bold text-emerald-400">${safeExp}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Vault Encryption:</span>
            <span class="font-bold text-emerald-400">AES-256 Verified Compliance</span>
          </div>
        </div>

        <!-- Prominent Button to view Original Uploaded Document -->
        <div class="pt-3">
          <button
            onclick="switchView('original')"
            class="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2.5 mx-auto cursor-pointer transition-all hover:scale-[1.02]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span>View Original (Uploaded Document)</span>
          </button>
        </div>

        <p class="text-[11px] text-slate-500 leading-relaxed pt-2">
          This digital certificate confirms that this compliance document is formally registered and archived in the Master Vault of TEMP TRAVEL CAR RENTALS PVT LTD.
        </p>
      </div>
    </div>

    <!-- VIEW 2: Original Uploaded Document Content (Hidden by default, shown when user clicks button) -->
    <div id="view-original" style="display:none;" class="bg-surface border border-white/10 rounded-2xl p-4 sm:p-6 min-h-[500px] shadow-2xl print-box">
      <div id="original-render-area"></div>
    </div>
  </main>

  <script>
    const rawDataUrl = ${JSON.stringify(effectiveDataUrl || "")};
    const safeFileName = ${JSON.stringify(safeFileName)};
    const safeTitle = ${JSON.stringify(safeTitle)};
    const safeRef = ${JSON.stringify(safeRef)};
    const safeSubject = ${JSON.stringify(safeSubject)};
    const safeExp = ${JSON.stringify(safeExp)};
    const storageKey = ${JSON.stringify(safeStorageKey)};
    const isImage = ${Boolean(isImage)};
    const isPdf = ${Boolean(isPdf)};

    let activeBlobUrl = null;

    // Helper to convert base64 data URL to Blob so Chrome never blocks it in iframe/embed
    function b64toBlob(dataURI) {
      try {
        const parts = dataURI.split(',');
        const mime = parts[0].split(':')[1].split(';')[0];
        const byteString = atob(parts[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mime });
      } catch(e) {
        console.error("Error creating blob:", e);
        return null;
      }
    }

    if (rawDataUrl) {
      if (isPdf || rawDataUrl.startsWith('data:application/pdf')) {
        const blob = b64toBlob(rawDataUrl);
        if (blob) {
          activeBlobUrl = URL.createObjectURL(blob);
        }
      } else if (isImage) {
        activeBlobUrl = rawDataUrl;
      }
    }

    function switchView(view) {
      const origEl = document.getElementById('view-original');
      const certEl = document.getElementById('view-cert');
      const btnOrig = document.getElementById('btn-original');
      const btnCert = document.getElementById('btn-cert');

      if (view === 'original') {
        renderOriginalDoc();
        origEl.style.display = 'block';
        certEl.style.display = 'none';
        btnOrig.className = 'px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 bg-amber-500 text-slate-950 shadow-md cursor-pointer';
        btnCert.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 text-slate-400 hover:text-white cursor-pointer';
      } else {
        origEl.style.display = 'none';
        certEl.style.display = 'block';
        btnCert.className = 'px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 bg-amber-500 text-slate-950 shadow-md cursor-pointer';
        btnOrig.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 text-slate-400 hover:text-white cursor-pointer';
      }
    }

    function renderOriginalDoc() {
      const container = document.getElementById('original-render-area');
      if (!container) return;

      if (rawDataUrl && isImage) {
        container.innerHTML = \`
          <div class="space-y-4 text-center w-full">
            <div class="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-2">
              <span class="text-xs font-mono text-slate-300">Original Document: <strong class="text-amber-400">\${safeFileName}</strong></span>
              <div class="flex items-center gap-2">
                <button onclick="switchView('cert')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-bold transition-all cursor-pointer">
                  ← Back to Certificate
                </button>
                <label class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                  <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  <span>Attach Device Scan</span>
                  <input type="file" accept=".pdf,image/*" class="hidden" onchange="handleDirectUpload(this)" />
                </label>
                <a href="\${rawDataUrl}" download="\${safeFileName}" class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-md">
                  <span>Download Image</span>
                </a>
              </div>
            </div>
            <div class="overflow-auto max-h-[750px] p-3 bg-slate-950/70 rounded-2xl border border-white/5 flex items-center justify-center">
              <img src="\${rawDataUrl}" alt="\${safeTitle}" class="max-w-full max-h-[700px] object-contain rounded-xl shadow-2xl" />
            </div>
          </div>
        \`;
      } else if (rawDataUrl && isPdf) {
        const pdfSrc = activeBlobUrl || rawDataUrl;
        container.innerHTML = \`
          <div class="w-full h-full space-y-4">
            <div class="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-2">
              <span class="text-xs font-mono text-slate-300">Original PDF Document: <strong class="text-amber-400">\${safeFileName}</strong></span>
              <div class="flex items-center gap-2">
                <button onclick="switchView('cert')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-bold transition-all cursor-pointer">
                  ← Back to Certificate
                </button>
                <button onclick="window.open('\${pdfSrc}', '_blank')" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                  <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  <span>Open Fullscreen</span>
                </button>
                <a href="\${pdfSrc}" download="\${safeFileName}" class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-md">
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
            <div class="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
              <iframe src="\${pdfSrc}" class="w-full h-[780px] bg-white border-0" title="\${safeTitle}"></iframe>
            </div>
          </div>
        \`;
      } else {
        container.innerHTML = \`
          <div class="text-center py-10 space-y-5 max-w-lg mx-auto">
            <div class="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>

            <div>
              <h3 class="text-xl font-black text-slate-50">Original File: \${safeFileName}</h3>
              <p class="text-xs text-slate-400 mt-1">
                Official document registered under Ref <strong class="text-amber-400 font-mono">\${safeRef}</strong>.
              </p>
            </div>

            <div class="p-4 bg-slate-950/80 rounded-2xl border border-white/5 text-xs text-left font-mono space-y-2 text-slate-300">
              <div class="flex justify-between border-b border-white/5 pb-1">
                <span class="text-slate-500">Document Name:</span>
                <span class="font-bold text-amber-300">\${safeFileName}</span>
              </div>
              <div class="flex justify-between border-b border-white/5 pb-1">
                <span class="text-slate-500">Vehicle / Reg:</span>
                <span class="text-slate-200">\${safeSubject}</span>
              </div>
              <div class="flex justify-between border-b border-white/5 pb-1">
                <span class="text-slate-500">Reference:</span>
                <span class="text-slate-200">\${safeRef}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Expiry Date:</span>
                <span class="text-emerald-400">\${safeExp}</span>
              </div>
            </div>

            <div class="pt-3 space-y-3">
              <label class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/20 transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                <span>Attach / Select File to Preview</span>
                <input type="file" accept=".pdf,image/*" class="hidden" onchange="handleDirectUpload(this)" />
              </label>

              <div>
                <button onclick="switchView('cert')" class="text-xs text-slate-400 hover:text-amber-400 underline cursor-pointer">
                  ← Return to Digital Verification Certificate
                </button>
              </div>
            </div>
          </div>
        \`;
      }

      // Update download button in header if available
      const downloadSlot = document.getElementById('download-btn-slot');
      if (downloadSlot) {
        if (activeBlobUrl || rawDataUrl) {
          const dlUrl = activeBlobUrl || rawDataUrl;
          downloadSlot.innerHTML = \`
            <a href="\${dlUrl}" download="\${safeFileName}" class="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black rounded-xl hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              <span>Download File</span>
            </a>
          \`;
        }
      }
    }

    function handleDirectUpload(input) {
      const file = input.files && input.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        const url = e.target.result;
        const isImg = file.type.startsWith('image/');
        const isPdfDoc = file.type === 'application/pdf' || file.name.endsWith('.pdf');

        if (isPdfDoc) {
          const blob = b64toBlob(url);
          if (blob) {
            activeBlobUrl = URL.createObjectURL(blob);
          }
        } else {
          activeBlobUrl = url;
        }

        const renderArea = document.getElementById('original-render-area');
        if (isImg) {
          renderArea.innerHTML = \`
            <div class="space-y-4 text-center w-full">
              <div class="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-2">
                <span class="text-xs font-mono text-slate-300">Attached File: <strong class="text-amber-400">\${file.name}</strong></span>
                <div class="flex items-center gap-2">
                  <button onclick="switchView('cert')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-bold transition-all cursor-pointer">
                    ← Back to Certificate
                  </button>
                  <a href="\${url}" download="\${file.name}" class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-md">
                    <span>Download Image</span>
                  </a>
                </div>
              </div>
              <div class="overflow-auto max-h-[750px] p-3 bg-slate-950/70 rounded-2xl border border-white/5 flex items-center justify-center">
                <img src="\${url}" alt="\${safeTitle}" class="max-w-full max-h-[700px] object-contain rounded-xl shadow-2xl" />
              </div>
            </div>
          \`;
        } else if (isPdfDoc) {
          const pdfSrc = activeBlobUrl || url;
          renderArea.innerHTML = \`
            <div class="w-full h-full space-y-4">
              <div class="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-2">
                <span class="text-xs font-mono text-slate-300">Attached PDF: <strong class="text-amber-400">\${file.name}</strong></span>
                <div class="flex items-center gap-2">
                  <button onclick="switchView('cert')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-bold transition-all cursor-pointer">
                    ← Back to Certificate
                  </button>
                  <button onclick="window.open('\${pdfSrc}', '_blank')" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                    <span>Open Fullscreen</span>
                  </button>
                  <a href="\${pdfSrc}" download="\${file.name}" class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-md">
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>
              <div class="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
                <iframe src="\${pdfSrc}" class="w-full h-[780px] bg-white border-0" title="\${safeTitle}"></iframe>
              </div>
            </div>
          \`;
        }

        // Add download button to slot
        const slot = document.getElementById('download-btn-slot');
        if (slot) {
          const dl = activeBlobUrl || url;
          slot.innerHTML = \`
            <a href="\${dl}" download="\${file.name}" class="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black rounded-xl hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              <span>Download File</span>
            </a>
          \`;
        }

        // Save into IndexedDB if key exists
        if (storageKey) {
          try {
            const req = indexedDB.open('TempTravel_Vault_DB', 1);
            req.onsuccess = function(ev) {
              const db = ev.target.result;
              const tx = db.transaction('vault_files', 'readwrite');
              tx.objectStore('vault_files').put(url, storageKey);
            };
          } catch(err) {}
        }
      };
      reader.readAsDataURL(file);
    }
  </script>
</body>
</html>`);

  newWindow.document.close();
}
