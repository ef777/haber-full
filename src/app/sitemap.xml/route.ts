import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export async function GET() {
  try {
    const [haberler, kategoriler, yazarlar] = await Promise.all([
      prisma.haber.findMany({
        where: { durum: 'yayinda' },
        select: { slug: true, updatedAt: true },
        orderBy: { yayinTarihi: 'desc' },
      }),
      prisma.kategori.findMany({
        where: { aktif: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.yazar.findMany({
        where: { aktif: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
${haberler
  .map(
    (h) => `  <url>
    <loc>${SITE_URL}/haber/${h.slug}</loc>
    <lastmod>${h.updatedAt.toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
${kategoriler
  .map(
    (k) => `  <url>
    <loc>${SITE_URL}/kategori/${k.slug}</loc>
    <lastmod>${k.updatedAt.toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join('\n')}
${yazarlar
  .map(
    (y) => `  <url>
    <loc>${SITE_URL}/yazar/${y.slug}</loc>
    <lastmod>${y.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    return new Response(emptySitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}
