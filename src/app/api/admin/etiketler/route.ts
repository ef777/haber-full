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

// GET /api/admin/etiketler
export async function GET() {
  const authError = await checkAuth();
  if (authError) return authError;

  const etiketler = await prisma.etiket.findMany({
    orderBy: { isim: 'asc' },
    include: { _count: { select: { haberler: true } } },
  });

  return NextResponse.json(etiketler);
}

// POST /api/admin/etiketler
export async function POST(request: NextRequest) {
  const authError = await checkAuth();
  if (authError) return authError;

  const body = await request.json();
  const { isim } = body;

  if (!isim) {
    return NextResponse.json({ error: 'Etiket adi gerekli' }, { status: 400 });
  }

  const slug = slugify(isim, { lower: true, strict: true, locale: 'tr' });

  const etiket = await prisma.etiket.create({
    data: { isim, slug },
  });

  return NextResponse.json(etiket, { status: 201 });
}
