// src/app/api/generate-prompt/route.ts
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { age, style, imageUrl } = await req.json();
    const styleFormatted = Array.isArray(style) ? style.join(', ') : style;

    const prompt = `
You are a Korean 16-season color analyst and stylist.

From the image:
- Analyze the user's **skin tone (avoid makeup), eye color, and hair color**.
- **Estimate gender and ethnicity**, but **do not include them in the result** — just print them to the console.
- Provide beauty and fashion recommendations as described below.

User Info:
- Age: ${age}
- Style Preference: ${styleFormatted}

Generate:
1. Seasonal color type (with short explanation)
2. Lower cheek, eye, hair colors of the image (CSV: Color Name, HEX)
3. 9 seasonal palette colors (CSV: Name, HEX)
4. 1 Jewelry tone (Metal, HEX)
5. 2 flattering hair colors (CSV)
6. Makeup suggestions of 2 foundations , 1 Korean cushion, 4 lipsticks for different look, 2 blushes, 2 eye shadow palettes (real product names with shade, HEX, and links)
9. 2 similar-looking celebrities (based on ethnicity)

Then end with:
**Image Prompt:** [short 1-line visual outfit prompt based on seasonal type + style]
`;

    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.7,
      messages: [
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
                url: imageUrl, // This should be the public URL of the uploaded image
              },
            },
          ],
        },
      ],
    });

    const result = visionResponse.choices[0]?.message.content || '';

    // Optional: Log estimated gender/ethnicity if included in result
    const genderMatch = result.match(/Estimated Gender:\s*(.+)/i);
    const ethnicityMatch = result.match(/Estimated Ethnicity:\s*(.+)/i);

    if (genderMatch || ethnicityMatch) {
      console.log('🔍 Estimated Gender:', genderMatch?.[1] || 'Not detected');
      console.log('🔍 Estimated Ethnicity:', ethnicityMatch?.[1] || 'Not detected');
    }

    return NextResponse.json({ result });
  } catch (err) {
    console.error('❌ Error in GPT Vision prompt route:', err);
    return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 });
  }
}
