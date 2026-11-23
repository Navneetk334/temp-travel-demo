/**
 * Helper utilities for opening and downloading media (images, PDFs)
 * especially handling base64 data URLs without triggering browser
 * security blocks for top-level navigation.
 */

export function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mimeType });
  } catch (err) {
    console.error("Failed to convert dataUrl to Blob:", err);
    return null;
  }
}

/**
 * Safely opens an image or PDF in a new browser tab.
 * If given a data URL, converts it to a blob URL to prevent
 * modern browsers from blocking top-level data URL navigation (Untitled blank tab).
 */
export function openMediaInNewTab(url: string, filename: string = "document"): void {
  if (typeof window === "undefined" || !url) return;

  if (url.startsWith("data:")) {
    const blob = dataUrlToBlob(url);
    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      const newWin = window.open(blobUrl, "_blank", "noopener,noreferrer");
      if (newWin) {
        newWin.focus();
        // Revoke object URL after tab has loaded
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      } else {
        // In case popup blocker intercepted window.open
        const a = document.createElement("a");
        a.href = blobUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      }
      return;
    }
  }

  // Regular HTTP/HTTPS URL or blob URL
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Downloads a media file with a given filename.
 */
export function downloadMedia(url: string, filename: string): void {
  if (typeof window === "undefined" || !url) return;

  let downloadUrl = url;
  let isBlob = false;

  if (url.startsWith("data:")) {
    const blob = dataUrlToBlob(url);
    if (blob) {
      downloadUrl = URL.createObjectURL(blob);
      isBlob = true;
    }
  }

  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = filename || "attachment";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  if (isBlob) {
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 30000);
  }
}
