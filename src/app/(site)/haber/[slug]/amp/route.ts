import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// HTML icindeki img etiketlerini amp-img'ye donusturme
function convertToAmpImg(html: string) {
  if (!html) return '';
  return html.replace(
    /<img([^>]*)src="([^"]*)"([^>]*)>/gi,
    (match, p1, src, p3) => {
      // Genislik ve yukseklik yoksa varsayilan degerler ata (AMP zorunlu kilar)
      let width = '800';
      let height = '450';
      
      if (match.includes('width=')) {
        const wMatch = match.match(/width="(\d+)"/);
        if (wMatch) width = wMatch[1];
      }
      if (match.includes('height=')) {
        const hMatch = match.match(/height="(\d+)"/);
        if (hMatch) height = hMatch[1];
      }

      return `<amp-img src="${src}" width="${width}" height="${height}" layout="responsive" ${p1} ${p3}></amp-img>`;
    }
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Haber Portali';

  const haber = await prisma.haber.findUnique({
    where: { slug },
    include: {
      kategori: true,
      yazar: true,
    },
  });

  if (!haber) {
    return new NextResponse('Haber bulunamadi', { status: 404 });
  }

  // Icerigi AMP uyumlu hale getir
  const ampContent = convertToAmpImg(haber.icerik || '');
  const publishedTime = haber.yayinTarihi.toISOString();
  const modifiedTime = haber.updatedAt.toISOString();

  // JSON-LD Schema (Ana sayfadaki ile ayni ama HTML icine gomulu)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: haber.baslik,
    description: haber.spot || haber.baslik,
    image: haber.resim ? [haber.resim] : [],
    datePublished: publishedTime,
    dateModified: modifiedTime,
    author: haber.yazar ? {
      '@type': 'Person',
      name: haber.yazar.ad
    } : {
      '@type': 'Organization',
      name: siteName
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`
      }
    }
  };

  const html = `
<!doctype html>
<html amp lang="tr">
  <head>
    <meta charset="utf-8">
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <title>${haber.baslik} - ${siteName}</title>
    <link rel="canonical" href="${siteUrl}/haber/${haber.slug}">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <meta name="description" content="${haber.spot || ''}">
    <script type="application/ld+json">
      ${JSON.stringify(schema)}
    </script>
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
    <style amp-custom>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background-color: #0a0a0a;
        color: #e5e5e5;
        line-height: 1.6;
        margin: 0;
        padding: 0;
      }
      header {
        background: #111;
        border-bottom: 1px solid #333;
        padding: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .brand {
        color: white;
        font-weight: 900;
        text-decoration: none;
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .brand span {
        background: #dc2626;
        padding: 2px 6px;
        border-radius: 2px;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
      }
      h1 {
        font-size: 1.8rem;
        line-height: 1.3;
        margin-bottom: 1rem;
        color: white;
      }
      .meta {
        font-size: 0.85rem;
        color: #888;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid #333;
        padding-bottom: 1rem;
      }
      .featured-image {
        margin-bottom: 1.5rem;
      }
      .content {
        font-size: 1.1rem;
        line-height: 1.8;
      }
      .content p {
        margin-bottom: 1.2rem;
      }
      .content a {
        color: #dc2626;
      }
      footer {
        text-align: center;
        padding: 2rem;
        color: #666;
        font-size: 0.9rem;
        border-top: 1px solid #333;
        margin-top: 2rem;
      }
      .read-more {
        display: block;
        background: #dc2626;
        color: white;
        text-align: center;
        padding: 1rem;
        text-decoration: none;
        font-weight: bold;
        border-radius: 4px;
        margin-top: 2rem;
      }
    </style>
  </head>
  <body>
    <header>
      <a href="${siteUrl}" class="brand">
        <span>HABER</span> PORTALI
      </a>
    </header>

    <div class="container">
      <h1>${haber.baslik}</h1>
      
      <div class="meta">
        ${haber.kategori ? `<span>${haber.kategori.ad}</span> • ` : ''}
        <span>${new Date(haber.yayinTarihi).toLocaleDateString('tr-TR')}</span>
        ${haber.yazar ? ` • ${haber.yazar.ad}` : ''}
      </div>

      ${haber.resim ? `
        <div class="featured-image">
          <amp-img 
            src="${haber.resim}" 
            width="1200" 
            height="675" 
            layout="responsive"
            alt="${haber.resimAlt || haber.baslik}">
          </amp-img>
        </div>
      ` : ''}

      <div class="content">
        ${haber.spot ? `<p><strong>${haber.spot}</strong></p>` : ''}
        ${ampContent}
      </div>

      <a href="${siteUrl}/haber/${haber.slug}" class="read-more">
        Haberin Devamını Web Sitesinde Oku
      </a>
    </div>

    <footer>
      &copy; ${new Date().getFullYear()} ${siteName}
    </footer>
  </body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
