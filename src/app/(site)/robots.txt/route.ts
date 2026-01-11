import { NextResponse } from 'next/server';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/admin/

User-agent: Googlebot
Allow: /

User-agent: Googlebot-News
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/news-sitemap.xml`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
