import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'Haber Sitesi - Son Dakika Haberler',
    template: '%s | Haber Sitesi',
  },
  description: 'En son haberler, son dakika gelişmeleri, gündem, spor, ekonomi ve daha fazlası.',
  keywords: ['haber', 'son dakika', 'güncel', 'türkiye', 'dünya'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/rss/feed.xml', title: 'RSS Feed' },
      ],
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Haber Sitesi',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Header ve Footer için kategorileri çek
  let kategoriler: { id: number; ad: string; slug: string; aktif: boolean; sira: number; resim: string | null; aciklama: string | null; createdAt: Date; updatedAt: Date; }[] = [];
  
  try {
    kategoriler = await prisma.kategori.findMany({
      where: { aktif: true },
      orderBy: { sira: 'asc' },
    });
  } catch {
    // Build time'da veritabanı yoksa boş array kullan
    console.log('Kategoriler yüklenemedi, boş array kullanılıyor');
  }

  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss/feed.xml" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body className={`${inter.className} bg-gray-100 min-h-screen flex flex-col`}>
        <Header kategoriler={kategoriler} />
        <main className="flex-1">
          {children}
        </main>
        <Footer kategoriler={kategoriler} />
      </body>
    </html>
  );
}
