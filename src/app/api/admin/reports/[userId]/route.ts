import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if the current user is an admin
    const response = await fetch(`${process.env.NEXT_PUBLIC_CLERK_API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await response.json();
    const isAdmin = userData.publicMetadata?.role === 'admin';

    if (!isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // TODO: Replace this with actual database query
    // This is mock data for demonstration
    const mockReport = {
      userId: params.userId,
      userName: 'John Doe',
      colorResult: 'Soft Autumn',
      timestamp: new Date().toISOString(),
      extractedColors: {
        face: '#edc1a8',
        eye: '#6a5554',
        hair: '#3c3334'
      },
      colorPalette: [
        { name: 'Dusty Rose', hex: '#C0A6A1' },
        { name: 'Sage Green', hex: '#A9C8BD' },
        { name: 'Soft Peach', hex: '#F1C2B2' },
        { name: 'Muted Teal', hex: '#A4B6B4' },
        { name: 'Warm Taupe', hex: '#B5A99D' },
        { name: 'Burnt Sienna', hex: '#A65E2E' },
        { name: 'Olive Green', hex: '#8E7C5B' },
        { name: 'Soft Plum', hex: '#A5788D' },
        { name: 'Rosewood', hex: '#9B6C6C' }
      ],
      outfitImage: '/outfit-demo.png',
      makeupSuggestions: [
        {
          name: 'Etude Double Lasting Foundation',
          shade: 'NC20',
          link: 'https://etude.com',
          image: '/makeup/foundation.png'
        },
        {
          name: 'Laneige Neo Cushion Matte',
          shade: '21N',
          link: 'https://laneige.com',
          image: '/makeup/cushion.png'
        },
        {
          name: '3CE Lip Color - Taupe',
          shade: '15',
          link: 'https://stylenanda.com',
          image: '/makeup/Lip1.png'
        },
        {
          name: 'Rom&nd Juicy Lip - FIGFIG',
          shade: '06',
          link: 'https://romand.com',
          image: '/makeup/Lip2.png'
        }
      ],
      celebrityReferences: [
        {
          name: 'Liu Wen',
          image: '/celeb1.png'
        },
        {
          name: 'Tang Wei',
          image: '/celeb2.png'
        }
      ]
    };

    return NextResponse.json(mockReport);
  } catch (error) {
    console.error('Error in report API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 