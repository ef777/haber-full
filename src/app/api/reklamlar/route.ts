import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET active reklamlar by konum
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const konum = searchParams.get('konum');

  try {
    const now = new Date();

    const where: {
      aktif: boolean;
      konum?: string;
      OR?: Array<{ baslangic: null } | { baslangic: { lte: Date } }>;
      AND?: Array<{ OR: Array<{ bitis: null } | { bitis: { gte: Date } }> }>;
    } = {
      aktif: true,
    };

    if (konum) {
      where.konum = konum;
    }

    // Check date validity
    where.OR = [
      { baslangic: null },
      { baslangic: { lte: now } },
    ];

    where.AND = [
      {
        OR: [
          { bitis: null },
          { bitis: { gte: now } },
        ],
      },
    ];

    const reklamlar = await prisma.reklam.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reklamlar);
  } catch {
    return NextResponse.json([]);
  }
}
