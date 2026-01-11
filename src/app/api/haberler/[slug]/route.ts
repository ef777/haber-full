import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/haberler/[slug] - Tek haber
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const haber = await prisma.haber.findUnique({
    where: { slug },
    include: {
      kategori: true,
      yazar: true,
      etiketler: { include: { etiket: true } },
    },
  });

  if (!haber) {
    return NextResponse.json({ error: 'Haber bulunamadi' }, { status: 404 });
  }

  // Okunma sayisini artir
  await prisma.haber.update({
    where: { id: haber.id },
    data: { goruntulenme: { increment: 1 } },
  });

  return NextResponse.json(haber);
}
