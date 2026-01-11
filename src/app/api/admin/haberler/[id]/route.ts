import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// GET single haber
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const haber = await prisma.haber.findUnique({
    where: { id: Number(id) },
    include: {
      kategori: true,
      yazar: true,
      etiketler: { include: { etiket: true } },
    },
  });

  if (!haber) {
    return NextResponse.json({ error: 'Haber bulunamadı' }, { status: 404 });
  }

  return NextResponse.json(haber);
}

// PUT update haber
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

  const {
    baslik,
    spot,
    icerik,
    resim,
    resimAlt,
    video,
    kategoriId,
    yazarId,
    etiketler,
    durum,
    manset,
    sonDakika,
    seoBaslik,
    seoAciklama,
    seoKeywords,
    kaynak,
    kaynakUrl,
  } = body;

  // Etiketleri güncelle
  if (etiketler !== undefined) {
    // Önce mevcut etiketleri sil
    await prisma.haberEtiket.deleteMany({
      where: { haberId: Number(id) },
    });

    // Yeni etiketleri ekle
    if (etiketler.length > 0) {
      await prisma.haberEtiket.createMany({
        data: etiketler.map((etiketId: number) => ({
          haberId: Number(id),
          etiketId,
        })),
      });
    }
  }

  const haber = await prisma.haber.update({
    where: { id: Number(id) },
    data: {
      baslik,
      spot,
      icerik,
      resim,
      resimAlt,
      video,
      kategoriId,
      yazarId,
      durum,
      manset,
      sonDakika,
      seoBaslik,
      seoAciklama,
      seoKeywords,
      kaynak,
      kaynakUrl,
    },
    include: {
      kategori: true,
      yazar: true,
    },
  });

  return NextResponse.json(haber);
}

// DELETE haber
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await prisma.haber.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ success: true });
}
