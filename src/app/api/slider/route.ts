import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET active sliders (public)
export async function GET() {
  const sliders = await prisma.slider.findMany({
    where: { aktif: true },
    orderBy: { sira: 'asc' },
  });

  return NextResponse.json(sliders);
}
