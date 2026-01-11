import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/yazarlar
export async function GET() {
  const yazarlar = await prisma.yazar.findMany({
    where: { aktif: true },
    include: {
      _count: { select: { haberler: true } },
    },
  });

  return NextResponse.json(yazarlar);
}
