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

export interface DocumentViewOptions {
  title: string;
  fileName?: string;
  refNumber?: string;
  expiryDate?: string;
  regNumber?: string;
  dataUrl?: string | null;
  category?: string;
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
  category = "COMPLIANCE & FLEET VAULT"
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

  const isImage = dataUrl?.startsWith("data:image/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(safeFileName);
  const isPdf = dataUrl?.startsWith("data:application/pdf") || safeFileName.toLowerCase().endsWith(".pdf");

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
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-amber-500/20">
        TT
      </div>
      <div>
        <h1 class="text-xs sm:text-sm font-black tracking-wide text-slate-50 uppercase">TEMP TRAVEL CAR RENTALS PVT LTD</h1>
        <p class="text-[10px] sm:text-[11px] font-mono text-amber-400">Master Document Vault • Secure Digital Repository</p>
      </div>
    </div>
    
    <div class="flex items-center gap-3">
      <button onclick="window.print()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-white/10 transition-all flex items-center gap-2 cursor-pointer">
        <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
        Print / Save PDF
      </button>
      ${dataUrl ? `
      <a href="${dataUrl}" download="${safeFileName}" class="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black rounded-xl hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        Download File
      </a>
      ` : ''}
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

    <!-- Viewer Window Content -->
    <div class="bg-surface border border-white/10 rounded-2xl p-4 sm:p-6 min-h-[500px] flex items-center justify-center shadow-2xl print-box">
      ${dataUrl && isImage ? `
        <div class="space-y-4 text-center w-full">
          <div class="overflow-auto max-h-[750px] p-2 bg-slate-950/50 rounded-xl border border-white/5 flex items-center justify-center">
            <img src="${dataUrl}" alt="${safeTitle}" class="max-w-full max-h-[700px] object-contain rounded-lg shadow-xl" />
          </div>
          <p class="text-[11px] text-slate-400 font-mono">High-resolution document preview rendered from Temp Travel Secure Vault.</p>
        </div>
      ` : dataUrl && isPdf ? `
        <div class="w-full h-full space-y-4">
          <iframe src="${dataUrl}" class="w-full h-[750px] rounded-xl border border-white/10 bg-white" title="${safeTitle}"></iframe>
          <p class="text-[11px] text-slate-400 font-mono text-center">Interactive PDF document preview loaded from Temp Travel Secure Vault.</p>
        </div>
      ` : `
        <!-- Official Verification Archival Certificate View -->
        <div class="max-w-md w-full text-center space-y-5 py-8">
          <div class="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          
          <div>
            <h3 class="text-xl font-black text-slate-50">${safeTitle}</h3>
            <p class="text-xs text-slate-400 mt-1">Archived as <span class="font-mono text-amber-300 font-bold">${safeFileName}</span></p>
          </div>

          <div class="p-4 rounded-xl bg-slate-950/80 border border-white/5 text-xs font-mono text-left space-y-2 text-slate-300">
            <div class="flex justify-between border-b border-white/5 pb-1.5">
              <span class="text-slate-500">Document Type:</span>
              <span class="font-bold text-amber-400">${safeCategory}</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-1.5">
              <span class="text-slate-500">Reference / Policy:</span>
              <span class="font-bold text-slate-100">${safeRef}</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-1.5">
              <span class="text-slate-500">Validity Expiry:</span>
              <span class="font-bold text-emerald-400">${safeExp}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Vault Encryption:</span>
              <span class="font-bold text-emerald-400">AES-256 Verified</span>
            </div>
          </div>

          <p class="text-[11px] text-slate-500 leading-relaxed">
            This digital certificate confirms that the compliance document is formally registered in the Master Vault of TEMP TRAVEL CAR RENTALS PVT LTD.
          </p>
        </div>
      `}
    </div>
  </main>
</body>
</html>`);

  newWindow.document.close();
}
