import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/kategoriler
export async function GET() {
  const kategoriler = await prisma.kategori.findMany({
    where: { aktif: true },
    orderBy: { sira: 'asc' },
    include: {
      _count: { select: { haberler: true } },
    },
  });

  return NextResponse.json(kategoriler);
}
