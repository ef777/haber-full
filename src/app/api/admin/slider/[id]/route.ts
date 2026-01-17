import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// PUT update slider
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { baslik, aciklama, resim, link, sira, aktif } = body;

  try {
    const slider = await prisma.slider.update({
      where: { id: Number(id) },
      data: {
        baslik,
        aciklama: aciklama || null,
        resim,
        link: link || null,
        sira: sira ?? 0,
        aktif: aktif ?? true,
      },
    });

    return NextResponse.json(slider);
  } catch (error) {
    console.error('Update slider error:', error);
    return NextResponse.json({ error: 'Slider güncellenemedi' }, { status: 500 });
  }
}

// DELETE slider
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.slider.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete slider error:', error);
    return NextResponse.json({ error: 'Slider silinemedi' }, { status: 500 });
  }
}
