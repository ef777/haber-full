import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const kategori = await prisma.kategori.findUnique({
    where: { slug, aktif: true },
  });

  if (!kategori) {
    return { title: 'Kategori Bulunamadı' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    title: `${kategori.ad} Haberleri`,
    description: kategori.aciklama || `${kategori.ad} kategorisindeki en güncel haberler`,
    openGraph: {
      title: `${kategori.ad} Haberleri`,
      description: kategori.aciklama || `${kategori.ad} kategorisindeki haberler`,
      url: `${siteUrl}/kategori/${kategori.slug}`,
    },
    alternates: {
      canonical: `${siteUrl}/kategori/${kategori.slug}`,
    },
  };
}

async function getKategoriler() {
  return prisma.kategori.findMany({
    where: { aktif: true },
    orderBy: { sira: 'asc' },
  });
}

export default async function KategoriPage({ params }: PageProps) {
  const { slug } = await params;
  
  const [kategori, kategoriler] = await Promise.all([
    prisma.kategori.findUnique({
      where: { slug, aktif: true },
    }),
    getKategoriler(),
  ]);

  if (!kategori) {
    notFound();
  }

  const haberler = await prisma.haber.findMany({
    where: { durum: 'yayinda', kategoriId: kategori.id },
    orderBy: { yayinTarihi: 'desc' },
    take: 20,
    include: { yazar: true },
  });

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{kategori.ad}</h1>
        {kategori.aciklama && (
          <p className="text-gray-600 dark:text-gray-400 mb-8">{kategori.aciklama}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {haberler.map((haber) => (
            <Link key={haber.id} href={`/haber/${haber.slug}`} className="group">
              <article className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow overflow-hidden">
                {haber.resim ? (
                  <img
                    src={haber.resim}
                    alt={haber.resimAlt || haber.baslik}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 dark:bg-[#1a1a1a] flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-400">Resim Yok</span>
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 line-clamp-2 mb-2">
                    {haber.baslik}
                  </h2>
                  {haber.spot && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">{haber.spot}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    {haber.yazar && <span>{haber.yazar.ad}</span>}
                    <time>{new Date(haber.yayinTarihi).toLocaleDateString('tr-TR')}</time>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {haberler.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            Bu kategoride henüz haber yok.
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-[#111] text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-400 dark:text-gray-300">
          <p>&copy; {new Date().getFullYear()} Haber Sitesi. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </>
  );
}
