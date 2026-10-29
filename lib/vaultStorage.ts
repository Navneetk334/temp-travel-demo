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

  const logoUrl = typeof window !== "undefined" ? `${window.location.origin}/images/logo.png` : "/images/logo.png";
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
    const rawDataUrl = ${JSON.stringify(dataUrl || "")};
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
