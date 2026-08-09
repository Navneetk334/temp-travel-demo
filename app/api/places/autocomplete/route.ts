import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (q.trim().length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const query = q.trim();
  const suggestions: string[] = [];

  // Always offer the exact typed location as an option
  suggestions.push(query);

  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  let hasGoogleResults = false;

  // 1. Google Places Autocomplete API (Highest Accuracy for shops, buildings & local corners in India)
  if (googleApiKey && googleApiKey !== "AIzaSyBFu4RlB5ontZR997X45chVlauhB_i9sSI") {
    try {
      const googleRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:in&key=${googleApiKey}`
      );
      if (googleRes.ok) {
        const data = await googleRes.json();
        if (data.predictions && Array.isArray(data.predictions) && data.predictions.length > 0) {
          hasGoogleResults = true;
          for (const p of data.predictions) {
            if (p.description && !suggestions.includes(p.description)) {
              suggestions.push(p.description);
            }
          }
        } else if (data.error_message) {
          console.warn("Google Places API warning:", data.error_message);
        }
      }
    } catch (err) {
      console.error("Google Places API fetch error:", err);
    }
  }

  // 2. Photon API (OpenStreetMap POI database for India) - Fallback if Google has < 3 results
  if (!hasGoogleResults || suggestions.length < 4) {
    try {
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
  }

  return NextResponse.json({ suggestions: suggestions.slice(0, 8) });
}
