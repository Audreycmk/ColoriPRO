import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { faceHex, eyeHex, hairHex, age, ethnicity, style } = await req.json();

    const styleFormatted = Array.isArray(style) ? style.join(', ') : style;

    const prompt = `
My skin tone is ${faceHex}, eye color is ${eyeHex}, and hair color is ${hairHex}.
I am a ${age}-year-old ${ethnicity} person with a ${styleFormatted} style preference.

Use Korean 16-season color analysis to identify my season and return:

1. My seasonal type with a brief explanation.
2. Base tones (CSV: Color Name, HEX) for skin, eye, hair.
3. 8 recommended seasonal colors (CSV).
4. Suitable jewelry tones (CSV: Metal or Gem, HEX).
5. 3 flattering hair colors (CSV).
6. Makeup:
   - 4 lipsticks (Name, HEX)
   - 2 blushes (Name, HEX)
   - MAC foundation (e.g., NW 43)
   - Parnell cushion (e.g., 33W Tan Warm)
7. 4 nail polish colors (CSV).
8. 2 glasses frame shapes that suit me.
9. 2 ${ethnicity} celebrities with similar coloring.

Then describe a visual layout mockup using the colors above:

LEFT SIDE:
- Labeled swatches: skin, eye, hair, seasonal palette, lipstick, blush, nails, jewelry
- Use clean, readable Comfortaa font

RIGHT SIDE:
- Outfit in ${styleFormatted} style: top, bottom, shoes, glasses, bag
- Use seasonal palette, keep layout clean, spaced, and fully visible

Then generate a **FULL-PAGE VISUAL IMAGE** with the following layout instructions:

- A centered and evenly spaced palette chart and outfit visualization
- Use my color type as the title ()
- Use clean Comfortaa-style font and clear bold headers

**LEFT COLUMN:**
- Seasonal color swatches (Color Name + HEX) in a labeled grid
- Base colors: skin tone, hair color, eye color
- Makeup shades: lipstick, blush, nail polish (labeled)
- Jewelry tones: metal/gem names + HEX

**RIGHT COLUMN:**
- Full-body outfit mockup in [Style] (e.g., hoodie, joggers, sneakers, glasses, backpack)
- Outfit swatches labeled under “Sporty Outfit” (or corresponding style)
- Outfit elements should reflect the suggested seasonal palette

**Visual rules:**
- No cropping — full layout must be visible
- Keep spacing clean and balanced between elements
- No background
- Avoid facial makeup demos (no lipstick on face)
- Ensure visual consistency and layout alignment across generations

**Final Output:** End with a one-line image prompt formatted as:
**Image Prompt:** [Insert short sentence describing this layout for DALL·E generation]

`;

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const result = chatResponse.choices[0]?.message.content;
    return NextResponse.json({ result });
  } catch (err) {
    console.error('❌ Error in GPT prompt route:', err);
    return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 });
  }
}
