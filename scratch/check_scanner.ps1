# Find all WIA Scanners and details
try {
    $wia = New-Object -ComObject WIA.DeviceManager
    Write-Output "WIA DeviceManager created successfully."
    Write-Output "Device Count: $($wia.DeviceInfos.Count)"
    for ($i = 1; $i -le $wia.DeviceInfos.Count; $i++) {
        $dev = $wia.DeviceInfos.Item($i)
        Write-Output "Scanner [$i]: ID=$($dev.DeviceID), Type=$($dev.Type)"
        foreach ($prop in $dev.Properties) {
            Write-Output "   $($prop.Name) = $($prop.Value)"
        }
    }
} catch {
    Write-Output "WIA Error: $($_.Exception.Message)"
}

# Check Network IP neighbors
Write-Output "`n--- ARP / Network IP Table ---"
Get-NetNeighbor -AddressFamily IPv4 | Where-Object State -ne 'Unreachable' | Select-Object IPAddress, LinkLayerAddress, State | Format-Table
