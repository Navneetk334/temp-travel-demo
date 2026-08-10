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

  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "AIzaSyBFu4RlB5ontZR997X45chVlauhB_i9sSI";

  // 1. Google Places API (New v1 Endpoint - Supports All Indian POIs, shops, corners, landmarks)
  if (googleApiKey) {
    try {
      const googleV1Url = "https://places.googleapis.com/v1/places:autocomplete";
      const googleRes = await fetch(googleV1Url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": googleApiKey,
        },
        body: JSON.stringify({
          input: query,
          includedRegionCodes: ["in"],
        }),
        cache: "no-store",
      });

      if (googleRes.ok) {
        const data = await googleRes.json();
        if (data.suggestions && Array.isArray(data.suggestions)) {
          for (const s of data.suggestions) {
            const pred = s.placePrediction;
            if (pred) {
              const mainText = pred.structuredFormat?.mainText?.text || pred.text?.text || "";
              const secondaryText = pred.structuredFormat?.secondaryText?.text || "";
              const fullText = pred.text?.text || `${mainText}, ${secondaryText}`;
              if (mainText) {
                addSuggestion(mainText, secondaryText, fullText);
              }
            }
          }
        }
      } else {
        // Fallback to legacy Google Places API if v1 returns non-200
        const legacyUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:in&key=${googleApiKey}`;
        const legacyRes = await fetch(legacyUrl, { cache: "no-store" });
        if (legacyRes.ok) {
          const lData = await legacyRes.json();
          if (lData.status === "OK" && lData.predictions) {
            for (const p of lData.predictions) {
              const mainText = p.structured_formatting?.main_text || p.description;
              const secondaryText = p.structured_formatting?.secondary_text || "";
              addSuggestion(mainText, secondaryText, p.description);
            }
          }
        }
      }
    } catch (err) {
      console.error("[Google Places API Exception]:", err);
    }
  }

  // 2. OpenStreetMap Nominatim POI & Address Search Fallback
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

  // 3. Photon Engine Fallback
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

  // Always offer exact typed location if not already present
  if (!addedFullTexts.has(query.toLowerCase())) {
    suggestions.push({
      mainText: query,
      secondaryText: "Custom Address Input",
      fullText: query,
    });
  }

  return NextResponse.json({ suggestions: suggestions.slice(0, 8) });
}
