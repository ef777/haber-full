import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import slugify from 'slugify';

// GET single kategori
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const kategori = await prisma.kategori.findUnique({
    where: { id: Number(id) },
    include: { _count: { select: { haberler: true } } },
  });

  if (!kategori) {
    return NextResponse.json({ error: 'Kategori bulunamadı' }, { status: 404 });
  }

  return NextResponse.json(kategori);
}

// PUT update kategori
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
  const { ad, aciklama, resim, aktif, sira } = body;

  const updateData: Record<string, unknown> = {};

  if (ad !== undefined) {
    updateData.ad = ad;
    updateData.slug = slugify(ad, { lower: true, strict: true });
  }
  if (aciklama !== undefined) updateData.aciklama = aciklama;
  if (resim !== undefined) updateData.resim = resim;
  if (aktif !== undefined) updateData.aktif = aktif;
  if (sira !== undefined) updateData.sira = sira;

  const kategori = await prisma.kategori.update({
    where: { id: Number(id) },
    data: updateData,
  });

  return NextResponse.json(kategori);
}

// DELETE kategori
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await prisma.kategori.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ success: true });
}
