import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Haber Sitesi - Son Dakika Haberler, Güncel Haberler',
  description: 'En son haberler, son dakika gelişmeleri, gündem, spor, ekonomi ve daha fazlası. Türkiye ve dünya haberlerini anında okuyun.',
  openGraph: {
    title: 'Haber Sitesi - Son Dakika Haberler',
    description: 'Türkiye\'nin en güncel haber portalı',
    type: 'website',
  },
};

async function getMansetHaberler() {
  return prisma.haber.findMany({
    where: { durum: 'yayinda', manset: true },
    orderBy: { yayinTarihi: 'desc' },
    take: 5,
    include: { kategori: true, yazar: true },
  });
}

async function getSonHaberler() {
  return prisma.haber.findMany({
    where: { durum: 'yayinda' },
    orderBy: { yayinTarihi: 'desc' },
    take: 20,
    include: { kategori: true, yazar: true },
  });
}

async function getSonDakikaHaberler() {
  return prisma.haber.findMany({
    where: { durum: 'yayinda', sonDakika: true },
    orderBy: { yayinTarihi: 'desc' },
    take: 10,
    include: { kategori: true },
  });
}

async function getKategoriler() {
  return prisma.kategori.findMany({
    where: { aktif: true },
    orderBy: { sira: 'asc' },
    include: {
      haberler: {
        where: { durum: 'yayinda' },
        orderBy: { yayinTarihi: 'desc' },
        take: 4,
        include: { yazar: true },
      },
    },
  });
}

