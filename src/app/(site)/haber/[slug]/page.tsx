import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import NextNewsLoader from '@/components/NextNewsLoader';

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
    other: {
      amphtml: `${siteUrl}/haber/${haber.slug}/amp`,
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
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Haber Portali';

  // Schema.org NewsArticle - Google News Uyumlu
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/haber/${haber.slug}`,
    },
    headline: haber.baslik,
    description: haber.spot || haber.baslik,
    image: haber.resim ? [haber.resim] : [],
    datePublished: haber.yayinTarihi.toISOString(), // ISO 8601 formatı
    dateModified: haber.updatedAt.toISOString(),    // Güncelleme tarihi şart
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
        width: 600,
        height: 60,
      },
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

      <article className="container mx-auto px-4 py-8" data-main-article>
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2 text-gray-500">
            <li>
              <Link href="/" className="hover:text-red-500">Ana Sayfa</Link>
            </li>
            <li className="text-gray-600">/</li>
            {haber.kategori && (
              <>
                <li>
                  <Link href={`/kategori/${haber.kategori.slug}`} className="hover:text-red-500">
                    {haber.kategori.ad}
                  </Link>
                </li>
                <li className="text-gray-600">/</li>
              </>
            )}
            <li className="text-gray-300 truncate max-w-xs">{haber.baslik}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <header className="mb-6">
              <div className="flex gap-2 mb-4">
                {haber.sonDakika && (
                  <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold animate-pulse shadow-red-900/50 shadow-lg">
                    SON DAKİKA
                  </span>
                )}
                {haber.kategori && (
                  <Link
                    href={`/kategori/${haber.kategori.slug}`}
                    className="bg-[#262626] text-gray-300 border border-[#333] px-3 py-1 rounded text-sm hover:bg-[#333] hover:text-white transition-colors"
                  >
                    {haber.kategori.ad}
                  </Link>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
                {haber.baslik}
              </h1>
              
              {haber.spot && (
                <p className="text-xl md:text-2xl text-gray-400 mb-6 leading-relaxed font-light">
                  {haber.spot}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500 border-t border-b border-[#262626] py-4">
                <div className="flex items-center gap-4">
                    {haber.yazar && (
                    <Link href={`/yazar/${haber.yazar.slug}`} className="flex items-center gap-2 hover:text-red-500 group transition-colors">
                        {haber.yazar.avatar ? (
                        <Image
                            src={haber.yazar.avatar}
                            alt={haber.yazar.ad}
                            width={40}
                            height={40}
                            className="rounded-full ring-2 ring-[#262626] group-hover:ring-red-500 transition-all"
                        />
                        ) : (
                        <div className="w-10 h-10 bg-[#262626] rounded-full flex items-center justify-center text-sm font-bold text-gray-300 group-hover:bg-red-600 group-hover:text-white transition-colors">
                            {haber.yazar.ad.charAt(0)}
                        </div>
                        )}
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-300 group-hover:text-red-500 transition-colors">{haber.yazar.ad}</span>
                            <span className="text-xs">Editör</span>
                        </div>
                    </Link>
                    )}
                </div>
                <div className="flex flex-col text-right">
                    <time dateTime={haber.yayinTarihi.toISOString()} className="text-gray-400 font-medium">
                    {new Date(haber.yayinTarihi).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                    </time>
                    <span className="text-xs text-gray-600">Güncelleme: {new Date(haber.updatedAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            </header>

            {haber.resim && (
              <figure className="mb-8 relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={haber.resim}
                  alt={haber.resimAlt || haber.baslik}
                  fill
                  className="object-cover"
                  priority
                  unoptimized={haber.resim.includes('/uploads/')}
                />
                {haber.resimAlt && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2">
                    <figcaption className="text-sm text-gray-300 text-center">
                        {haber.resimAlt}
                    </figcaption>
                  </div>
                )}
              </figure>
            )}

            <div
              className="prose prose-lg prose-invert max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: haber.icerik }}
            />
            
            {/* Haberin Devami / Read Next Simulation */}
            {ilgiliHaberler.length > 0 && (
                <div className="my-8 p-6 bg-[#111] border-l-4 border-red-600 rounded-r-lg">
                    <p className="text-gray-400 text-sm font-bold uppercase mb-2">SIRADAKİ HABER</p>
                    <Link href={`/haber/${ilgiliHaberler[0].slug}`} className="text-xl font-bold text-white hover:text-red-500 transition-colors block">
                        {ilgiliHaberler[0].baslik} &rarr;
                    </Link>
                </div>
            )}

            {haber.video && (
              <div className="mb-8 aspect-video rounded-lg overflow-hidden border border-[#262626]">
                <iframe
                  src={haber.video.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                  title={haber.baslik}
                />
              </div>
            )}

            {haber.etiketler.length > 0 && (
              <div className="mb-8">
                <span className="text-sm font-semibold text-gray-500 mb-2 block uppercase tracking-wider">Etiketler:</span>
                <div className="flex flex-wrap gap-2">
                  {haber.etiketler.map(({ etiket }) => (
                    <span
                      key={etiket.id}
                      className="bg-[#1a1a1a] text-gray-400 border border-[#333] px-3 py-1 rounded-full text-sm hover:text-white hover:border-red-600 transition-all cursor-pointer"
                    >
                      #{etiket.ad}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8 p-6 bg-[#111] rounded-lg border border-[#262626]">
              <span className="text-sm font-bold text-white mb-4 block uppercase tracking-wider">Haberi Paylaş:</span>
              <div className="flex gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${siteUrl}/haber/${haber.slug}`)}&text=${encodeURIComponent(haber.baslik)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black text-white px-6 py-3 rounded-lg hover:bg-[#1DA1F2] transition-colors flex-1 text-center font-medium border border-[#333]"
                >
                  X
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${siteUrl}/haber/${haber.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1877F2] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex-1 text-center font-medium"
                >
                  Facebook
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${haber.baslik} ${siteUrl}/haber/${haber.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex-1 text-center font-medium"
                >
                  WhatsApp
                </a>
              </div>
            </div>

            {ilgiliHaberler.length > 0 && (
              <section className="border-t border-[#262626] pt-8">
                <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-red-600 pl-4">İlgili Haberler</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ilgiliHaberler.map((ilgili) => (
                    <Link key={ilgili.id} href={`/haber/${ilgili.slug}`} className="flex gap-4 group bg-[#111] p-3 rounded-lg border border-[#262626] hover:border-red-600/50 transition-all">
                      {ilgili.resim ? (
                        <Image
                          src={ilgili.resim}
                          alt={ilgili.baslik}
                          width={120}
                          height={80}
                          className="w-28 h-20 object-cover rounded"
                          unoptimized={ilgili.resim.includes('/uploads/')}
                        />
                      ) : (
                        <div className="w-28 h-20 bg-[#262626] rounded flex items-center justify-center">
                          <span className="text-gray-500 text-xs">Resim yok</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-200 group-hover:text-red-500 line-clamp-2 transition-colors">
                          {ilgili.baslik}
                        </h3>
                        <span className="text-xs text-gray-500 mt-2 block">
                          {new Date(ilgili.yayinTarihi).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Sonsuz Akış - Sonraki Haberler */}
            <NextNewsLoader currentHaberId={haber.id} currentSlug={haber.slug} />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-[#111] border border-[#262626] rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 border-b border-[#262626] pb-3 uppercase tracking-wider">
                <span className="border-b-2 border-red-600 pb-3">Son Haberler</span>
              </h3>
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
    <ul className="space-y-6">
      {sonHaberler.map((haber) => (
        <li key={haber.id} className="group">
          <Link href={`/haber/${haber.slug}`} className="block">
            <span className="text-gray-300 group-hover:text-red-500 text-sm font-medium line-clamp-2 transition-colors leading-snug">
              {haber.baslik}
            </span>
            <span className="text-xs text-gray-600 block mt-2">
              {new Date(haber.yayinTarihi).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}