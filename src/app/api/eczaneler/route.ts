import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET active eczaneler for today
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const eczaneler = await prisma.nobetciEczane.findMany({
      where: {
        aktif: true,
        tarih: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { ad: 'asc' },
    });

    return NextResponse.json(eczaneler);
  } catch {
    return NextResponse.json([]);
  }
}
