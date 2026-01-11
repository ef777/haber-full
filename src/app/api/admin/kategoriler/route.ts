import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import slugify from 'slugify';

// GET all kategoriler
export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const kategoriler = await prisma.kategori.findMany({
    orderBy: { sira: 'asc' },
    include: { _count: { select: { haberler: true } } },
  });

  return NextResponse.json(kategoriler);
}

// POST create kategori
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ad, aciklama, resim, aktif, sira } = await request.json();

    if (!ad) {
      return NextResponse.json({ error: 'İsim gereklidir' }, { status: 400 });
    }

    const slug = slugify(ad, { lower: true, strict: true });

    const kategori = await prisma.kategori.create({
      data: {
        ad,
        slug,
        aciklama: aciklama || null,
        resim: resim || null,
        aktif: aktif ?? true,
        sira: sira || 0,
      },
    });

    return NextResponse.json(kategori, { status: 201 });
  } catch (error) {
    console.error('Create kategori error:', error);
    return NextResponse.json({ error: 'Kategori oluşturulamadı' }, { status: 500 });
  }
}
