import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import slugify from 'slugify';

// GET all haberler (admin)
export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const durum = searchParams.get('durum');
  const search = searchParams.get('search');

  const where: Record<string, unknown> = {};
  if (durum) where.durum = durum;
  if (search) {
    where.OR = [
      { baslik: { contains: search, mode: 'insensitive' } },
      { spot: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [haberler, total] = await Promise.all([
    prisma.haber.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        kategori: { select: { id: true, ad: true } },
        yazar: { select: { id: true, ad: true } },
      },
    }),
    prisma.haber.count({ where }),
  ]);

  return NextResponse.json({
    data: haberler,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST create haber
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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
      slider,
      sonDakika,
      seoBaslik,
      seoAciklama,
      seoKeywords,
      kaynak,
      kaynakUrl,
    } = body;

    if (!baslik || !icerik) {
      return NextResponse.json(
        { error: 'Başlık ve içerik gereklidir' },
        { status: 400 }
      );
    }

    // Slug oluştur
    let slug = slugify(baslik, { lower: true, strict: true });
    
    // Slug benzersizliğini kontrol et
    const existing = await prisma.haber.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const haber = await prisma.haber.create({
      data: {
        baslik,
        slug,
        spot: spot || null,
        icerik,
        resim: resim || null,
        resimAlt: resimAlt || null,
        video: video || null,
        kategoriId: kategoriId || null,
        yazarId: yazarId || null,
        durum: durum || 'taslak',
        manset: manset || false,
        slider: slider || false,
        sonDakika: sonDakika || false,
        seoBaslik: seoBaslik || null,
        seoAciklama: seoAciklama || null,
        seoKeywords: seoKeywords || null,
        kaynak: body.kaynak || null,
        kaynakUrl: body.kaynakUrl || null,
        yayinTarihi: durum === 'yayinda' ? new Date() : new Date(),
      },
    });

    // Etiketleri ekle
    if (etiketler && etiketler.length > 0) {
      await prisma.haberEtiket.createMany({
        data: etiketler.map((etiketId: number) => ({
          haberId: haber.id,
          etiketId,
        })),
      });
    }

    return NextResponse.json(haber, { status: 201 });
  } catch (error) {
    console.error('Create haber error:', error);
    return NextResponse.json(
      { error: 'Haber oluşturulamadı' },
      { status: 500 }
    );
  }
}
