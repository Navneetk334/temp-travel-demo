import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scannerIp, protocol = "eSCL", dpi = 300, colorMode = "Color" } = body;

    if (!scannerIp) {
      return NextResponse.json({ error: "Scanner IP or Hostname is required" }, { status: 400 });
    }

    const cleanIp = scannerIp.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

    // 1. Check if scanner is reachable via standard eSCL / AirScan / WIA localhost agent
    const targetUrl = scannerIp.startsWith("http") 
      ? scannerIp 
      : `http://${cleanIp}:${cleanIp.includes(":") ? "" : "80/eSCL/ScanJobs"}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      // Attempt real connection to eSCL / Localhost Scanner REST Daemon
      const scanResponse = await fetch(targetUrl, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "Accept": "image/jpeg, application/pdf, application/xml, text/xml",
        }
      });
      clearTimeout(timeoutId);

      if (scanResponse.ok) {
        const contentType = scanResponse.headers.get("content-type") || "";
        
        if (contentType.includes("image/")) {
          const arrayBuffer = await scanResponse.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");
          const mimeType = contentType.includes("png") ? "image/png" : "image/jpeg";
          const dataUrl = `data:${mimeType};base64,${base64}`;

          return NextResponse.json({
            success: true,
            status: "CONNECTED_AND_SCANNED",
            message: `Successfully acquired raw scan from physical device ${cleanIp}`,
            imageDataUrl: dataUrl,
            deviceInfo: {
              ip: cleanIp,
              protocol,
              dpi,
              colorMode,
            }
          });
        }
      }
    } catch (netErr) {
      // Network scanner might be offline or requiring local subnet connection
      console.log(`Network scanner probe at ${targetUrl} timed out or blocked by CORS/LAN.`);
    }

    // Return detailed device probe feedback
    return NextResponse.json({
      success: false,
      status: "SCANNER_OFFLINE_OR_UNREACHABLE",
      message: `Could not establish direct TCP connection to printer scanner at ${cleanIp}. Ensure the printer is powered on, connected to the same LAN/Wi-Fi subnet, and has eSCL/AirScan or WebScan enabled in its embedded web server.`,
      targetUrl,
      suggestion: "You can also use Live USB Document Camera mode or Upload File from Device.",
    }, { status: 200 });

  } catch (error) {
    console.error("POST /api/duties/scan/network error:", error);
    return NextResponse.json({ error: "Failed to execute network scanner command" }, { status: 500 });
  }
}
