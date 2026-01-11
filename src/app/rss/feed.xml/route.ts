import { prisma } from '@/lib/prisma';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

function escapeXml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const [haberler, siteAyarlari] = await Promise.all([
    prisma.haber.findMany({
      where: { durum: 'yayinda' },
      include: {
        kategori: true,
        yazar: true,
      },
      orderBy: { yayinTarihi: 'desc' },
      take: 50,
    }),
    prisma.siteAyarlari.findFirst(),
  ]);

  const siteName = siteAyarlari?.siteAdi || 'Haber Sitesi';
  const siteDescription = siteAyarlari?.siteAciklama || 'Turkiye ve dunyadan guncel haberler';

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>tr</language>
    <copyright>Copyright ${new Date().getFullYear()} ${escapeXml(siteName)}</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>5</ttl>
    <atom:link href="${SITE_URL}/rss/feed.xml" rel="self" type="application/rss+xml"/>
    <atom:link href="https://pubsubhubbub.appspot.com/" rel="hub"/>
    <generator>Next.js Haber Sitesi</generator>
${haberler
  .map((haber) => `
    <item>
      <title>${escapeXml(haber.baslik)}</title>
      <link>${SITE_URL}/haber/${haber.slug}</link>
      <description><![CDATA[${haber.spot || ''}]]></description>
      <pubDate>${new Date(haber.yayinTarihi).toUTCString()}</pubDate>
      <guid isPermaLink="true">${SITE_URL}/haber/${haber.slug}</guid>
      ${haber.kategori ? `<category>${escapeXml(haber.kategori.isim)}</category>` : ''}
      ${haber.yazar ? `<dc:creator>${escapeXml(haber.yazar.isim)}</dc:creator>` : ''}
      ${haber.kapakResmi ? `
      <media:content url="${haber.kapakResmi}" medium="image"/>
      <enclosure url="${haber.kapakResmi}" type="image/jpeg"/>` : ''}
    </item>`)
  .join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
