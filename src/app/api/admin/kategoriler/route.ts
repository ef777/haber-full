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

// GET /api/admin/kategoriler
export async function GET() {
  const authError = await checkAuth();
  if (authError) return authError;

  const kategoriler = await prisma.kategori.findMany({
    orderBy: { sira: 'asc' },
    include: { _count: { select: { haberler: true } } },
  });

  return NextResponse.json(kategoriler);
}

// POST /api/admin/kategoriler
export async function POST(request: NextRequest) {
  const authError = await checkAuth();
  if (authError) return authError;

  const body = await request.json();
  const { isim, renk, aciklama, sira, aktif } = body;

  if (!isim) {
    return NextResponse.json({ error: 'Kategori adi gerekli' }, { status: 400 });
  }

  const slug = slugify(isim, { lower: true, strict: true, locale: 'tr' });

  const kategori = await prisma.kategori.create({
    data: { isim, slug, renk, aciklama, sira, aktif },
  });

  return NextResponse.json(kategori, { status: 201 });
}
