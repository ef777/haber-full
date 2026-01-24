import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ q?: string; sayfa?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  
  return {
    title: q ? `"${q}" Arama Sonuçları | ${process.env.NEXT_PUBLIC_SITE_NAME}` : `Arama | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: q ? `"${q}" araması için sonuçlar` : 'Haber ara',
    robots: { index: false, follow: true },
  };
}

export default async function AramaPage({ searchParams }: Props) {
  const { q, sayfa } = await searchParams;
  const query = q || '';
  const currentPage = parseInt(sayfa || '1');
  const perPage = 12;

  type HaberWithRelations = Awaited<ReturnType<typeof prisma.haber.findMany<{
    include: { kategori: true; yazar: true }
  }>>>[number];

  let haberler: HaberWithRelations[] = [];
  let totalCount = 0;

  if (query.length >= 2) {
    [haberler, totalCount] = await Promise.all([
      prisma.haber.findMany({
        where: {
          durum: 'yayinda',
          OR: [
            { baslik: { contains: query, mode: 'insensitive' } },
            { spot: { contains: query, mode: 'insensitive' } },
            { icerik: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          kategori: true,
          yazar: true,
        },
        orderBy: { yayinTarihi: 'desc' },
        skip: (currentPage - 1) * perPage,
        take: perPage,
      }),
      prisma.haber.count({
        where: {
          durum: 'yayinda',
          OR: [
            { baslik: { contains: query, mode: 'insensitive' } },
            { spot: { contains: query, mode: 'insensitive' } },
            { icerik: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);
  }

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Haber Ara</h1>

      {/* Arama Formu */}
      <form action="/arama" method="GET" className="mb-8">
        <div className="flex gap-2 max-w-xl">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Aramak istediğiniz kelimeyi yazın..."
            className="flex-1 px-4 py-3 border border-gray-200 dark:border-[#262626] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-[#141414] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            minLength={2}
            required
          />
          <button
            type="submit"
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Ara
          </button>
        </div>
      </form>

      {/* Sonuçlar */}
      {query && (
        <>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {totalCount > 0 ? (
              <>
                <span className="font-semibold">&ldquo;{query}&rdquo;</span> için{' '}
                <span className="font-semibold">{totalCount}</span> sonuç bulundu
              </>
            ) : (
              <>
                <span className="font-semibold">&ldquo;{query}&rdquo;</span> için sonuç bulunamadı
              </>
            )}
          </p>

          {haberler.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {haberler.map((haber) => (
                  <article
                    key={haber.id}
                    className="bg-white dark:bg-[#141414] rounded-lg border border-gray-200 dark:border-[#262626] overflow-hidden hover:border-gray-300 dark:hover:border-[#333] transition-all"
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
                        <div className="w-full h-48 bg-gray-100 dark:bg-[#0a0a0a] flex items-center justify-center">
                          <span className="text-gray-400 dark:text-gray-600">Resim yok</span>
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
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(haber.yayinTarihi).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <Link href={`/haber/${haber.slug}`}>
                        <h2 className="font-bold text-gray-900 dark:text-white hover:text-red-600 transition-colors line-clamp-2">
                          {haber.baslik}
                        </h2>
                      </Link>
                      {haber.spot && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                          {haber.spot}
                        </p>
                      )}
                        {haber.yazar && (
                        <Link
                          href={`/yazar/${haber.yazar.slug}`}
                          className="text-xs text-gray-400 dark:text-gray-500 mt-2 inline-block hover:text-red-600"
                        >
                          {haber.yazar.ad}
                        </Link>
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
                      href={`/arama?q=${encodeURIComponent(query)}&sayfa=${currentPage - 1}`}
                      className="px-4 py-2 bg-gray-100 dark:bg-[#141414] text-gray-700 dark:text-white rounded border border-gray-200 dark:border-[#262626] hover:bg-gray-200 dark:hover:bg-[#1a1a1a]"
                    >
                      ← Önceki
                    </Link>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 2
                    )
                    .map((page, index, array) => (
                      <span key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-400 dark:text-gray-500">...</span>
                        )}
                        <Link
                          href={`/arama?q=${encodeURIComponent(query)}&sayfa=${page}`}
                          className={`px-4 py-2 rounded border ${
                            page === currentPage
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-gray-100 dark:bg-[#141414] text-gray-700 dark:text-white border-gray-200 dark:border-[#262626] hover:bg-gray-200 dark:hover:bg-[#1a1a1a]'
                          }`}
                        >
                          {page}
                        </Link>
                      </span>
                    ))}

                  {currentPage < totalPages && (
                    <Link
                      href={`/arama?q=${encodeURIComponent(query)}&sayfa=${currentPage + 1}`}
                      className="px-4 py-2 bg-gray-100 dark:bg-[#141414] text-gray-700 dark:text-white rounded border border-gray-200 dark:border-[#262626] hover:bg-gray-200 dark:hover:bg-[#1a1a1a]"
                    >
                      Sonraki →
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      {!query && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-12">
          Arama yapmak için yukarıdaki kutuya en az 2 karakter yazın.
        </p>
      )}
    </main>
  );
}
