import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import slugify from 'slugify';

// GET all yazarlar
export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const yazarlar = await prisma.yazar.findMany({
    orderBy: { ad: 'asc' },
    include: { _count: { select: { haberler: true } } },
  });

  return NextResponse.json(yazarlar);
}

// POST create yazar
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ad, email, biyografi, avatar, twitter, linkedin, website, aktif } = await request.json();

    if (!ad) {
      return NextResponse.json({ error: 'İsim gereklidir' }, { status: 400 });
    }

    const slug = slugify(ad, { lower: true, strict: true });

    const yazar = await prisma.yazar.create({
      data: {
        ad,
        slug,
        email: email || null,
        biyografi: biyografi || null,
        avatar: avatar || null,
        twitter: twitter || null,
        linkedin: linkedin || null,
        website: website || null,
        aktif: aktif ?? true,
      },
    });

    return NextResponse.json(yazar, { status: 201 });
  } catch (error) {
    console.error('Create yazar error:', error);
    return NextResponse.json({ error: 'Yazar oluşturulamadı' }, { status: 500 });
  }
}
