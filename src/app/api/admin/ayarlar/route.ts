import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// GET /api/admin/ayarlar
export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

// PUT /api/admin/ayarlar
export async function PUT(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Get existing settings or create default
    let ayarlar = await prisma.siteAyarlari.findFirst();

    if (!ayarlar) {
      ayarlar = await prisma.siteAyarlari.create({
        data: {
          siteAdi: 'Haber Sitesi',
        },
      });
    }

    // Update settings
    const updatedAyarlar = await prisma.siteAyarlari.update({
      where: { id: ayarlar.id },
      data: {
        siteAdi: body.siteAdi,
        siteUrl: body.siteUrl,
        siteAciklama: body.siteAciklama,
        logoUrl: body.logoUrl,
        logoAltUrl: body.logoAltUrl,
        faviconUrl: body.faviconUrl,
        footerText: body.footerText,
        copyrightText: body.copyrightText,
        sosyalFacebook: body.sosyalFacebook,
        sosyalTwitter: body.sosyalTwitter,
        sosyalInstagram: body.sosyalInstagram,
        sosyalYoutube: body.sosyalYoutube,
        sosyalTiktok: body.sosyalTiktok,
        sosyalLinkedin: body.sosyalLinkedin,
        analyticsId: body.analyticsId,
        headerKod: body.headerKod,
        footerKod: body.footerKod,
        iletisimEmail: body.iletisimEmail,
        iletisimTelefon: body.iletisimTelefon,
        iletisimAdres: body.iletisimAdres,
      },
    });

    return NextResponse.json(updatedAyarlar);
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Ayarlar güncellenemedi' }, { status: 500 });
  }
}
