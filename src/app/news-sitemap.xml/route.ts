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
  const siteAyarlari = await prisma.siteAyarlari.findFirst();
  const siteName = siteAyarlari?.siteAdi || 'Haber Sitesi';

  // Son 48 saatteki haberler (Google News gerekliligi)
  const twoDaysAgo = new Date();
  twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

  const haberler = await prisma.haber.findMany({
    where: {
      durum: 'yayinda',
      yayinTarihi: { gte: twoDaysAgo },
    },
    include: {
      kategori: true,
    },
    orderBy: { yayinTarihi: 'desc' },
    take: 1000,
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${haberler
  .map((haber) => {
    const pubDate = new Date(haber.yayinTarihi).toISOString();
    const imageTag = haber.kapakResmi
      ? `
    <image:image>
      <image:loc>${escapeXml(haber.kapakResmi)}</image:loc>
      <image:title>${escapeXml(haber.baslik)}</image:title>
    </image:image>`
      : '';

    return `  <url>
    <loc>${SITE_URL}/haber/${haber.slug}</loc>
    <lastmod>${pubDate}</lastmod>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(siteName)}</news:name>
        <news:language>tr</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(haber.baslik)}</news:title>
      ${haber.newsKeywords ? `<news:keywords>${escapeXml(haber.newsKeywords)}</news:keywords>` : ''}
    </news:news>${imageTag}
  </url>`;
  })
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
