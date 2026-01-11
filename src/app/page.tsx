import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

// Type definitions
type Yazar = {
  id: number;
  ad: string;
  slug: string;
};

type Kategori = {
  id: number;
  ad: string;
  slug: string;
};

type Haber = {
  id: number;
  baslik: string;
  slug: string;
  spot: string | null;
  resim: string | null;
  resimAlt: string | null;
  yayinTarihi: Date;
  goruntulenme: number;
  kategori: Kategori | null;
  yazar?: Yazar | null;
};

type KategoriWithHaberler = Kategori & {
  haberler: (Omit<Haber, 'kategori'> & { yazar: Yazar | null })[];
};

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Haber Portali - Son Dakika Haberler, Guncel Haberler',
  description: 'En son haberler, son dakika gelismeleri, gundem, spor, ekonomi ve daha fazlasi. Turkiye ve dunya haberlerini aninda okuyun.',
  openGraph: {
    title: 'Haber Portali - Son Dakika Haberler',
    description: 'Turkiyenin en guncel haber portali',
    type: 'website',
  },
};

async function getMansetHaberler() {
  return prisma.haber.findMany({
    where: { durum: 'yayinda', manset: true },
    orderBy: { yayinTarihi: 'desc' },
    take: 6,
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
        take: 5,
        include: { yazar: true },
      },
    },
  });
}

async function getEnCokOkunanlar() {
  return prisma.haber.findMany({
    where: { durum: 'yayinda' },
    orderBy: { goruntulenme: 'desc' },
    take: 5,
    include: { kategori: true },
  });
}

