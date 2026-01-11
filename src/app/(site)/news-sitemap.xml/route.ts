import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  // Son 48 saatteki haberler (Google News gereksinimi)
  const twoDaysAgo = new Date();
  twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

  const haberler = await prisma.haber.findMany({
    where: {
      durum: 'yayinda',
      yayinTarihi: { gte: twoDaysAgo },
    },
    orderBy: { yayinTarihi: 'desc' },
    take: 1000,
    include: {
      kategori: { select: { ad: true } },
      etiketler: { include: { etiket: { select: { ad: true } } } },
    },
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${haberler.map(haber => `  <url>
    <loc>${siteUrl}/haber/${escapeXml(haber.slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>Haber Sitesi</news:name>
        <news:language>tr</news:language>
      </news:publication>
      <news:publication_date>${haber.yayinTarihi.toISOString()}</news:publication_date>
      <news:title><![CDATA[${haber.baslik}]]></news:title>
      ${haber.kategori ? `<news:keywords>${escapeXml(haber.kategori.ad)}${haber.etiketler.length > 0 ? ', ' + haber.etiketler.map(e => escapeXml(e.etiket.ad)).join(', ') : ''}</news:keywords>` : ''}
    </news:news>
    ${haber.resim ? `<image:image>
      <image:loc>${escapeXml(haber.resim)}</image:loc>
      <image:title><![CDATA[${haber.resimAlt || haber.baslik}]]></image:title>
    </image:image>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
