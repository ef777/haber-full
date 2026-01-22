export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sayfa?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const yazar = await prisma.yazar.findUnique({
    where: { slug },
  });

  if (!yazar) {
    return { title: 'Yazar Bulunamadı' };
  }

  return {
    title: `${yazar.ad} - Yazıları | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: yazar.biyografi || `${yazar.ad} tarafından yazılan tüm haberler`,
    openGraph: {
      title: `${yazar.ad} - Yazıları`,
      description: yazar.biyografi || `${yazar.ad} tarafından yazılan tüm haberler`,
      type: 'profile',
      images: yazar.avatar ? [yazar.avatar] : [],
    },
  };
}

export default async function YazarPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sayfa } = await searchParams;
  const currentPage = parseInt(sayfa || '1');
  const perPage = 12;

  const yazar = await prisma.yazar.findUnique({
    where: { slug },
  });

  if (!yazar) {
    notFound();
  }

  const [haberler, totalCount] = await Promise.all([
    prisma.haber.findMany({
      where: {
        yazarId: yazar.id,
        durum: 'yayinda',
      },
      include: {
        kategori: true,
      },
      orderBy: { yayinTarihi: 'desc' },
      skip: (currentPage - 1) * perPage,
      take: perPage,
    }),
    prisma.haber.count({
      where: {
        yazarId: yazar.id,
        durum: 'yayinda',
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / perPage);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: yazar.ad,
    description: yazar.biyografi,
    image: yazar.avatar,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/yazar/${yazar.slug}`,
    sameAs: [yazar.twitter, yazar.linkedin, yazar.website].filter(Boolean),
    jobTitle: 'Yazar',
    worksFor: {
      '@type': 'Organization',
      name: process.env.NEXT_PUBLIC_SITE_NAME,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Yazar Profil */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {yazar.avatar ? (
              <Image
                src={yazar.avatar}
                alt={yazar.ad}
                width={150}
                height={150}
                className="rounded-full object-cover"
                unoptimized={yazar.avatar.includes('/uploads/')}
              />
            ) : (
              <div className="w-36 h-36 bg-gray-200 dark:bg-[#1a1a1a] rounded-full flex items-center justify-center text-4xl text-gray-500 dark:text-gray-400">
                {yazar.ad.charAt(0)}
              </div>
            )}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{yazar.ad}</h1>
              {yazar.biyografi && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">{yazar.biyografi}</p>
              )}
              <div className="flex gap-4 justify-center md:justify-start">
                {yazar.twitter && (
                  <a
                    href={yazar.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                )}
                {yazar.linkedin && (
                  <a
                    href={yazar.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-800"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                )}
                {yazar.website && (
                  <a
                    href={yazar.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </a>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">
                Toplam <span className="font-semibold">{totalCount}</span> haber yazıldı
              </p>
            </div>
          </div>
        </div>

        {/* Haberler */}
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{yazar.ad} Yazıları</h2>

        {haberler.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-12">
            Bu yazara ait haber bulunamadı.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {haberler.map((haber) => (
                <article
                  key={haber.id}
                  className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <Link href={`/haber/${haber.slug}`}>
                    {haber.resim ? (
                      <Image
                        src={haber.resim}
                        alt={haber.baslik}
                        width={400}
                        height={225}
                        className="w-full h-48 object-cover"
                        unoptimized={haber.resim.includes('/uploads/')}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 dark:bg-[#1a1a1a] flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-400">Resim yok</span>
                      </div>
                    )}
                  </Link>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {haber.kategori && (
                        <Link
                          href={`/kategori/${haber.kategori.slug}`}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                        >
                          {haber.kategori.ad}
                        </Link>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(haber.yayinTarihi).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <Link href={`/haber/${haber.slug}`}>
                      <h3 className="font-bold text-gray-900 dark:text-white hover:text-red-600 transition-colors line-clamp-2">
                        {haber.baslik}
                      </h3>
                    </Link>
                    {haber.spot && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                        {haber.spot}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {currentPage > 1 && (
                  <Link
                    href={`/yazar/${slug}?sayfa=${currentPage - 1}`}
                    className="px-4 py-2 bg-gray-200 dark:bg-[#1a1a1a] text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-[#262626]"
                  >
                    ← Önceki
                  </Link>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 2
                  )
                  .map((page, index, array) => (
                    <span key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-600 dark:text-gray-400">...</span>
                      )}
                      <Link
                        href={`/yazar/${slug}?sayfa=${page}`}
                        className={`px-4 py-2 rounded ${
                          page === currentPage
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 dark:bg-[#1a1a1a] text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-[#262626]'
                        }`}
                      >
                        {page}
                      </Link>
                    </span>
                  ))}

                {currentPage < totalPages && (
                  <Link
                    href={`/yazar/${slug}?sayfa=${currentPage + 1}`}
                    className="px-4 py-2 bg-gray-200 dark:bg-[#1a1a1a] text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-[#262626]"
                  >
                    Sonraki →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
