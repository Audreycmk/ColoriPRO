// src/app/api/generate-prompt/route.ts
import { NextResponse } from 'next/server';
import { analyzeFace } from '@/lib/gemini';

export async function POST(req: Request) {
  const { imageBase64 } = await req.json();

  if (!imageBase64) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }

  try {
    const result = await analyzeFace(imageBase64);
    
    // Log and allow analysis even if polite disclaimers are present
    const hasSeasonalData = result.match(/\*\*Seasonal Color Type:\*\*/i);
    if (!hasSeasonalData) {
      throw new Error(`Missing required color analysis sections. Gemini result: ${result}`);
    }
    
    return NextResponse.json({ result });
  } catch (err: any) {
    console.error('❌ Gemini error:', err?.response?.data || err.message || err);
    return NextResponse.json({ error: 'Gemini failed to analyze image' }, { status: 500 });
  }
}
