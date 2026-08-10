import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng coordinates" }, { status: 400 });
  }

  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // 1. Try Google Geocoding API if key is available
  if (googleApiKey && !googleApiKey.includes("placeholder")) {
    try {
      const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`;
      const gRes = await fetch(gUrl, { cache: "no-store" });
      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData.status === "OK" && gData.results && gData.results.length > 0) {
          const address = gData.results[0].formatted_address;
          return NextResponse.json({ address });
        }
      }
    } catch (err) {
      console.error("[Google Reverse Geocode Exception]:", err);
    }
  }

  // 2. Fallback to OpenStreetMap Nominatim Reverse Geocoding
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const nomRes = await fetch(nomUrl, {
      headers: { "User-Agent": "TempTravelCarRentals/1.0 (info@temptravels.com)" },
      cache: "no-store",
    });
    if (nomRes.ok) {
      const nomData = await nomRes.json();
      if (nomData.display_name) {
        const parts = nomData.display_name.split(", ");
        // Format clean address
        const cleanAddress = parts.slice(0, 5).join(", ");
        return NextResponse.json({ address: cleanAddress });
      }
    }
  } catch (err) {
    console.error("[Nominatim Reverse Geocode Exception]:", err);
  }

  return NextResponse.json({ address: `Location (${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)})` });
}
