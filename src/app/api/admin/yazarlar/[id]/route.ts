import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import slugify from 'slugify';

// GET single yazar
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const yazar = await prisma.yazar.findUnique({
    where: { id: Number(id) },
    include: { _count: { select: { haberler: true } } },
  });

  if (!yazar) {
    return NextResponse.json({ error: 'Yazar bulunamadı' }, { status: 404 });
  }

  return NextResponse.json(yazar);
}

// PUT update yazar
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { ad, email, biyografi, avatar, twitter, linkedin, website, aktif } = body;

  const updateData: Record<string, unknown> = {};

  if (ad !== undefined) {
    updateData.ad = ad;
    updateData.slug = slugify(ad, { lower: true, strict: true });
  }
  if (email !== undefined) updateData.email = email;
  if (biyografi !== undefined) updateData.biyografi = biyografi;
  if (avatar !== undefined) updateData.avatar = avatar;
  if (twitter !== undefined) updateData.twitter = twitter;
  if (linkedin !== undefined) updateData.linkedin = linkedin;
  if (website !== undefined) updateData.website = website;
  if (aktif !== undefined) updateData.aktif = aktif;

  const yazar = await prisma.yazar.update({
    where: { id: Number(id) },
    data: updateData,
  });

  return NextResponse.json(yazar);
}

// DELETE yazar
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await prisma.yazar.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ success: true });
}
