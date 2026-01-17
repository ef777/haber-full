import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';

async function getSiteAyarlari() {
  try {
    let ayarlar = await prisma.siteAyarlari.findFirst();
    if (!ayarlar) {
      ayarlar = await prisma.siteAyarlari.create({
        data: {
          siteAdi: 'Haber Sitesi',
          siteAciklama: 'Turkiye ve dunyadan guncel haberler',
        },
      });
    }
    return ayarlar;
  } catch {
    return null;
  }
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let kategoriler: { id: number; ad: string; slug: string; aktif: boolean; sira: number; resim: string | null; aciklama: string | null; createdAt: Date; updatedAt: Date; }[] = [];
  let siteAyarlari = null;

  try {
    [kategoriler, siteAyarlari] = await Promise.all([
      prisma.kategori.findMany({
        where: { aktif: true },
        orderBy: { sira: 'asc' },
      }),
      getSiteAyarlari(),
    ]);
  } catch {
    console.log('Veriler yuklenemedi');
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Custom Header Code */}
      {siteAyarlari?.headerKod && (
        <div dangerouslySetInnerHTML={{ __html: siteAyarlari.headerKod }} />
      )}

      <Header kategoriler={kategoriler} siteAyarlari={siteAyarlari} />
      <main className="flex-1">
        {children}
      </main>
      <Footer kategoriler={kategoriler} siteAyarlari={siteAyarlari} />

      {/* Custom Footer Code */}
      {siteAyarlari?.footerKod && (
        <div dangerouslySetInnerHTML={{ __html: siteAyarlari.footerKod }} />
      )}
    </div>
  );
}