import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// PUT update eczane
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
  const { ad, adres, telefon, il, ilce, tarih, aktif } = body;

  try {
    const eczane = await prisma.nobetciEczane.update({
      where: { id: Number(id) },
      data: {
        ad,
        adres,
        telefon: telefon || null,
        il: il || 'Eskisehir',
        ilce: ilce || null,
        tarih: tarih ? new Date(tarih) : undefined,
        aktif: aktif ?? true,
      },
    });

    return NextResponse.json(eczane);
  } catch (error) {
    console.error('Update eczane error:', error);
    return NextResponse.json({ error: 'Eczane güncellenemedi' }, { status: 500 });
  }
}

// DELETE eczane
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
    await prisma.nobetciEczane.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete eczane error:', error);
    return NextResponse.json({ error: 'Eczane silinemedi' }, { status: 500 });
  }
}
