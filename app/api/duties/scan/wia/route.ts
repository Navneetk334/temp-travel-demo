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

    const psScriptPath = path.join(tempDir, `scan_runner_${Date.now()}.ps1`);
    
    // PowerShell WIA Automation Script
    const psScriptContent = `
try {
    $wia = New-Object -ComObject WIA.DeviceManager
    if ($wia.DeviceInfos.Count -eq 0) {
        Write-Output "ERROR: No WIA scanner devices detected."
        exit 1
    }

    # Connect to first scanner or matching HP device
    $deviceIndex = 1
    for ($i = 1; $i -le $wia.DeviceInfos.Count; $i++) {
        $devName = $wia.DeviceInfos.Item($i).Properties['Name'].Value
        if ($devName -like "*Smart Tank*" -or $devName -like "*HP*") {
            $deviceIndex = $i
            break
        }
    }

    $device = $wia.DeviceInfos.Item($deviceIndex).Connect()
    $item = $device.Items.Item(1)

    # WIA Format JPEG GUID
    $wiaFormatJPEG = "{B96B3CAE-0728-11D3-9D7B-0000F81EF32E}"
    $image = $item.Transfer($wiaFormatJPEG)

    if ($image) {
        $targetFile = "${outputPath.replace(/\\/g, "\\\\")}"
        if (Test-Path $targetFile) { Remove-Item $targetFile -Force }
        $image.SaveFile($targetFile)
        Write-Output "SUCCESS"
        exit 0
    } else {
        Write-Output "ERROR: No image acquired from scanner glass."
        exit 1
    }
} catch {
    Write-Output "ERROR: $($_.Exception.Message)"
    exit 1
}
`;

    try {
      fs.writeFileSync(psScriptPath, psScriptContent, "utf-8");
      
      const { stdout, stderr } = await execAsync(
        `powershell -NoProfile -ExecutionPolicy Bypass -File "${psScriptPath}"`,
        { timeout: 35000 }
      );

      if (fs.existsSync(psScriptPath)) {
        fs.unlinkSync(psScriptPath);
      }

      if (stdout.includes("SUCCESS") && fs.existsSync(outputPath)) {
        const fileBuffer = fs.readFileSync(outputPath);
        const base64 = `data:image/jpeg;base64,${fileBuffer.toString("base64")}`;

        return NextResponse.json({
          success: true,
          source: "PHYSICAL_HP_SCANNER",
          message: `Successfully acquired physical scan from ${deviceName || "HP Smart Tank 750"}`,
          imageUrl: publicUrl,
          imageBase64: base64,
          fileName: outputFileName,
        });
      } else {
        console.warn("Scan stdout:", stdout, stderr);
      }
    } catch (execErr: any) {
      console.error("WIA execution error:", execErr);
      if (fs.existsSync(psScriptPath)) {
        fs.unlinkSync(psScriptPath);
      }
    }

    // If physical scan had an issue
    return NextResponse.json({
      success: false,
      source: "HARDWARE_NOT_READY",
      message: `Could not complete scan from '${deviceName || "HP Smart Tank 750"}'. Please check if paper is placed on the scanner glass bed and the scanner lid is closed.`,
      fallbackUrl: null,
    });

  } catch (error) {
    console.error("POST /api/duties/scan/wia error:", error);
    return NextResponse.json({ error: "Failed to execute physical hardware scan" }, { status: 500 });
  }
}