function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} dk once`;
  } else if (diffInHours < 24) {
    return `${diffInHours} saat once`;
  } else if (diffInDays < 7) {
    return `${diffInDays} gun once`;
  }
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export default async function HomePage() {
  const [mansetHaberler, sonHaberler, sonDakikaHaberler, kategoriler, enCokOkunanlar] = await Promise.all([
    getMansetHaberler(),
    getSonHaberler(),
    getSonDakikaHaberler(),
    getKategoriler(),
    getEnCokOkunanlar(),
  ]);

  const anaHaber = mansetHaberler[0];
  const yanHaberler = mansetHaberler.slice(1, 4);
  const altMansetler = mansetHaberler.slice(4, 6);

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Haber Portali',
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
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Haber Portali',
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

      {/* SON DAKIKA BANNER */}
      {sonDakikaHaberler.length > 0 && (
        <div className="breaking-news-bar">
          <div className="container">
            <div className="flex items-center py-2.5">
              <span className="breaking-badge flex-shrink-0 mr-4 rounded">
                SON DAKIKA
              </span>
              <div className="overflow-hidden flex-1">
                <div className="flex gap-12 animate-marquee whitespace-nowrap">
                  {[...sonDakikaHaberler, ...sonDakikaHaberler].map((haber, i) => (
                    <Link
                      key={`${haber.id}-${i}`}
                      href={`/haber/${haber.slug}`}
                      className="hover:text-red-200 text-sm font-medium transition-colors"
                    >
                      {haber.baslik}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="container py-6">
        {/* ANA MANSET ALANI */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Sol: Ana Haber */}
            {anaHaber && (
              <div className="lg:col-span-8">
                <Link href={`/haber/${anaHaber.slug}`} className="group block">
                  <article className="featured-card relative aspect-[16/9] lg:aspect-[16/10]">
                    {anaHaber.resim ? (
                      <Image
                        src={anaHaber.resim}
                        alt={anaHaber.resimAlt || anaHaber.baslik}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <span className="text-gray-600 text-lg">Haber Portali</span>
                      </div>
                    )}
                    <div className="featured-card-overlay" />

                    <div className="featured-card-content">
                      {anaHaber.kategori && (
                        <span className="category-badge mb-3 inline-block">
                          {anaHaber.kategori.ad}
                        </span>
                      )}
                      <h1 className="featured-card-title group-hover:text-red-400 transition-colors">
                        {anaHaber.baslik}
                      </h1>
                      {anaHaber.spot && (
                        <p className="featured-card-excerpt line-clamp-2 mb-3 hidden md:block">
                          {anaHaber.spot}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-gray-400 text-sm">
                        {anaHaber.yazar && (
                          <span className="font-medium text-gray-300">{anaHaber.yazar.ad}</span>
                        )}
                        <span className="w-1 h-1 bg-gray-500 rounded-full" />
                        <time>{formatTimeAgo(anaHaber.yayinTarihi)}</time>
                      </div>
                    </div>
                  </article>
                </Link>
              </div>
            )}

            {/* Sag: Yan Haberler */}
            <div className="lg:col-span-4">
              <div className="grid grid-cols-1 gap-4 h-full">
                {yanHaberler.map((haber: Haber) => (
                  <Link key={haber.id} href={`/haber/${haber.slug}`} className="group">
                    <article className="side-card h-full">
                      <div className="side-card-media relative">
                        {haber.resim ? (
                          <Image
                            src={haber.resim}
                            alt={haber.resimAlt || haber.baslik}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800" />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        {haber.kategori && (
                          <span className="text-red-500 text-xs font-semibold uppercase mb-1">
                            {haber.kategori.ad}
                          </span>
                        )}
                        <h3 className="side-card-title group-hover:text-red-500 transition-colors line-clamp-2">
                          {haber.baslik}
                        </h3>
                        <time className="text-gray-500 text-xs mt-1">
                          {formatTimeAgo(haber.yayinTarihi)}
                        </time>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4'LU HABER SERIDI */}
        {altMansetler.length > 0 && (
          <section className="mb-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {sonHaberler.slice(0, 4).map((haber: Haber) => (
                <Link key={haber.id} href={`/haber/${haber.slug}`} className="group">
                  <article className="news-card">
                    <div className="news-card-media relative aspect-video">
                      {haber.resim ? (
                        <Image
                          src={haber.resim}
                          alt={haber.baslik}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800" />
                      )}
                      {haber.kategori && (
                        <span className="category-badge absolute top-2 left-2">
                          {haber.kategori.ad}
                        </span>
                      )}
                    </div>
                    <div className="news-card-body">
                      <h3 className="news-card-title text-sm line-clamp-2">
                        {haber.baslik}
                      </h3>
                      <div className="news-card-meta">
                        <time>{formatTimeAgo(haber.yayinTarihi)}</time>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* KATEGORI BAZLI HABERLER + SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Ana Icerik */}
          <div className="lg:col-span-8">
            {kategoriler.slice(0, 4).map((kategori: KategoriWithHaberler) => (
              kategori.haberler.length > 0 && (
                <section key={kategori.id} className="mb-10">
                  <div className="section-header">
                    <h2 className="section-title">{kategori.ad}</h2>
                    <Link href={`/kategori/${kategori.slug}`} className="section-link">
                      Tumunu Gor &rarr;
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Buyuk Haber */}
                    {kategori.haberler[0] && (
                      <div className="md:col-span-7">
                        <Link href={`/haber/${kategori.haberler[0].slug}`} className="group block">
                          <article className="news-card">
                            <div className="news-card-media relative aspect-video">
                              {kategori.haberler[0].resim ? (
                                <Image
                                  src={kategori.haberler[0].resim}
                                  alt={kategori.haberler[0].baslik}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-800" />
                              )}
                            </div>
                            <div className="news-card-body">
                              <h3 className="news-card-title text-lg font-bold line-clamp-2">
                                {kategori.haberler[0].baslik}
                              </h3>
                              {kategori.haberler[0].spot && (
                                <p className="news-card-excerpt line-clamp-2">
                                  {kategori.haberler[0].spot}
                                </p>
                              )}
                              <div className="news-card-meta">
                                {kategori.haberler[0].yazar && (
                                  <>
                                    <span className="text-gray-400">{kategori.haberler[0].yazar.ad}</span>
                                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                                  </>
                                )}
                                <time>{formatTimeAgo(kategori.haberler[0].yayinTarihi)}</time>
                              </div>
                            </div>
                          </article>
                        </Link>
                      </div>
                    )}

                    {/* Liste Haberler */}
                    <div className="md:col-span-5">
                      <div className="space-y-0">
                        {kategori.haberler.slice(1, 5).map((haber: Omit<Haber, 'kategori'> & { yazar: Yazar | null }, index: number) => (
                          <Link key={haber.id} href={`/haber/${haber.slug}`} className="group">
                            <article className="list-card">
                              <span className="list-card-number">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <div>
                                <h4 className="list-card-title line-clamp-2">
                                  {haber.baslik}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                  {haber.yazar && (
                                    <span>{haber.yazar.ad}</span>
                                  )}
                                  <time>{formatTimeAgo(haber.yayinTarihi)}</time>
                                </div>
                              </div>
                            </article>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )
            ))}

            {/* Ek Kategoriler - Grid */}
            {kategoriler.slice(4).map((kategori: KategoriWithHaberler) => (
              kategori.haberler.length > 0 && (
                <section key={kategori.id} className="mb-10">
                  <div className="section-header">
                    <h2 className="section-title">{kategori.ad}</h2>
                    <Link href={`/kategori/${kategori.slug}`} className="section-link">
                      Tumunu Gor &rarr;
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {kategori.haberler.slice(0, 4).map((haber: Omit<Haber, 'kategori'> & { yazar: Yazar | null }) => (
                      <Link key={haber.id} href={`/haber/${haber.slug}`} className="group">
                        <article className="news-card">
                          <div className="news-card-media relative aspect-video">
                            {haber.resim ? (
                              <Image
                                src={haber.resim}
                                alt={haber.baslik}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-800" />
                            )}
                          </div>
                          <div className="news-card-body p-3">
                            <h3 className="news-card-title text-sm line-clamp-2">
                              {haber.baslik}
                            </h3>
                            <time className="text-xs text-gray-500 mt-2 block">
                              {formatTimeAgo(haber.yayinTarihi)}
                            </time>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                </section>
              )
            ))}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Son Haberler */}
              <div className="sidebar-widget">
                <h3 className="sidebar-title">Son Haberler</h3>
                <div className="space-y-0">
                  {sonHaberler.slice(4, 12).map((haber: Haber, index: number) => (
                    <Link key={haber.id} href={`/haber/${haber.slug}`} className="group">
                      <article className="list-card">
                        <span className="list-card-number">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <h4 className="list-card-title line-clamp-2 text-sm">
                            {haber.baslik}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {haber.kategori && (
                              <span className="text-xs text-red-500 font-medium">{haber.kategori.ad}</span>
                            )}
                            <span className="text-xs text-gray-500">{formatTimeAgo(haber.yayinTarihi)}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>

              {/* En Cok Okunanlar */}
              <div className="sidebar-widget">
                <h3 className="sidebar-title">En Cok Okunan</h3>
                <div className="space-y-4">
                  {enCokOkunanlar.map((haber: Haber, index: number) => (
                    <Link key={haber.id} href={`/haber/${haber.slug}`} className="group flex gap-3">
                      <div className="relative w-20 h-14 rounded overflow-hidden flex-shrink-0">
                        {haber.resim ? (
                          <Image
                            src={haber.resim}
                            alt={haber.baslik}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-300 group-hover:text-red-500 transition-colors line-clamp-2">
                          {haber.baslik}
                        </h4>
                        {haber.kategori && (
                          <span className="text-xs text-gray-500 mt-1 block">{haber.kategori.ad}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Kategoriler */}
              <div className="sidebar-widget">
                <h3 className="sidebar-title">Kategoriler</h3>
                <div className="space-y-1">
                  {kategoriler.map((kategori: KategoriWithHaberler) => (
                    <Link
                      key={kategori.id}
                      href={`/kategori/${kategori.slug}`}
                      className="category-item"
                    >
                      <span>{kategori.ad}</span>
                      <span className="category-count">{kategori.haberler.length}+</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trend Konular */}
              <div className="sidebar-widget">
                <h3 className="sidebar-title">Trend Konular</h3>
                <div className="trending-tags">
                  <Link href="/arama?q=ekonomi" className="trend-tag">#Ekonomi</Link>
                  <Link href="/arama?q=spor" className="trend-tag">#Spor</Link>
                  <Link href="/arama?q=teknoloji" className="trend-tag">#Teknoloji</Link>
                  <Link href="/arama?q=dunya" className="trend-tag">#Dunya</Link>
                  <Link href="/arama?q=saglik" className="trend-tag">#Saglik</Link>
                  <Link href="/arama?q=egitim" className="trend-tag">#Egitim</Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
