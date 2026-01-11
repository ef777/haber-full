import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/site-ayarlari
export async function GET() {
  let ayarlar = await prisma.siteAyarlari.findFirst();
  
  if (!ayarlar) {
    ayarlar = await prisma.siteAyarlari.create({
      data: {
        siteAdi: 'Haber Sitesi',
        siteAciklama: 'Turkiye ve dunyadan guncel haberler',
      },
    });
  }

  return NextResponse.json(ayarlar);
}
