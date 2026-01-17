import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// GET all reklamlar
export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reklamlar = await prisma.reklam.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(reklamlar);
}

// POST create reklam
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ad, konum, icerik, aktif, baslangic, bitis } = body;

    if (!ad || !konum || !icerik) {
      return NextResponse.json(
        { error: 'Ad, konum ve içerik zorunludur' },
        { status: 400 }
      );
    }

    const reklam = await prisma.reklam.create({
      data: {
        ad,
        konum,
        icerik,
        aktif: aktif ?? true,
        baslangic: baslangic ? new Date(baslangic) : null,
        bitis: bitis ? new Date(bitis) : null,
      },
    });

    return NextResponse.json(reklam, { status: 201 });
  } catch (error) {
    console.error('Create reklam error:', error);
    return NextResponse.json({ error: 'Reklam oluşturulamadı' }, { status: 500 });
  }
}
