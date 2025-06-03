// src/app/api/generate-image/route.ts
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { imagePrompt } = await req.json();

    if (!imagePrompt || imagePrompt.length < 10) {
      return NextResponse.json(
        { error: 'Image prompt is missing or too short' },
        { status: 400 }
      );
    }

    console.log('🎨 Generating image with prompt:', imagePrompt);

    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1792', // Vertical layout (best for full-body mockup)
      response_format: 'url',
    });

    const imageUrl = imageResponse.data?.[0]?.url;

    if (!imageUrl || !imageUrl.startsWith('http')) {
      console.error('❌ Invalid image URL:', imageUrl);
      return NextResponse.json(
        { error: 'Failed to generate a valid image URL' },
        { status: 500 }
      );
    }

    console.log('✅ Generated image URL:', imageUrl);
    console.log('🔧 Note: Display this image at max-height: 350px. If overflow, resize to 250px in frontend.');

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('❌ Error generating DALL·E image:', error);
    return NextResponse.json(
      { error: 'Image generation failed' },
      { status: 500 }
    );
  }
}