function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} dakika önce`;
  } else if (diffInHours < 24) {
    return `${diffInHours} saat önce`;
  } else if (diffInDays < 7) {
    return `${diffInDays} gün önce`;
  }
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export default async function HomePage() {
  const [mansetHaberler, sonHaberler, sonDakikaHaberler, kategoriler] = await Promise.all([
    getMansetHaberler(),
    getSonHaberler(),
    getSonDakikaHaberler(),
    getKategoriler(),
  ]);

  const anaHaber = mansetHaberler[0];
  const yanHaberler = mansetHaberler.slice(1, 3);
  const digerMansetler = mansetHaberler.slice(3, 5);

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Haber Sitesi',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/arama?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Haber Sitesi',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    logo: {
      '@type': 'ImageObject',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.png`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* SON DAKİKA BANNER */}
      {sonDakikaHaberler.length > 0 && (
        <div className="bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center py-2">
              <span className="bg-white text-red-600 px-3 py-1 rounded font-bold text-xs uppercase tracking-wider flex-shrink-0 mr-4 animate-pulse">
                Son Dakika
              </span>
              <div className="overflow-hidden flex-1">
                <div className="flex gap-8 animate-marquee whitespace-nowrap">
                  {sonDakikaHaberler.map((haber) => (
                    <Link
                      key={haber.id}
                      href={`/haber/${haber.slug}`}
                      className="hover:underline text-sm font-medium"
                    >
                      • {haber.baslik}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* ANA MANŞET ALANI */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Sol: Ana Haber */}
            {anaHaber && (
              <div className="lg:col-span-7">
                <article className="group relative bg-white rounded-lg shadow-md overflow-hidden">
                  <Link href={`/haber/${anaHaber.slug}`}>
                    <div className="relative aspect-[16/9]">
                      {anaHaber.resim ? (
                        <Image
                          src={anaHaber.resim}
                          alt={anaHaber.resimAlt || anaHaber.baslik}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-gray-500 text-lg">Haber Sitesi</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      
                      {anaHaber.kategori && (
                        <span className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded">
                          {anaHaber.kategori.ad}
                        </span>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight group-hover:text-red-300 transition-colors">
                          {anaHaber.baslik}
                        </h2>
                        {anaHaber.spot && (
                          <p className="text-gray-200 text-sm md:text-base line-clamp-2 mb-3">
                            {anaHaber.spot}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-gray-300 text-xs">
                          {anaHaber.yazar && (
                            <span className="font-medium">{anaHaber.yazar.ad}</span>
                          )}
                          <span>•</span>
                          <time>{formatTimeAgo(anaHaber.yayinTarihi)}</time>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              </div>
            )}

            {/* Sağ: Yan Haberler */}
            <div className="lg:col-span-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 h-full">
                {yanHaberler.map((haber) => (
                  <article key={haber.id} className="group bg-white rounded-lg shadow-md overflow-hidden">
                    <Link href={`/haber/${haber.slug}`} className="flex flex-row">
                      <div className="relative w-1/3 lg:w-2/5 aspect-[4/3] flex-shrink-0">
                        {haber.resim ? (
                          <Image
                            src={haber.resim}
                            alt={haber.resimAlt || haber.baslik}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-center">
                        {haber.kategori && (
                          <span className="text-red-600 text-xs font-semibold uppercase mb-1">
                            {haber.kategori.ad}
                          </span>
                        )}
                        <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-red-600 transition-colors line-clamp-3">
                          {haber.baslik}
                        </h3>
                        <time className="text-gray-500 text-xs mt-2">
                          {formatTimeAgo(haber.yayinTarihi)}
                        </time>
                      </div>
                    </Link>
                  </article>
                ))}
                
                {digerMansetler.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-200 pb-2">
                      Öne Çıkanlar
                    </h4>
                    <div className="space-y-3">
                      {digerMansetler.map((haber) => (
                        <Link key={haber.id} href={`/haber/${haber.slug}`} className="block group">
                          <h5 className="text-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors line-clamp-2">
                            {haber.baslik}
                          </h5>
                          <time className="text-xs text-gray-500">
                            {formatTimeAgo(haber.yayinTarihi)}
                          </time>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* KATEGORİ BAZLI HABERLER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {kategoriler.slice(0, 4).map((kategori) => (
              kategori.haberler.length > 0 && (
                <section key={kategori.id} className="mb-10">
                  <div className="flex items-center justify-between mb-4 border-b-2 border-gray-900 pb-2">
                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
                      {kategori.ad}
                    </h2>
                    <Link href={`/kategori/${kategori.slug}`} className="text-red-600 text-sm font-medium hover:text-red-700">
                      Tümünü Gör →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {kategori.haberler[0] && (
                      <article className="md:col-span-2 group">
                        <Link href={`/haber/${kategori.haberler[0].slug}`} className="flex flex-col md:flex-row gap-4">
                          <div className="relative w-full md:w-1/2 aspect-video rounded-lg overflow-hidden">
                            {kategori.haberler[0].resim ? (
                              <Image
                                src={kategori.haberler[0].resim}
                                alt={kategori.haberler[0].baslik}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200" />
                            )}
                          </div>
                          <div className="flex-1 py-2">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors mb-2 leading-tight">
                              {kategori.haberler[0].baslik}
                            </h3>
                            {kategori.haberler[0].spot && (
                              <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                                {kategori.haberler[0].spot}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {kategori.haberler[0].yazar && (
                                <>
                                  <span className="font-medium text-gray-700">{kategori.haberler[0].yazar.ad}</span>
                                  <span>•</span>
                                </>
                              )}
                              <time>{formatTimeAgo(kategori.haberler[0].yayinTarihi)}</time>
                            </div>
                          </div>
                        </Link>
                      </article>
                    )}

                    {kategori.haberler.slice(1).map((haber) => (
                      <article key={haber.id} className="group border-l-4 border-gray-200 hover:border-red-600 pl-4 transition-colors">
                        <Link href={`/haber/${haber.slug}`}>
                          <h4 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-1">
                            {haber.baslik}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {haber.yazar && (
                              <>
                                <span>{haber.yazar.ad}</span>
                                <span>•</span>
                              </>
                            )}
                            <time>{formatTimeAgo(haber.yayinTarihi)}</time>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                </section>
              )
            ))}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-md p-5 mb-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 border-b-2 border-red-600 pb-2 mb-4">
                Son Haberler
              </h3>
              <div className="space-y-4">
                {sonHaberler.slice(0, 8).map((haber, index) => (
                  <article key={haber.id} className="group flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <span className="text-2xl font-bold text-gray-300 group-hover:text-red-600 transition-colors">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <Link href={`/haber/${haber.slug}`}>
                        <h4 className="font-medium text-sm text-gray-800 group-hover:text-red-600 transition-colors line-clamp-2">
                          {haber.baslik}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        {haber.kategori && (
                          <span className="text-xs text-red-600 font-medium">{haber.kategori.ad}</span>
                        )}
                        <span className="text-xs text-gray-400">{formatTimeAgo(haber.yayinTarihi)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 text-white rounded-lg p-5">
              <h3 className="text-lg font-bold border-b border-gray-700 pb-2 mb-4">Kategoriler</h3>
              <div className="space-y-2">
                {kategoriler.map((kategori) => (
                  <Link
                    key={kategori.id}
                    href={`/kategori/${kategori.slug}`}
                    className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-800 transition-colors group"
                  >
                    <span className="font-medium group-hover:text-red-400 transition-colors">{kategori.ad}</span>
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                      {kategori.haberler.length}+
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* DAHA FAZLA KATEGORİ */}
        {kategoriler.slice(4).map((kategori) => (
          kategori.haberler.length > 0 && (
            <section key={kategori.id} className="mt-10 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  <span className="border-b-4 border-red-600 pb-1">{kategori.ad}</span>
                </h2>
                <Link href={`/kategori/${kategori.slug}`} className="text-red-600 text-sm font-medium hover:text-red-700">
                  Tümünü Gör →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kategori.haberler.map((haber) => (
                  <article key={haber.id} className="group">
                    <Link href={`/haber/${haber.slug}`}>
                      <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                        {haber.resim ? (
                          <Image src={haber.resim} alt={haber.baslik} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                        {haber.baslik}
                      </h3>
                      <time className="text-xs text-gray-500 mt-1 block">{formatTimeAgo(haber.yayinTarihi)}</time>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )
        ))}
      </main>
    </>
  );
}
