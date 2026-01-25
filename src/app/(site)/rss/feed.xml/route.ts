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

  // Site ayarlarını veritabanından çek
  const siteAyarlari = await prisma.siteAyarlari.findFirst();
  const siteName = siteAyarlari?.siteAdi || 'Haber Sitesi';
  const siteDescription = siteAyarlari?.siteAciklama || 'En son haberler, son dakika gelişmeleri';

  const haberler = await prisma.haber.findMany({
    where: { durum: 'yayinda' },
    orderBy: { yayinTarihi: 'desc' },
    take: 50,
    include: {
      kategori: { select: { ad: true } },
      yazar: { select: { ad: true } },
    },
  });

  const buildDate = new Date().toUTCString();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${siteName}</title>
    <link>${siteUrl}</link>
    <description>${siteDescription}</description>
    <language>tr</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/rss/feed.xml" rel="self" type="application/rss+xml"/>
    <atom:link href="https://pubsubhubbub.appspot.com" rel="hub"/>
    <image>
      <url>${siteUrl}/logo.png</url>
      <title>${siteName}</title>
      <link>${siteUrl}</link>
    </image>
${haberler.map(haber => `    <item>
      <title><![CDATA[${haber.baslik}]]></title>
      <link>${siteUrl}/haber/${escapeXml(haber.slug)}</link>
      <guid isPermaLink="true">${siteUrl}/haber/${escapeXml(haber.slug)}</guid>
      <pubDate>${haber.yayinTarihi.toUTCString()}</pubDate>
      <description><![CDATA[${haber.spot || haber.baslik}]]></description>
      ${haber.kategori ? `<category>${escapeXml(haber.kategori.ad)}</category>` : ''}
      ${haber.yazar ? `<dc:creator>${escapeXml(haber.yazar.ad)}</dc:creator>` : ''}
      ${haber.resim ? `<media:content url="${escapeXml(haber.resim)}" medium="image">
        <media:title><![CDATA[${haber.resimAlt || haber.baslik}]]></media:title>
      </media:content>
      <enclosure url="${escapeXml(haber.resim)}" type="image/jpeg"/>` : ''}
    </item>`).join('\n')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
