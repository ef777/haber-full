import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/haberler - Haber listesi
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const kategori = searchParams.get('kategori');
  const yazar = searchParams.get('yazar');
  const manset = searchParams.get('manset');
  const sondakika = searchParams.get('sondakika');
  const search = searchParams.get('search');

  const where: Record<string, unknown> = {
    durum: 'yayinda',
  };

  if (kategori) {
    where.kategori = { slug: kategori };
  }
  if (yazar) {
    where.yazar = { slug: yazar };
  }
  if (manset === 'true') {
    where.manset = true;
  }
  if (sondakika === 'true') {
    where.sondakika = true;
  }
  if (search) {
    where.OR = [
      { baslik: { contains: search, mode: 'insensitive' } },
      { spot: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [haberler, total] = await Promise.all([
    prisma.haber.findMany({
      where,
      include: {
        kategori: { select: { id: true, ad: true, slug: true } },
        yazar: { select: { id: true, ad: true, slug: true, avatar: true } },
        etiketler: { include: { etiket: true } },
      },
      orderBy: { yayinTarihi: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
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
