// src/app/api/generate-prompt/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const { imageUrl } = await req.json();

  if (!imageUrl) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const style = cookieStore.get('style')?.value || 'Natural Classic';

  const prompt = `
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
   Flatlay of ${style} outfit — top, bottom, shoes, glasses, and bag — using seasonal color palette.  
   No people, no background. Full layout visible and color-coordinated.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
            {
              type: 'text',
              text: `You are a Korean 16-season color stylist. Analyze the uploaded photo (skin, eye, hair color). Provide the following:
    1. Seasonal Color Type
    2. Color Extraction (CSV: Label, HEX)
    3. 9-Color Seasonal Palette (CSV: Name, HEX)
    4. Jewelry Tone (e.g. Gold, #D4AF37)
    5. 2 Flattering Hair Colors
    6. Makeup Suggestions:
       - 2 Foundations (Brand, Product, Shade, HEX, URL)
       - 1 Korean Cushion
       - 4 Lipsticks
       - 2 Blushes
       - 2 Eyeshadow Palettes
    7. 2 Similar Celebrities (names only)
    8. Image Prompt: Flatlay of a ${style} outfit using seasonal palette. No people. Full layout.`,
            },
          ],
        },
      ],
      max_tokens: 1800,
      temperature: 0.7,
    });
    

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error(`Invalid GPT result: ${result}`);
    }
    
    // Log and allow analysis even if polite disclaimers are present
    const hasSeasonalData = result.match(/\*\*Seasonal Color Type:\*\*/i);
    if (!hasSeasonalData) {
      throw new Error(`Missing required color analysis sections. GPT result: ${result}`);
    }
    
    return NextResponse.json({ result });
  } catch (err: any) {
    console.error('❌ GPT error:', err?.response?.data || err.message || err);
    return NextResponse.json({ error: 'GPT failed to analyze image' }, { status: 500 });
  }
  
}
