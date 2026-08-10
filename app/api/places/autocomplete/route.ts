import { NextResponse } from "next/server";

export interface PlaceSuggestion {
  mainText: string;
  secondaryText: string;
  fullText: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (q.trim().length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const query = q.trim();
  const suggestions: PlaceSuggestion[] = [];
  const addedFullTexts = new Set<string>();

  function addSuggestion(mainText: string, secondaryText: string, fullText: string) {
    const cleanFull = fullText.trim();
    if (!cleanFull || addedFullTexts.has(cleanFull.toLowerCase())) return;
    addedFullTexts.add(cleanFull.toLowerCase());
    suggestions.push({
      mainText: mainText.trim(),
      secondaryText: secondaryText.trim(),
      fullText: cleanFull,
    });
  }

  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // 1. Google Places Autocomplete API (Web Service API)
  if (googleApiKey && !googleApiKey.includes("placeholder")) {
    try {
      const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:in&key=${googleApiKey}`;
      const googleRes = await fetch(googleUrl, { cache: "no-store" });
      if (googleRes.ok) {
        const data = await googleRes.json();
        if (data.status === "OK" && data.predictions && Array.isArray(data.predictions)) {
          for (const p of data.predictions) {
            const mainText = p.structured_formatting?.main_text || p.description;
            const secondaryText = p.structured_formatting?.secondary_text || "";
            addSuggestion(mainText, secondaryText, p.description);
          }
        }
      }
    } catch (err) {
      console.error("[Google Places Autocomplete Exception]:", err);
    }
  }

  // 2. OpenStreetMap Nominatim POI & Address Search (Supports Shops, POIs, Corners, Local Landmarks)
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=10&addressdetails=1&extratags=1`;
    const nomRes = await fetch(nomUrl, {
      headers: { "User-Agent": "TempTravelCarRentals/1.0 (info@temptravels.com)" },
      cache: "no-store",
    });
    if (nomRes.ok) {
      const nomData = await nomRes.json();
      for (const item of nomData) {
        const address = item.address || {};
        // Find best primary name (e.g. shop name, amenity, building, corner name)
        const mainName = item.name ||
          address.shop ||
          address.amenity ||
          address.building ||
          address.road ||
          address.suburb ||
          item.display_name.split(", ")[0];

        const secondaryParts: string[] = [];
        if (address.road && address.road !== mainName) secondaryParts.push(address.road);
        if (address.suburb || address.neighbourhood || address.residential) {
          secondaryParts.push(address.suburb || address.neighbourhood || address.residential);
        }
        if (address.city || address.town || address.county) {
          secondaryParts.push(address.city || address.town || address.county);
        }
        if (address.state) secondaryParts.push(address.state);

        const secondaryText = secondaryParts.filter(Boolean).slice(0, 3).join(", ");
        const fullText = secondaryText ? `${mainName}, ${secondaryText}` : item.display_name;

        addSuggestion(mainName, secondaryText, fullText);
      }
    }
  } catch (err) {
    console.error("[Nominatim API Exception]:", err);
  }

  // 3. Photon Engine (Komoot OSM Geocoder for local places and landmarks)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&bbox=68.0,6.0,97.0,37.0`;
    const photonRes = await fetch(photonUrl, {
      headers: { "User-Agent": "TempTravelCarRentals/1.0" },
      cache: "no-store",
    });
    if (photonRes.ok) {
      const data = await photonRes.json();
      if (data.features && Array.isArray(data.features)) {
        for (const feature of data.features) {
          const props = feature.properties;
          const mainName = props.name || props.street || props.suburb || props.city;
          if (!mainName) continue;

          const secondaryParts: string[] = [];
          if (props.street && props.street !== mainName) secondaryParts.push(props.street);
          if (props.suburb || props.district) secondaryParts.push(props.suburb || props.district);
          if (props.city && props.city !== mainName) secondaryParts.push(props.city);
          if (props.state) secondaryParts.push(props.state);

          const secondaryText = secondaryParts.join(", ");
          const fullText = secondaryText ? `${mainName}, ${secondaryText}` : mainName;

          addSuggestion(mainName, secondaryText, fullText);
        }
      }
    }
  } catch (err) {
    console.error("[Photon API Exception]:", err);
  }

  // Always offer typed query as a structured option if not exact match
  if (!addedFullTexts.has(query.toLowerCase())) {
    suggestions.unshift({
      mainText: query,
      secondaryText: "Custom Address Input",
      fullText: query,
    });
  }

  return NextResponse.json({ suggestions: suggestions.slice(0, 8) });
}
