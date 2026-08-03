import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (q.trim().length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const query = q.trim();
  const suggestions: string[] = [];

  try {
    // 1. Fetch from Photon API (OpenStreetMap + Google Places dataset, highly accurate for Indian streets, societies & landmarks)
    const photonRes = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&bbox=68.0,6.0,97.0,37.0`,
      { headers: { "User-Agent": "TempTravelCarRentals/1.0" }, cache: "no-store" }
    );

    if (photonRes.ok) {
      const data = await photonRes.json();
      if (data.features && Array.isArray(data.features)) {
        for (const feature of data.features) {
          const props = feature.properties;
          const name = props.name || props.street || props.district || props.city;
          if (!name) continue;

          const parts: string[] = [];
          if (props.name) parts.push(props.name);
          if (props.street && props.street !== props.name) parts.push(props.street);
          if (props.housenumber) parts.push(`No. ${props.housenumber}`);
          if (props.suburb || props.district) parts.push(props.suburb || props.district);
          if (props.city && props.city !== props.name) parts.push(props.city);
          if (props.state) parts.push(props.state);

          const formatted = Array.from(new Set(parts)).join(", ");
          if (formatted && !suggestions.includes(formatted)) {
            suggestions.push(formatted);
          }
        }
      }
    }
  } catch (err) {
    console.error("Photon Places API error:", err);
  }

  // 2. Fallback to Nominatim if Photon yields < 3 results
  if (suggestions.length < 3) {
    try {
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=6&addressdetails=1`,
        { headers: { "User-Agent": "TempTravelCarRentals/1.0 (info@temptravels.com)" }, cache: "no-store" }
      );
      if (nomRes.ok) {
        const nomData = await nomRes.json();
        for (const item of nomData) {
          const parts = item.display_name.split(", ");
          const formatted = parts.slice(0, 4).join(", ");
          if (formatted && !suggestions.includes(formatted)) {
            suggestions.push(formatted);
          }
        }
      }
    } catch (err) {
      console.error("Nominatim Places API error:", err);
    }
  }

  return NextResponse.json({ suggestions: suggestions.slice(0, 7) });
}
