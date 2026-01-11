import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const haber = await prisma.haber.findUnique({
    where: { slug },
    include: { kategori: true, yazar: true },
  });

  if (!haber) {
    return { title: 'Haber Bulunamadı' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    title: haber.seoBaslik || haber.baslik,
    description: haber.seoAciklama || haber.spot || haber.baslik,
    keywords: haber.seoKeywords || undefined,
    authors: haber.yazar ? [{ name: haber.yazar.ad }] : undefined,
    openGraph: {
      type: 'article',
      title: haber.baslik,
      description: haber.spot || '',
      url: `${siteUrl}/haber/${haber.slug}`,
      images: haber.resim ? [{ url: haber.resim, alt: haber.resimAlt || haber.baslik }] : [],
      publishedTime: haber.yayinTarihi.toISOString(),
      modifiedTime: haber.updatedAt.toISOString(),
      section: haber.kategori?.ad,
      authors: haber.yazar ? [haber.yazar.ad] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: haber.baslik,
      description: haber.spot || '',
      images: haber.resim ? [haber.resim] : [],
    },
    alternates: {
      canonical: `${siteUrl}/haber/${haber.slug}`,
    },
  };
}

async function getHaber(slug: string) {
  const haber = await prisma.haber.findUnique({
    where: { slug, durum: 'yayinda' },
    include: {
      kategori: true,
      yazar: true,
      etiketler: { include: { etiket: true } },
    },
  });

  if (haber) {
    await prisma.haber.update({
      where: { id: haber.id },
      data: { goruntulenme: { increment: 1 } },
    });
  }

  return haber;
}

async function getIlgiliHaberler(kategoriId: number | null, haberId: number) {
  if (!kategoriId) return [];

  return prisma.haber.findMany({
    where: {
      durum: 'yayinda',
      kategoriId,
      id: { not: haberId },
    },
    orderBy: { yayinTarihi: 'desc' },
    take: 4,
    include: { kategori: true },
  });
}

