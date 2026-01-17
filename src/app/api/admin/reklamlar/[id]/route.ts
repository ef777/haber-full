import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// PUT update reklam
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
  const { ad, konum, icerik, aktif, baslangic, bitis } = body;

  try {
    const reklam = await prisma.reklam.update({
      where: { id: Number(id) },
      data: {
        ad,
        konum,
        icerik,
        aktif: aktif ?? true,
        baslangic: baslangic ? new Date(baslangic) : null,
        bitis: bitis ? new Date(bitis) : null,
      },
    });

    return NextResponse.json(reklam);
  } catch (error) {
    console.error('Update reklam error:', error);
    return NextResponse.json({ error: 'Reklam güncellenemedi' }, { status: 500 });
  }
}

// DELETE reklam
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
    await prisma.reklam.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete reklam error:', error);
    return NextResponse.json({ error: 'Reklam silinemedi' }, { status: 500 });
  }
}
