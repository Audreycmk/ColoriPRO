// src/app/api/generate-image/route.ts
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { imagePrompt } = await req.json();

    if (!imagePrompt || imagePrompt.length < 10) {
      console.warn('⚠️ Invalid or short prompt:', imagePrompt);
      return NextResponse.json(
        { error: 'Image prompt is missing or too short' },
        { status: 400 }
      );
    }

    console.log('🎨 Prompt received:', imagePrompt);

    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1792',
      response_format: 'url',
    });

    // Log entire OpenAI response for debugging
    console.log('🧠 Full OpenAI response:', JSON.stringify(imageResponse, null, 2));

    const imageUrl = imageResponse?.data?.[0]?.url;

    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      console.error('❌ Invalid or missing image URL:', imageUrl);
      return NextResponse.json(
        { error: 'Failed to generate a valid image URL from OpenAI' },
        { status: 500 }
      );
    }

    console.log('✅ Successfully generated image URL:', imageUrl);

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error('❌ Image generation error:', error?.message || error);

    // Optional: print full error stack if available
    if (error?.response?.data) {
      console.error('📦 OpenAI error response:', JSON.stringify(error.response.data, null, 2));
    }

    return NextResponse.json(
      { error: 'Image generation failed. See logs for details.' },
      { status: 500 }
    );
  }
}