export default async function HaberPage({ params }: PageProps) {
  const { slug } = await params;
  const haber = await getHaber(slug);

  if (!haber) {
    notFound();
  }

  const ilgiliHaberler = await getIlgiliHaberler(haber.kategoriId, haber.id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Haber Sitesi';

  // Schema.org NewsArticle
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: haber.baslik,
    description: haber.spot || haber.baslik,
    image: haber.resim ? [haber.resim] : [],
    datePublished: haber.yayinTarihi.toISOString(),
    dateModified: haber.updatedAt.toISOString(),
    author: haber.yazar ? {
      '@type': 'Person',
      name: haber.yazar.ad,
      url: `${siteUrl}/yazar/${haber.yazar.slug}`,
    } : {
      '@type': 'Organization',
      name: siteName,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/haber/${haber.slug}`,
    },
    articleSection: haber.kategori?.ad,
    keywords: haber.etiketler.map(e => e.etiket.ad).join(', '),
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Ana Sayfa',
        item: siteUrl,
      },
      ...(haber.kategori ? [{
        '@type': 'ListItem',
        position: 2,
        name: haber.kategori.ad,
        item: `${siteUrl}/kategori/${haber.kategori.slug}`,
      }] : []),
      {
        '@type': 'ListItem',
        position: haber.kategori ? 3 : 2,
        name: haber.baslik,
        item: `${siteUrl}/haber/${haber.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2 text-gray-500">
            <li>
              <Link href="/" className="hover:text-red-600">Ana Sayfa</Link>
            </li>
            <li>/</li>
            {haber.kategori && (
              <>
                <li>
                  <Link href={`/kategori/${haber.kategori.slug}`} className="hover:text-red-600">
                    {haber.kategori.ad}
                  </Link>
                </li>
                <li>/</li>
              </>
            )}
            <li className="text-gray-900 truncate max-w-xs">{haber.baslik}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <header className="mb-6">
              <div className="flex gap-2 mb-4">
                {haber.sonDakika && (
                  <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium animate-pulse">
                    SON DAKIKA
                  </span>
                )}
                {haber.kategori && (
                  <Link
                    href={`/kategori/${haber.kategori.slug}`}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200"
                  >
                    {haber.kategori.ad}
                  </Link>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {haber.baslik}
              </h1>
              
              {haber.spot && (
                <p className="text-xl text-gray-600 mb-4 leading-relaxed">
                  {haber.spot}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-t border-b py-4">
                {haber.yazar && (
                  <Link href={`/yazar/${haber.yazar.slug}`} className="flex items-center gap-2 hover:text-red-600">
                    {haber.yazar.avatar ? (
                      <Image
                        src={haber.yazar.avatar}
                        alt={haber.yazar.ad}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                        {haber.yazar.ad.charAt(0)}
                      </div>
                    )}
                    <span>{haber.yazar.ad}</span>
                  </Link>
                )}
                <time dateTime={haber.yayinTarihi.toISOString()}>
                  {new Date(haber.yayinTarihi).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
                <span>{haber.goruntulenme} görüntülenme</span>
              </div>
            </header>

            {haber.resim && (
              <figure className="mb-6">
                <Image
                  src={haber.resim}
                  alt={haber.resimAlt || haber.baslik}
                  width={800}
                  height={450}
                  className="w-full rounded-lg"
                  priority
                />
                {haber.resimAlt && (
                  <figcaption className="text-sm text-gray-500 mt-2">
                    {haber.resimAlt}
                  </figcaption>
                )}
              </figure>
            )}

            <div
              className="prose prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: haber.icerik }}
            />

            {haber.video && (
              <div className="mb-8 aspect-video">
                <iframe
                  src={haber.video.replace('watch?v=', 'embed/')}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  title={haber.baslik}
                />
              </div>
            )}

            {haber.etiketler.length > 0 && (
              <div className="mb-8">
                <span className="text-sm font-semibold text-gray-500 mb-2 block">Etiketler:</span>
                <div className="flex flex-wrap gap-2">
                  {haber.etiketler.map(({ etiket }) => (
                    <span
                      key={etiket.id}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      #{etiket.ad}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <span className="text-sm font-semibold text-gray-500 mb-2 block">Paylaş:</span>
              <div className="flex gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${siteUrl}/haber/${haber.slug}`)}&text=${encodeURIComponent(haber.baslik)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                  X
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${siteUrl}/haber/${haber.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Facebook
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${haber.baslik} ${siteUrl}/haber/${haber.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  WhatsApp
                </a>
              </div>
            </div>

            {ilgiliHaberler.length > 0 && (
              <section className="border-t pt-8">
                <h2 className="text-2xl font-bold mb-6">İlgili Haberler</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ilgiliHaberler.map((ilgili) => (
                    <Link key={ilgili.id} href={`/haber/${ilgili.slug}`} className="flex gap-4 group">
                      {ilgili.resim ? (
                        <Image
                          src={ilgili.resim}
                          alt={ilgili.baslik}
                          width={120}
                          height={80}
                          className="w-28 h-20 object-cover rounded"
                        />
                      ) : (
                        <div className="w-28 h-20 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Resim yok</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-red-600 line-clamp-2">
                          {ilgili.baslik}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(ilgili.yayinTarihi).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Son Haberler</h3>
              <SonHaberlerWidget />
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}

async function SonHaberlerWidget() {
  const sonHaberler = await prisma.haber.findMany({
    where: { durum: 'yayinda' },
    orderBy: { yayinTarihi: 'desc' },
    take: 5,
  });

  return (
    <ul className="space-y-4">
      {sonHaberler.map((haber) => (
        <li key={haber.id}>
          <Link href={`/haber/${haber.slug}`} className="text-gray-700 hover:text-red-600 text-sm line-clamp-2">
            {haber.baslik}
          </Link>
          <span className="text-xs text-gray-400 block mt-1">
            {new Date(haber.yayinTarihi).toLocaleDateString('tr-TR')}
          </span>
        </li>
      ))}
    </ul>
  );
}
