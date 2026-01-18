import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET sonraki haberler (infinite scroll için)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const currentId = searchParams.get('currentId');
  const kategoriId = searchParams.get('kategoriId');
  const limit = parseInt(searchParams.get('limit') || '5');

  if (!currentId) {
    return NextResponse.json({ error: 'currentId gerekli' }, { status: 400 });
  }

  try {
    // Mevcut haberin yayın tarihini al
    const currentHaber = await prisma.haber.findUnique({
      where: { id: parseInt(currentId) },
      select: { yayinTarihi: true, kategoriId: true },
    });

    if (!currentHaber) {
      return NextResponse.json({ error: 'Haber bulunamadı' }, { status: 404 });
    }

    // Sonraki haberleri çek (daha eski tarihli olanlar)
    const sonrakiHaberler = await prisma.haber.findMany({
      where: {
        durum: 'yayinda',
        yayinTarihi: { lt: currentHaber.yayinTarihi },
        // Eğer kategori belirtilmişse aynı kategoriden çek
        ...(kategoriId ? { kategoriId: parseInt(kategoriId) } : {}),
      },
      orderBy: { yayinTarihi: 'desc' },
      take: limit,
      include: {
        kategori: true,
        yazar: true,
        etiketler: { include: { etiket: true } },
      },
    });

    return NextResponse.json(sonrakiHaberler);
  } catch (error) {
    console.error('Sonraki haberler hatası:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
