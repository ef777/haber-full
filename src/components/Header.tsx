'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Kategori = {
  id: number;
  ad: string;
  slug: string;
};

// SVG Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.3-4.3"/>
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12"/>
    <line x1="4" x2="20" y1="6" y2="6"/>
    <line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/>
    <path d="m6 6 12 12"/>
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function Header({ kategoriler }: { kategoriler?: Kategori[] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(today);

  return (
    <>
      {/* Ust Bar */}
      <div className="header-top-bar hidden lg:block">
        <div className="container">
          <div className="flex items-center justify-between py-2">
            {/* Sol: Tarih */}
            <div className="flex items-center gap-6 text-gray-400">
              <span className="capitalize">{formattedDate}</span>
            </div>

            {/* Sag: Sosyal Medya + Giris */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="Twitter">
                  <TwitterIcon />
                </a>
                <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="Facebook">
                  <FacebookIcon />
                </a>
                <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="Instagram">
                  <InstagramIcon />
                </a>
                <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="YouTube">
                  <YoutubeIcon />
                </a>
              </div>
              <div className="w-px h-4 bg-gray-700" />
              <Link href="/admin" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
                Yonetim
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Ana Header */}
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        {/* Logo + Arama Satiri */}
        <div className="container">
          <div className="flex items-center justify-between py-4 lg:py-5">
            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menu"
            >
              <MenuIcon />
            </button>

            {/* Logo */}
            <Link href="/" className="site-brand">
              <span className="site-brand-accent">HABER</span>
              <span>PORTALI</span>
            </Link>

            {/* Desktop Arama */}
            <div className="hidden lg:block">
              <form action="/arama" method="GET" className="search-box">
                <input
                  type="text"
                  name="q"
                  placeholder="Haberlerde ara..."
                  autoComplete="off"
                />
                <button type="submit" aria-label="Ara">
                  <SearchIcon />
                </button>
              </form>
            </div>

            {/* Mobile Arama Toggle */}
            <button
              className="lg:hidden text-gray-400 hover:text-white p-2"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Ara"
            >
              <SearchIcon />
            </button>
          </div>

          {/* Mobile Arama - Acilir */}
          {searchOpen && (
            <div className="lg:hidden pb-4">
              <form action="/arama" method="GET" className="search-box w-full">
                <input
                  type="text"
                  name="q"
                  placeholder="Haberlerde ara..."
                  className="flex-1"
                  autoComplete="off"
                />
                <button type="submit" aria-label="Ara">
                  <SearchIcon />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Navigasyon */}
        <nav className="border-t border-[#262626] hidden lg:block">
          <div className="container">
            <div className="site-nav">
              <Link href="/" className="!text-red-500 !border-red-500">
                Ana Sayfa
              </Link>
              {kategoriler?.slice(0, 10).map((k) => (
                <Link key={k.id} href={`/kategori/${k.slug}`}>
                  {k.ad}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-[#0a0a0a] border-r border-[#262626] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#262626]">
              <Link href="/" className="site-brand text-xl" onClick={() => setMobileMenuOpen(false)}>
                <span className="site-brand-accent">HABER</span>
                <span>PORTALI</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-400 hover:text-white p-1"
                aria-label="Kapat"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="p-4">
              <Link
                href="/"
                className="block py-3 px-4 text-white font-medium border-l-2 border-red-500 bg-red-500/10 mb-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Ana Sayfa
              </Link>
              {kategoriler?.map((k) => (
                <Link
                  key={k.id}
                  href={`/kategori/${k.slug}`}
                  className="block py-3 px-4 text-gray-300 hover:text-white hover:bg-[#1a1a1a] border-l-2 border-transparent hover:border-red-500 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {k.ad}
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-[#262626] mt-auto">
              <div className="flex gap-4 justify-center">
                <a href="#" className="text-gray-500 hover:text-white transition-colors">
                  <TwitterIcon />
                </a>
                <a href="#" className="text-gray-500 hover:text-white transition-colors">
                  <FacebookIcon />
                </a>
                <a href="#" className="text-gray-500 hover:text-white transition-colors">
                  <InstagramIcon />
                </a>
                <a href="#" className="text-gray-500 hover:text-white transition-colors">
                  <YoutubeIcon />
                </a>
              </div>
              <Link
                href="/admin"
                className="block text-center text-gray-400 hover:text-white text-sm mt-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                Yonetim Paneli
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
