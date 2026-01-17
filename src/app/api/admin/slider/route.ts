import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// GET all sliders
export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sliders = await prisma.slider.findMany({
    orderBy: { sira: 'asc' },
  });

  return NextResponse.json(sliders);
}

// POST create slider
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { baslik, aciklama, resim, link, sira, aktif } = body;

    if (!baslik || !resim) {
      return NextResponse.json(
        { error: 'Başlık ve resim zorunludur' },
        { status: 400 }
      );
    }

    const slider = await prisma.slider.create({
      data: {
        baslik,
        aciklama: aciklama || null,
        resim,
        link: link || null,
        sira: sira || 0,
        aktif: aktif ?? true,
      },
    });

    return NextResponse.json(slider, { status: 201 });
  } catch (error) {
    console.error('Create slider error:', error);
    return NextResponse.json({ error: 'Slider oluşturulamadı' }, { status: 500 });
  }
}
