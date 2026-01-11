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

// GET /api/admin/yazarlar
export async function GET() {
  const authError = await checkAuth();
  if (authError) return authError;

  const yazarlar = await prisma.yazar.findMany({
    orderBy: { isim: 'asc' },
    include: { _count: { select: { haberler: true } } },
  });

  return NextResponse.json(yazarlar);
}

// POST /api/admin/yazarlar
export async function POST(request: NextRequest) {
  const authError = await checkAuth();
  if (authError) return authError;

  const body = await request.json();
  const { isim, email, biyografi, foto, twitter, aktif } = body;

  if (!isim) {
    return NextResponse.json({ error: 'Yazar adi gerekli' }, { status: 400 });
  }

  const slug = slugify(isim, { lower: true, strict: true, locale: 'tr' });

  const yazar = await prisma.yazar.create({
    data: { isim, slug, email, biyografi, foto, twitter, aktif },
  });

  return NextResponse.json(yazar, { status: 201 });
}
