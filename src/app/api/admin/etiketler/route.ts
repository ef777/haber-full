import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import slugify from 'slugify';

// GET all etiketler
export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const etiketler = await prisma.etiket.findMany({
    orderBy: { ad: 'asc' },
  });

  return NextResponse.json(etiketler);
}

// POST create etiket
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ad } = await request.json();

    if (!ad) {
      return NextResponse.json({ error: 'Ad gereklidir' }, { status: 400 });
    }

    const slug = slugify(ad, { lower: true, strict: true });

    // Eğer varsa mevcut olanı döndür
    const existing = await prisma.etiket.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(existing);
    }

    const etiket = await prisma.etiket.create({
      data: { ad, slug },
    });

    return NextResponse.json(etiket, { status: 201 });
  } catch (error) {
    console.error('Create etiket error:', error);
    return NextResponse.json({ error: 'Etiket oluşturulamadı' }, { status: 500 });
  }
}
