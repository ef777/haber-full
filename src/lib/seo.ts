const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Haber Sitesi';

// Haber tipi
export interface Haber {
  id: number;
  baslik: string;
  slug: string;
  spot?: string | null;
  icerik?: string | null;
  kapakResmi?: string | null;
  yayinTarihi: Date | string;
  newsKeywords?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  kategori?: { isim: string; slug: string } | null;
  yazar?: { isim: string; slug: string } | null;
  etiketler?: { etiket: { isim: string; slug: string } }[];
}

// Varsayilan SEO degerleri
export const defaultSEO = {
  title: SITE_NAME,
  description: 'Turkiye ve dunyadan son dakika haberler, guncel gelismeler',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: SITE_URL,
    siteName: SITE_NAME,
  },
};

// Haber detay sayfasi icin SEO
export function getHaberSEO(haber: Haber) {
  const url = `${SITE_URL}/haber/${haber.slug}`;
  
  return {
    title: haber.seoTitle || haber.baslik,
    description: haber.seoDescription || haber.spot || '',
    canonical: url,
    openGraph: {
      type: 'article',
      url,
      title: haber.baslik,
      description: haber.spot || '',
      images: haber.kapakResmi ? [
        {
          url: haber.kapakResmi,
          width: 1200,
          height: 630,
          alt: haber.baslik,
        },
      ] : [],
    },
  };
}

// WebSite Schema
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/arama?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Organization Schema
export function getOrganizationSchema(siteAyarlari?: {
  logo?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  email?: string | null;
  telefon?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: siteAyarlari?.logo || `${SITE_URL}/logo.png`,
    sameAs: [
      siteAyarlari?.facebook,
      siteAyarlari?.twitter,
      siteAyarlari?.instagram,
      siteAyarlari?.youtube,
    ].filter(Boolean),
    contactPoint: {
      '@type': 'ContactPoint',
      email: siteAyarlari?.email,
      telephone: siteAyarlari?.telefon,
      contactType: 'customer service',
    },
  };
}

// NewsArticle Schema (Google News icin kritik)
export function getNewsArticleSchema(haber: Haber) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/haber/${haber.slug}`,
    },
    headline: haber.baslik,
    description: haber.spot || '',
    image: haber.kapakResmi ? [haber.kapakResmi] : [],
    datePublished: haber.yayinTarihi,
    dateModified: haber.yayinTarihi,
    author: {
      '@type': 'Person',
      name: haber.yazar?.isim || 'Editor',
      url: haber.yazar ? `${SITE_URL}/yazar/${haber.yazar.slug}` : undefined,
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
        width: 600,
        height: 60,
      },
    },
    articleSection: haber.kategori?.isim,
    keywords: haber.newsKeywords || haber.etiketler?.map(e => e.etiket.isim).join(', '),
  };
}

// BreadcrumbList Schema
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
