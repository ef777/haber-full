"use client";

import Link from 'next/link';
import Image from 'next/image';
import ReklamWidget from './ReklamWidget';

type Kategori = {
  id: number;
  ad: string;
  slug: string;
};

type SiteAyarlari = {
  siteAdi: string;
  logoUrl: string | null;
  logoAltUrl: string | null;
  footerText: string | null;
  copyrightText: string | null;
  sosyalTwitter: string | null;
  sosyalFacebook: string | null;
  sosyalInstagram: string | null;
  sosyalYoutube: string | null;
  iletisimEmail: string | null;
  iletisimTelefon: string | null;
};

// SVG Icons
const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const RssIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11a9 9 0 0 1 9 9"/>
    <path d="M4 4a16 16 0 0 1 16 16"/>
    <circle cx="5" cy="19" r="1"/>
  </svg>
);

export default function Footer({ kategoriler, siteAyarlari }: { kategoriler?: Kategori[]; siteAyarlari?: SiteAyarlari | null }) {
  const currentYear = new Date().getFullYear();
  const footerLogo = siteAyarlari?.logoAltUrl || siteAyarlari?.logoUrl;

  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] mt-16 pt-16 pb-8 transition-colors duration-300">
      {/* Ana Footer */}
      <div className="container">
        {/* Footer Reklam */}
        <ReklamWidget konum="footer" className="mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Kolon 1: Marka */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              {footerLogo ? (
                <Image
                  src={footerLogo}
                  alt={siteAyarlari?.siteAdi || 'Logo'}
                  width={180}
                  height={50}
                  className="h-[40px] w-auto object-contain"
                  unoptimized={footerLogo.includes('/uploads/')}
                />
              ) : (
                <>
                  <div className="bg-red-600 text-white font-black text-xl px-2 py-1 transform -skew-x-12 group-hover:bg-red-700 transition-colors">
                    HABER
                  </div>
                  <div className="text-[var(--text-primary)] font-bold text-lg tracking-tighter transition-colors duration-300">
                    PORTALI
                  </div>
                </>
              )}
            </Link>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6 transition-colors duration-300">
              {siteAyarlari?.footerText || 'Türkiye ve dünya gündeminden en son haberler, son dakika gelişmeler, ekonomi, spor, teknoloji ve daha fazlası en doğru ve tarafsız kaynakta.'}
            </p>
            <div className="flex items-center gap-3">
              {siteAyarlari?.sosyalTwitter && (
                <a href={siteAyarlari.sosyalTwitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-primary)] hover:text-[#1DA1F2] hover:border-[#1DA1F2] transition-all" aria-label="Twitter">
                  <TwitterIcon />
                </a>
              )}
              {siteAyarlari?.sosyalFacebook && (
                <a href={siteAyarlari.sosyalFacebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-primary)] hover:text-[#1877F2] hover:border-[#1877F2] transition-all" aria-label="Facebook">
                  <FacebookIcon />
                </a>
              )}
              {siteAyarlari?.sosyalInstagram && (
                <a href={siteAyarlari.sosyalInstagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-primary)] hover:text-[#E4405F] hover:border-[#E4405F] transition-all" aria-label="Instagram">
                  <InstagramIcon />
                </a>
              )}
              {siteAyarlari?.sosyalYoutube && (
                <a href={siteAyarlari.sosyalYoutube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-primary)] hover:text-[#FF0000] hover:border-[#FF0000] transition-all" aria-label="YouTube">
                  <YoutubeIcon />
                </a>
              )}
              {!siteAyarlari?.sosyalTwitter && !siteAyarlari?.sosyalFacebook && !siteAyarlari?.sosyalInstagram && !siteAyarlari?.sosyalYoutube && (
                <>
                  <a href="#" className="w-8 h-8 flex items-center justify-center rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-primary)] hover:text-[#1DA1F2] hover:border-[#1DA1F2] transition-all" aria-label="Twitter">
                    <TwitterIcon />
                  </a>
                  <a href="#" className="w-8 h-8 flex items-center justify-center rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-primary)] hover:text-[#1877F2] hover:border-[#1877F2] transition-all" aria-label="Facebook">
                    <FacebookIcon />
                  </a>
                  <a href="#" className="w-8 h-8 flex items-center justify-center rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-primary)] hover:text-[#E4405F] hover:border-[#E4405F] transition-all" aria-label="Instagram">
                    <InstagramIcon />
                  </a>
                  <a href="#" className="w-8 h-8 flex items-center justify-center rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-primary)] hover:text-[#FF0000] hover:border-[#FF0000] transition-all" aria-label="YouTube">
                    <YoutubeIcon />
                  </a>
                </>
              )}
              <a href="/rss/feed.xml" className="w-8 h-8 flex items-center justify-center rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-primary)] hover:text-[#FFA500] hover:border-[#FFA500] transition-all" aria-label="RSS">
                <RssIcon />
              </a>
            </div>
          </div>

          {/* Kolon 2: Kategoriler */}
          <div>
            <h3 className="text-[var(--text-primary)] font-bold mb-4 uppercase text-sm tracking-wider border-b border-red-600 inline-block pb-1 transition-colors duration-300">Kategoriler</h3>
            <nav className="flex flex-col gap-2">
              {kategoriler?.slice(0, 8).map((k) => (
                <Link key={k.id} href={`/kategori/${k.slug}`} className="text-[var(--text-secondary)] hover:text-red-500 text-sm transition-colors duration-300">
                  {k.ad}
                </Link>
              ))}
            </nav>
          </div>

          {/* Kolon 3: Kurumsal */}
          <div>
            <h3 className="text-[var(--text-primary)] font-bold mb-4 uppercase text-sm tracking-wider border-b border-red-600 inline-block pb-1 transition-colors duration-300">Kurumsal</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/kunye" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors duration-300">Künye</Link>
              <Link href="#" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors duration-300">İletişim</Link>
              <Link href="#" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors duration-300">Reklam</Link>
              <Link href="#" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors duration-300">Gizlilik Politikası</Link>
              <Link href="#" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors duration-300">Kullanım Şartları</Link>
              <Link href="#" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors duration-300">Çerez Politikası</Link>
            </nav>
          </div>

          {/* Kolon 4: E-Bülten */}
          <div>
            <h3 className="text-[var(--text-primary)] font-bold mb-4 uppercase text-sm tracking-wider border-b border-red-600 inline-block pb-1 transition-colors duration-300">E-Bülten</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4 transition-colors duration-300">
              Günün önemli haberlerini kaçırmayın. E-bültenimize abone olun.
            </p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="E-posta adresiniz"
                required
                className="bg-[var(--bg-input)] border border-[var(--border-primary)] text-[var(--text-primary)] px-4 py-2 rounded text-sm focus:border-red-600 outline-none transition-colors duration-300 placeholder-[var(--text-muted)]"
              />
              <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700 transition-colors uppercase">
                Abone Ol
              </button>
            </form>
            <p className="text-[var(--text-muted)] text-xs mt-3 transition-colors duration-300">
              * Abone olarak gizlilik politikamızı kabul etmiş olursunuz.
            </p>
          </div>
        </div>

        {/* Alt Footer */}
        <div className="pt-8 border-t border-[var(--border-primary)] flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-300">
          <p className="text-[var(--text-muted)] text-sm transition-colors duration-300">
            {siteAyarlari?.copyrightText || (
              <>&copy; {currentYear} <span className="text-[var(--text-primary)]">{siteAyarlari?.siteAdi || 'Haber Portali'}</span>. Tüm hakları saklıdır.</>
            )}
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[var(--text-muted)] text-xs transition-colors duration-300">Yazılım: Lystra Software</span>
            <Link href="/admin" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs transition-colors duration-300">
              Yönetim Paneli
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}