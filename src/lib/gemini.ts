// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// IMPORTANT: Make sure NEXT_PUBLIC_GEMINI_API_KEY is set in your .env.local file.
// In a production app, consider using Next.js API Routes to proxy calls to Gemini
// to avoid exposing your API key in the client-side bundle.
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error("NEXT_PUBLIC_GEMINI_API_KEY is not set. Please set it in your .env.local file.");
  // Throwing an error to prevent further execution if the key is missing
  throw new Error("Gemini API key is missing. Check your .env.local file.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeFace(imageBase64: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // imageBase64 typically comes as a data URL (e.g., "data:image/jpeg;base64,...")
    // We need to extract just the base64 part and determine the mimeType.
    const parts = imageBase64.split(',');
    if (parts.length < 2) {
        throw new Error("Invalid imageBase64 format. Expected a data URL.");
    }
    const mimeType = parts[0].split(':')[1].split(';')[0]; // e.g., "image/jpeg"
    const base64Data = parts[1];

    console.log(`lib/gemini.ts: Sending image to Gemini. MIME Type: ${mimeType}, Data Length: ${base64Data.length}`);

    const result = await model.generateContent([
      { inlineData: { data: base64Data, mimeType: mimeType } },
      `
You are a professional Korean 16-season color stylist.  
The following image is a user-submitted photo intended for seasonal color analysis.

⚠️ Do not identify or describe the person.  
Focus only on visible visual traits:
- Skin undertone (avoid makeup)
- Natural eye color
- Natural hair color

Based on these features, analyze and provide the following:

1. **Seasonal Color Type**  
   e.g. Soft Autumn

2. **Color Extraction** (CSV format):  
   Label, HEX  
   Example:  
   Face, #EDC1A8  
   Eye, #6A5554  
   Hair, #3C3334

3. **9-Color Seasonal Palette** (CSV: Name, HEX)  
   e.g. Dusty Rose, #C0A6A1

4. **Jewelry Tone**  
   e.g. Gold, #D4AF37

5. **2 Flattering Hair Colors** (CSV: Name, HEX)

6. **Makeup Suggestions**  
   - 2 Foundations (Brand, Product, Shade, HEX, URL)  
   - 1 Korean Cushion  
   - 4 Lipsticks  
   - 2 Blushes  
   - 2 Eyeshadow Palettes  
   Use only real, purchasable products. Provide HEX and URLs.

7. **2 Similar Celebrities**  
   — name only (no images or descriptions)

8. **Image Prompt**  
   Flatlay of style outfit for current season — Include exactly **5 items**: 1 top, 1 bottom, 1 pair of shoes, 1 pair of glasses, 1 bag — using 3**only 3 HEX colors** from the palette above.  
   No people, transparent background, with no shadows. **Do not include** makeup, hats, phones, or extra accessories. Full layout visible and color-coordinated. Response must be a **single descriptive sentence or paragraph**, suitable for input to an image generation model (like DALL·E 3)
`
    ]);

    const response = await result.response;
    const textResult = await response.text();
    console.log("lib/gemini.ts: Gemini response received. Text length:", textResult.length);
    return textResult;

  } catch (error: unknown) {
    console.error('Error analyzing image:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to analyze image: ${error.message}`);
    }
    throw new Error('Failed to analyze image: Unknown error occurred');
  }
} 