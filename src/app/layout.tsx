import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

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
    default: `${siteName} - Guncel Haberler`,
    template: `%s | ${siteName}`,
  },
  description: 'Turkiye ve dunyadan son dakika haberleri, en guncel ekonomi verileri, spor sonuclari, teknoloji gelismeleri ve yasam haberleri. En dogru, hizli ve tarafsiz haber kaynagi Haber Portali ile gundemi takip edin.',
  keywords: [
    'haber', 'son dakika', 'gundem', 'turkiye haberleri', 'dunya haberleri',
    'ekonomi', 'spor', 'teknoloji', 'saglik', 'yasam', 'kultur sanat',
    'breaking news', 'guncel haberler', 'haber sitesi', 'gazete'
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
    title: `${siteName} - Guncel Haberler`,
    description: 'Turkiye ve dunyadan son dakika haberleri, ekonomi, spor ve teknoloji gelismeleri. En hizli ve guvenilir haber kaynagi.',
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
    title: `${siteName} - Guncel Haberler`,
    description: 'Turkiye ve dunyadan son dakika haberleri, ekonomi, spor ve teknoloji gelismeleri.',
    images: [`${siteUrl}/og-image.png`],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  manifest: '/site.webmanifest',
  category: 'news',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss/feed.xml" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="news-sitemap" type="application/xml" href="/news-sitemap.xml" />
        <meta name="google-news-keywords" content="haber, son dakika, gundem, turkiye, dunya, ekonomi, spor" />
        <meta name="news_keywords" content="haber, son dakika, gundem, turkiye, dunya, ekonomi, spor" />
      </head>
      <body className={`${inter.className} min-h-screen bg-[#0a0a0a] text-white`}>
        {children}
      </body>
    </html>
  );
}
