import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  const [haberler, kategoriler, yazarlar] = await Promise.all([
    prisma.haber.findMany({
      where: { durum: 'yayinda' },
      orderBy: { yayinTarihi: 'desc' },
      take: 10000,
      select: { slug: true, updatedAt: true },
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

  const now = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
${kategoriler.map(k => `  <url>
    <loc>${siteUrl}/kategori/${k.slug}</loc>
    <lastmod>${k.updatedAt.toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
${yazarlar.map(y => `  <url>
    <loc>${siteUrl}/yazar/${y.slug}</loc>
    <lastmod>${y.updatedAt.toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
${haberler.map(h => `  <url>
    <loc>${siteUrl}/haber/${h.slug}</loc>
    <lastmod>${h.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
