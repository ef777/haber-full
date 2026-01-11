const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export async function GET() {
  const robotsTxt = `# Haber Sitesi Robots.txt
User-agent: *
Allow: /

# Sitemaps
Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/news-sitemap.xml

# Googlebot News
User-agent: Googlebot-News
Allow: /

# Disallow admin
User-agent: *
Disallow: /admin/
Disallow: /api/admin/
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
