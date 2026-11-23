/**
 * Pure client-side helper to print only a specific document element (e.g. duty slip, receipt)
 * without printing modal overlays, scrollbars, action buttons, or application sidebars/headers.
 */
export function printElementById(elementId: string, docTitle?: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const targetEl = document.getElementById(elementId);
  if (!targetEl) {
    console.error(`Print element not found: #${elementId}`);
    window.print();
    return;
  }

  // Remove any previously injected print iframe
  const existingIframe = document.getElementById("temp-travel-print-iframe");
  if (existingIframe && document.body.contains(existingIframe)) {
    document.body.removeChild(existingIframe);
  }

  // Create an isolated hidden iframe
  const iframe = document.createElement("iframe");
  iframe.id = "temp-travel-print-iframe";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    window.print();
    return;
  }

  // Extract all stylesheets and style blocks from the parent document
  const headStyles: string[] = [];
  document.querySelectorAll("link[rel='stylesheet']").forEach((link) => {
    headStyles.push(link.outerHTML);
  });
  document.querySelectorAll("style").forEach((style) => {
    headStyles.push(style.outerHTML);
  });

  const dedicatedPrintStyles = `
    <style>
      @page {
        size: A4 portrait;
        margin: 8mm 10mm;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
        box-sizing: border-box !important;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #0f172a !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
      }
      #print-container {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
      }
      #print-container > div {
        border: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        padding: 4px !important;
      }
      table {
        border-collapse: collapse !important;
        width: 100% !important;
      }
      th, td {
        border-color: #64748b !important;
      }
      .no-print, button, input, [role="button"] {
        display: none !important;
      }
    </style>
  `;

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${docTitle || "Duty Slip - Temp Travel Car Rentals Pvt. Ltd."}</title>
        ${headStyles.join("\n")}
        ${dedicatedPrintStyles}
      </head>
      <body>
        <div id="print-container">
          ${targetEl.outerHTML}
        </div>
      </body>
    </html>
  `);
  iframeDoc.close();

  // Allow styles, fonts, and inline assets to settle before triggering print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error("Iframe print error:", err);
      window.print();
    } finally {
      // Clean up iframe after print dialog completes
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }
  }, 350);
}
