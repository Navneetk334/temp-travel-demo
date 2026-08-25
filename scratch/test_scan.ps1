param(
    [string]$OutputPath = "public/uploads/scans/real_scan.jpg",
    [int]$DeviceIndex = 1
)

try {
    $wia = New-Object -ComObject WIA.DeviceManager
    if ($wia.DeviceInfos.Count -eq 0) {
        Write-Output "ERROR: No WIA scanner devices found."
        exit 1
    }

    Write-Output "Connecting to WIA Scanner #$DeviceIndex ($($wia.DeviceInfos.Item($DeviceIndex).Properties['Name'].Value))..."
    $device = $wia.DeviceInfos.Item($DeviceIndex).Connect()
    
    Write-Output "Acquiring item from scanner..."
    $item = $device.Items.Item(1)

    # Trigger scan
    $wiaFormatJPEG = "{B96B3CAE-0728-11D3-9D7B-0000F81EF32E}"
    Write-Output "Transferring image..."
    $image = $item.Transfer($wiaFormatJPEG)

    if ($image) {
        # Ensure output directory exists
        $dir = [System.IO.Path]::GetDirectoryName((Resolve-Path .).Path + "\" + $OutputPath)
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        
        $fullPath = (Resolve-Path .).Path + "\" + $OutputPath
        if (Test-Path $fullPath) {
            Remove-Item $fullPath -Force
        }
        $image.SaveFile($fullPath)
        Write-Output "SUCCESS: Scanned image saved to $fullPath"
        exit 0
    } else {
        Write-Output "ERROR: No image returned from scanner."
        exit 1
    }
} catch {
    Write-Output "ERROR: $($_.Exception.Message)"
    exit 1
}
