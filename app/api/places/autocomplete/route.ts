import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (q.trim().length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const query = q.trim();
  const suggestions: string[] = [];

  // 1. Offer exact typed location as option #1
  suggestions.push(query);

  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // 2. Google Places Autocomplete API
  if (googleApiKey) {
    try {
      const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:in&key=${googleApiKey}`;
      const googleRes = await fetch(googleUrl, { cache: "no-store" });
      if (googleRes.ok) {
        const data = await googleRes.json();
        if (data.status === "OK" && data.predictions && Array.isArray(data.predictions)) {
          for (const p of data.predictions) {
            if (p.description && !suggestions.includes(p.description)) {
              suggestions.push(p.description);
            }
          }
        } else {
          console.warn("[Google Places API Warning]:", data.status, data.error_message || "");
          
          // Try Google Maps Geocoding API if Autocomplete failed or returned status != OK
          const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&components=country:IN&key=${googleApiKey}`;
          const geoRes = await fetch(geoUrl, { cache: "no-store" });
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData.status === "OK" && geoData.results) {
              for (const r of geoData.results) {
                if (r.formatted_address && !suggestions.includes(r.formatted_address)) {
                  suggestions.push(r.formatted_address);
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("[Google Places API Fetch Exception]:", err);
    }
  }

  // 3. Fallback / Supplement: OpenStreetMap Nominatim Search (Broad India Search)
  if (suggestions.length < 5) {
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=8&addressdetails=1`;
      const nomRes = await fetch(nomUrl, {
        headers: { "User-Agent": "TempTravelCarRentals/1.0 (info@temptravels.com)" },
        cache: "no-store",
      });
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
      console.error("[Nominatim API Exception]:", err);
    }
  }

  // 4. Fallback / Supplement: Photon API
  if (suggestions.length < 5) {
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&bbox=68.0,6.0,97.0,37.0`;
      const photonRes = await fetch(photonUrl, {
        headers: { "User-Agent": "TempTravelCarRentals/1.0" },
        cache: "no-store",
      });
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
      console.error("[Photon API Exception]:", err);
    }
  }

  return NextResponse.json({ suggestions: suggestions.slice(0, 8) });
}
