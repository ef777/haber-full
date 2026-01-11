import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import slugify from 'slugify';

async function checkAuth() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz erisim' }, { status: 401 });
  }
  return null;
}

// GET /api/admin/haberler/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await checkAuth();
  if (authError) return authError;

  const { id } = await params;
  const haber = await prisma.haber.findUnique({
    where: { id: parseInt(id) },
    include: {
      kategori: true,
      yazar: true,
      etiketler: { include: { etiket: true } },
    },
  });

  if (!haber) {
    return NextResponse.json({ error: 'Haber bulunamadi' }, { status: 404 });
  }

  return NextResponse.json(haber);
}

// PUT /api/admin/haberler/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await checkAuth();
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const { baslik, spot, icerik, kapakResmi, kategoriId, yazarId, etiketIds, durum, manset, mansetSira, sondakika, newsKeywords, seoTitle, seoDescription } = body;

  const existing = await prisma.haber.findUnique({ where: { id: parseInt(id) } });
  if (!existing) {
    return NextResponse.json({ error: 'Haber bulunamadi' }, { status: 404 });
  }

  // Eger baslik degistiyse slug'i guncelle
  let newSlug = existing.slug;
  if (baslik && baslik !== existing.baslik) {
    newSlug = slugify(baslik, { lower: true, strict: true, locale: 'tr' });
    const slugExists = await prisma.haber.findFirst({
      where: { slug: newSlug, id: { not: parseInt(id) } },
    });
    if (slugExists) {
      newSlug = `${newSlug}-${Date.now()}`;
    }
  }

  // Etiketleri guncelle
  if (etiketIds !== undefined) {
    await prisma.haberEtiket.deleteMany({ where: { haberId: parseInt(id) } });
    if (etiketIds.length > 0) {
      await prisma.haberEtiket.createMany({
        data: etiketIds.map((etiketId: number) => ({
          haberId: parseInt(id),
          etiketId: parseInt(String(etiketId)),
        })),
      });
    }
  }

  const haber = await prisma.haber.update({
    where: { id: parseInt(id) },
    data: {
      baslik,
      slug: newSlug,
      spot,
      icerik,
      kapakResmi,
      kategoriId: kategoriId ? parseInt(kategoriId) : null,
      yazarId: yazarId ? parseInt(yazarId) : null,
      durum,
      manset,
      mansetSira,
      sondakika,
      newsKeywords,
      seoTitle,
      seoDescription,
      yayinTarihi: durum === 'yayinda' && existing.durum !== 'yayinda' ? new Date() : undefined,
    },
    include: {
      kategori: true,
      yazar: true,
      etiketler: { include: { etiket: true } },
    },
  });

  return NextResponse.json(haber);
}

// DELETE /api/admin/haberler/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await checkAuth();
  if (authError) return authError;

  const { id } = await params;

  await prisma.haber.delete({ where: { id: parseInt(id) } });

  return NextResponse.json({ success: true });
}
