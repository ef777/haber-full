import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { prisma } from '@/lib/prisma';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function getSiteSettings() {
  try {
    return await prisma.siteAyarlari.findFirst();
  } catch {
    return null;
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
};

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings();

  const siteName = siteSettings?.siteAdi || process.env.NEXT_PUBLIC_SITE_NAME || 'Haber Portali';
  const seoTitle = siteSettings?.seoBaslik || `${siteName} - Guncel Haberler`;
  const description = siteSettings?.siteAciklama || 'Turkiye ve dunyadan son dakika haberleri, en guncel ekonomi verileri, spor sonuclari, teknoloji gelismeleri ve yasam haberleri.';

  // Parse keywords from comma-separated string
  const keywordsFromDB = siteSettings?.seoKeywords
    ? siteSettings.seoKeywords.split(',').map(k => k.trim()).filter(Boolean)
    : [];

  const defaultKeywords = [
    'haber', 'son dakika', 'gundem', 'turkiye haberleri', 'dunya haberleri',
    'ekonomi', 'spor', 'teknoloji', 'saglik', 'yasam', 'kultur sanat',
    'breaking news', 'guncel haberler', 'haber sitesi', 'gazete'
  ];

  const keywords = keywordsFromDB.length > 0 ? keywordsFromDB : defaultKeywords;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: seoTitle,
      template: `%s | ${siteName}`,
    },
    description,
    keywords,
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
      title: seoTitle,
      description,
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
      title: seoTitle,
      description,
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
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Tema flash'ını önlemek için blocking script
  const themeScript = `
    (function() {
      try {
        var theme = localStorage.getItem('theme');
        if (!theme) theme = 'light';
        document.documentElement.classList.add(theme);
      } catch (e) {
        document.documentElement.classList.add('light');
      }
    })();
  `;

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss/feed.xml" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="news-sitemap" type="application/xml" href="/news-sitemap.xml" />
        <meta name="google-news-keywords" content="haber, son dakika, gundem, turkiye, dunya, ekonomi, spor" />
        <meta name="news_keywords" content="haber, son dakika, gundem, turkiye, dunya, ekonomi, spor" />
        <meta name="google-site-verification" content="KMRkj_Hcy4U7h8zCXi9QtNI6j9dTiGgCBbXuYe8dFi0" />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        {/* Google Analytics */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
