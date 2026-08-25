import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";

async function testOCR() {
  try {
    const imgPath = path.join(process.cwd(), "public", "uploads", "scans", "real_scan.jpg");
    if (!fs.existsSync(imgPath)) {
      console.log("No test image found at:", imgPath);
      return;
    }
    console.log("Starting server-side Tesseract OCR on:", imgPath);
    const result = await Tesseract.recognize(imgPath, "eng");
    console.log("Extracted Text:\n", result.data.text);
  } catch (err) {
    console.error("Server OCR error:", err);
  }
}

testOCR();
