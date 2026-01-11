import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let kategoriler: { id: number; ad: string; slug: string; aktif: boolean; sira: number; resim: string | null; aciklama: string | null; createdAt: Date; updatedAt: Date; }[] = [];

  try {
    kategoriler = await prisma.kategori.findMany({
      where: { aktif: true },
      orderBy: { sira: 'asc' },
    });
  } catch {
    console.log('Kategoriler yuklenemedi, bos array kullaniliyor');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header kategoriler={kategoriler} />
      <main className="flex-1">
        {children}
      </main>
      <Footer kategoriler={kategoriler} />
    </div>
  );
}
