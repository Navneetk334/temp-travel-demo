import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, fileName } = body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: "Server missing Gemini API Key. Please add GEMINI_API_KEY to your environment variables." 
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash for fast and accurate multimodal tasks
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Remove the data URL prefix if it exists
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `
You are an expert data entry assistant specializing in Indian Car Rental Duty Slips (Trip Sheets).
I have provided an image of a physical duty slip (it may contain both printed and handwritten text).
Extract the information into the exact JSON format below.
If a field is empty, illegible, or not found, leave the value as an empty string "".

Return ONLY raw JSON, with no markdown formatting (\`\`\`json) and no explanation.

JSON Schema:
{
  "tripSheetNo": "string",
  "carNo": "string (e.g., DL 1Z 1234)",
  "date": "string (YYYY-MM-DD)",
  "reportedTo": "string (Passenger/Guest name)",
  "account": "string (Company name)",
  "reportAt": "string (Reporting location)",
  "garageDepartureTime": "string (e.g., 06:30 AM)",
  "garageOpeningKm": "string (numbers only)",
  "reportingTime": "string (e.g., 07:15 AM)",
  "reportingKm": "string",
  "releaseTime": "string (e.g., 07:45 PM)",
  "releaseKm": "string",
  "garagingTime": "string (e.g., 08:30 PM)",
  "garagingKm": "string",
  "totalHours": "string",
  "totalKms": "string",
  "remarks": "string",
  "serviceFeedback": "string (EXCELLENT, GOOD, POOR)",
  "parkingTollTax": "string",
  "releaseDate": "string (YYYY-MM-DD)",
  "placeOfRelease": "string",
  "mobile": "string",
  "officeTo": "string",
  "bookedBy": "string",
  "officeFor": "string",
  "garageInTime": "string",
  "garageInKm": "string",
  "officeReleasePlace": "string",
  "parkingAmount": "string",
  "handoverPerson": "string",
  "handoverDate": "string",
  "handoverTime": "string",
  "officeRemarks": "string",
  "usageTracks": [
    {
      "id": "string",
      "from": "string",
      "to": "string",
      "details": "string"
    }
  ]
}
`;

    const image = {
      inlineData: {
        data: cleanBase64,
        mimeType: "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, image]);
    const response = await result.response;
    const text = response.text();

    // Clean up response if the model returned markdown code blocks
    let jsonText = text.trim();
    if (jsonText.startsWith("\`\`\`json")) {
      jsonText = jsonText.replace(/^\`\`\`json\n/, "").replace(/\n\`\`\`$/, "");
    } else if (jsonText.startsWith("\`\`\`")) {
      jsonText = jsonText.replace(/^\`\`\`\n/, "").replace(/\n\`\`\`$/, "");
    }

    const extracted = JSON.parse(jsonText);

    return NextResponse.json({
      success: true,
      message: "Optical character recognition completed via Gemini AI",
      extractedData: extracted,
      rawText: JSON.stringify(extracted, null, 2),
      previewUrl: imageBase64,
      fileName: fileName || "scanned_duty_slip.png",
    });
  } catch (error: any) {
    console.error("POST /api/duties/ocr error:", error);
    return NextResponse.json({ error: error.message || "Failed to process OCR duty slip scan via AI" }, { status: 500 });
  }
}
