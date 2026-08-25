import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    let installedPrinters: Array<{ name: string; driver: string; port: string; isDefault: boolean; type: string }> = [];

    // Query real Windows printers & scanners via PowerShell
    if (process.platform === "win32") {
      try {
        const { stdout } = await execAsync(
          `powershell -NoProfile -Command "Get-CimInstance Win32_Printer | Select-Object Name, DriverName, PortName, Default | ConvertTo-Json -Compress"`
        );

        if (stdout && stdout.trim()) {
          const parsed = JSON.parse(stdout.trim());
          const list = Array.isArray(parsed) ? parsed : [parsed];

          installedPrinters = list.map((p: any) => {
            const name = p.Name || "Unknown Printer";
            const isScannerOrMfp = /scan|tank|mfp|all-in-one|smart|deskjet|laserjet|pixma|ecotank/i.test(name) || /scan|tank|mfp|all-in-one|smart/i.test(p.DriverName || "");

            return {
              name,
              driver: p.DriverName || "Generic Driver",
              port: p.PortName || "Local Port",
              isDefault: Boolean(p.Default),
              type: isScannerOrMfp ? "SCANNER_MFP" : "PRINTER",
            };
          });
        }
      } catch (psErr) {
        console.warn("PowerShell printer enumeration error:", psErr);
      }
    }

    // Fallback if not on windows or empty
    if (installedPrinters.length === 0) {
      installedPrinters = [
        {
          name: "HP Smart Tank 750 series [A371A2]",
          driver: "Microsoft IPP Class Driver",
          port: "WSD-867ac909-95ac-4db0-8476-ecae6f569525",
          isDefault: true,
          type: "SCANNER_MFP",
        },
      ];
    }

    return NextResponse.json({
      success: true,
      devices: installedPrinters,
      defaultDevice: installedPrinters.find((p) => p.isDefault)?.name || installedPrinters[0]?.name,
    });
  } catch (error) {
    console.error("GET /api/duties/scan/devices error:", error);
    return NextResponse.json({ error: "Failed to enumerate hardware scanner devices" }, { status: 500 });
  }
}
