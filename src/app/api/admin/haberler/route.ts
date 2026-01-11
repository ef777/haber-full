import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import slugify from 'slugify';

// Middleware - auth kontrolu
async function checkAuth() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz erisim' }, { status: 401 });
  }
  return null;
}

// GET /api/admin/haberler - Tum haberler (admin)
export async function GET(request: NextRequest) {
  const authError = await checkAuth();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const durum = searchParams.get('durum');
  const search = searchParams.get('search');

  const where: Record<string, unknown> = {};
  
  if (durum) {
    where.durum = durum;
  }
  if (search) {
    where.baslik = { contains: search, mode: 'insensitive' };
  }

  const [haberler, total] = await Promise.all([
    prisma.haber.findMany({
      where,
      include: {
        kategori: { select: { id: true, isim: true } },
        yazar: { select: { id: true, isim: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.haber.count({ where }),
  ]);

  return NextResponse.json({
    data: haberler,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/admin/haberler - Yeni haber ekle
export async function POST(request: NextRequest) {
  const authError = await checkAuth();
  if (authError) return authError;

  const body = await request.json();
  const { baslik, spot, icerik, kapakResmi, kategoriId, yazarId, etiketIds, durum, manset, sondakika, newsKeywords, seoTitle, seoDescription } = body;

  if (!baslik) {
    return NextResponse.json({ error: 'Baslik gerekli' }, { status: 400 });
  }

  const slug = slugify(baslik, { lower: true, strict: true, locale: 'tr' });

  // Slug benzersizligini kontrol et
  const existing = await prisma.haber.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const haber = await prisma.haber.create({
    data: {
      baslik,
      slug: finalSlug,
      spot,
      icerik,
      kapakResmi,
      kategoriId: kategoriId ? parseInt(kategoriId) : null,
      yazarId: yazarId ? parseInt(yazarId) : null,
      durum: durum || 'taslak',
      manset: manset || false,
      sondakika: sondakika || false,
      newsKeywords,
      seoTitle,
      seoDescription,
      yayinTarihi: durum === 'yayinda' ? new Date() : undefined,
      etiketler: etiketIds?.length > 0 ? {
        create: etiketIds.map((etiketId: number) => ({
          etiketId: parseInt(String(etiketId)),
        })),
      } : undefined,
    },
    include: {
      kategori: true,
      yazar: true,
      etiketler: { include: { etiket: true } },
    },
  });

  return NextResponse.json(haber, { status: 201 });
}
