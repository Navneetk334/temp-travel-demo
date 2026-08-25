import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceName, dpi = 300, colorMode = "Color" } = body;

    const tempDir = path.join(process.cwd(), "public", "uploads", "scans");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const outputFileName = `scan_${Date.now()}.jpg`;
    const outputPath = path.join(tempDir, outputFileName);
    const publicUrl = `/uploads/scans/${outputFileName}`;

    let scanSucceeded = false;
    let errorMessage = "";

    // 1. Attempt Physical Windows WIA Scanner Acquisition
    if (process.platform === "win32") {
      const psScriptPath = path.join(tempDir, `scan_cmd_${Date.now()}.ps1`);
      
      const psScriptContent = `
try {
    $deviceManager = New-Object -ComObject WIA.DeviceManager
    $deviceInfo = $null

    if ($deviceManager.DeviceInfos.Count -gt 0) {
        # Select first available scanner or matching device
        $deviceInfo = $deviceManager.DeviceInfos.Item(1)
        $device = $deviceInfo.Connect()
        $item = $device.Items.Item(1)
        
        # Format: 1=Color, 2=Grayscale, 4=B&W
        # DPI resolution property (6147)
        try {
            $propDpi = $item.Properties.Item("6147")
            if ($propDpi) { $propDpi.Value = ${dpi} }
        } catch {}

        $image = $item.Transfer()
        if ($image) {
            $image.SaveFile("${outputPath.replace(/\\/g, "\\\\")}")
            Write-Output "SUCCESS"
            exit 0
        }
    } else {
        Write-Output "NO_WIA_SCANNER_DETECTED"
    }
} catch {
    Write-Output "ERROR: $($_.Exception.Message)"
}
`;

      try {
        fs.writeFileSync(psScriptPath, psScriptContent, "utf-8");
        const { stdout } = await execAsync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${psScriptPath}"`, {
          timeout: 15000,
        });

        if (fs.existsSync(psScriptPath)) {
          fs.unlinkSync(psScriptPath);
        }

        if (stdout.includes("SUCCESS") && fs.existsSync(outputPath)) {
          scanSucceeded = true;
        } else {
          errorMessage = stdout.trim();
        }
      } catch (err: any) {
        console.warn("WIA scan execution notification:", err.message);
        errorMessage = err.message;
      }
    }

    if (scanSucceeded && fs.existsSync(outputPath)) {
      const fileBuffer = fs.readFileSync(outputPath);
      const base64 = `data:image/jpeg;base64,${fileBuffer.toString("base64")}`;

      return NextResponse.json({
        success: true,
        source: "PHYSICAL_WIA_SCANNER",
        message: `Acquired physical scan from ${deviceName || "installed scanner"}`,
        imageUrl: publicUrl,
        imageBase64: base64,
        fileName: outputFileName,
      });
    }

    // 2. Fallback: If physical scanner is offline / not on feeder, return clear device status and guidance
    return NextResponse.json({
      success: false,
      source: "HARDWARE_NOT_READY",
      message: errorMessage || `Physical scanner device '${deviceName || "HP Smart Tank 750"}' is currently offline, in sleep mode, or no paper was loaded on the flatbed.`,
      fallbackUrl: null,
      deviceName,
    });

  } catch (error) {
    console.error("POST /api/duties/scan/wia error:", error);
    return NextResponse.json({ error: "Failed to execute physical hardware scan" }, { status: 500 });
  }
}
