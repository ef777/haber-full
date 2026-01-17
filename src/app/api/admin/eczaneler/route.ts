import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// GET all eczaneler
export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const eczaneler = await prisma.nobetciEczane.findMany({
    orderBy: { tarih: 'desc' },
  });

  return NextResponse.json(eczaneler);
}

// POST create eczane
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ad, adres, telefon, il, ilce, tarih, aktif } = body;

    if (!ad || !adres) {
      return NextResponse.json(
        { error: 'Eczane adı ve adres zorunludur' },
        { status: 400 }
      );
    }

    const eczane = await prisma.nobetciEczane.create({
      data: {
        ad,
        adres,
        telefon: telefon || null,
        il: il || 'Eskisehir',
        ilce: ilce || null,
        tarih: tarih ? new Date(tarih) : new Date(),
        aktif: aktif ?? true,
      },
    });

    return NextResponse.json(eczane, { status: 201 });
  } catch (error) {
    console.error('Create eczane error:', error);
    return NextResponse.json({ error: 'Eczane oluşturulamadı' }, { status: 500 });
  }
}
