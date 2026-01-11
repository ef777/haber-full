import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Haber Portali';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Turkiye'nin Guncel Haber Kaynagi`,
    template: `%s | ${siteName}`,
  },
  description: 'Son dakika haberleri, gundem, ekonomi, spor, teknoloji ve dunya haberlerini aninda okuyun. Turkiye\'nin en hizli ve guvenilir haber portali.',
  keywords: [
    'haber', 'son dakika', 'gundem', 'turkiye haberleri', 'dunya haberleri',
    'ekonomi', 'spor', 'teknoloji', 'saglik', 'yasam', 'kultur sanat',
    'breaking news', 'guncel haberler', 'haber sitesi'
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
    types: {
      'application/rss+xml': [
        { url: '/rss/feed.xml', title: `${siteName} RSS` },
      ],
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
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
    url: siteUrl,
    siteName: siteName,
    title: `${siteName} - Turkiye'nin Guncel Haber Kaynagi`,
    description: 'Son dakika haberleri, gundem, ekonomi, spor ve daha fazlasi. Turkiye\'nin en hizli haber portali.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@haberportali',
    creator: '@haberportali',
    title: `${siteName} - Turkiye'nin Guncel Haber Kaynagi`,
    description: 'Son dakika haberleri, gundem, ekonomi, spor ve daha fazlasi.',
    images: [`${siteUrl}/og-image.png`],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  category: 'news',
};

export default async function RootLayout({
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
    <html lang="tr">
      <head>
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss/feed.xml" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="news-sitemap" type="application/xml" href="/news-sitemap.xml" />
        <meta name="google-news-keywords" content="haber, son dakika, gundem, turkiye, dunya, ekonomi, spor" />
        <meta name="news_keywords" content="haber, son dakika, gundem, turkiye, dunya, ekonomi, spor" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Header kategoriler={kategoriler} />
        <main className="flex-1">
          {children}
        </main>
        <Footer kategoriler={kategoriler} />
      </body>
    </html>
  );
}
