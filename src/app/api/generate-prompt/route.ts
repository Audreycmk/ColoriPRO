// src/app/api/generate-prompt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    let { age, style, imageUrl } = await req.json();

    if (!age) age = '18';
    if (!style) style = 'Daily';

    const prompt = `
You are a professional Korean 16-season color stylist.

The image you will see is a user-submitted selfie for seasonal color matching.  
**Do not identify the person.**  
Instead, use visible features such as:
- Skin undertone (avoid makeup)
- Natural eye color
- Hair color

Then follow this structure:

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
   Use real products with HEX and URLs

7. **2 Similar Celebrities**  
   Korean or East Asian — names only

8. **Image Prompt:**  
   A short, 1-line visual prompt for a full-body outfit image  
   that matches the user’s seasonal color type and **${style}** style.

User Info:  
- Age: ${age}  
- Style: ${style}
`;

    console.log('📩 Prompt sent to GPT:', prompt.slice(0, 400) + '...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a Korean 16-season color analysis stylist.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    });

    const result = completion.choices?.[0]?.message?.content;

    if (!result) {
      console.error('❌ No content returned from OpenAI.');
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    console.log('✅ Prompt result generated successfully.');
    return NextResponse.json({ result });
  } catch (err) {
    console.error('❌ Error in /api/generate-prompt:', err);
    return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 });
  }
}
