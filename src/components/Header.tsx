'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';

type Kategori = {
  id: number;
  ad: string;
  slug: string;
};

type SiteAyarlari = {
  siteAdi: string;
  logoUrl: string | null;
  sosyalTwitter: string | null;
  sosyalFacebook: string | null;
  sosyalInstagram: string | null;
  sosyalYoutube: string | null;
};

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

// Social Icons (Twitter, FB, Insta, YT) - Simplified for brevity but kept consistent
const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
const InstagramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
const YoutubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2"/>
    <path d="M12 20v2"/>
    <path d="m4.93 4.93 1.41 1.41"/>
    <path d="m17.66 17.66 1.41 1.41"/>
    <path d="M2 12h2"/>
    <path d="M20 12h2"/>
    <path d="m6.34 17.66-1.41 1.41"/>
    <path d="m19.07 4.93-1.41 1.41"/>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
);

export default function Header({ kategoriler, siteAyarlari }: { kategoriler?: Kategori[]; siteAyarlari?: SiteAyarlari | null }) {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [weather, setWeather] = useState<{ temp: number; city: string } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Using a free weather API with Eskisehir coordinates
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=39.7767&longitude=30.5206&current_weather=true');
        const data = await res.json();
        if (data.current_weather) {
          setWeather({
            temp: Math.round(data.current_weather.temperature),
            city: 'Eskisehir'
          });
        }
      } catch {
        // Fallback if API fails
        setWeather({ temp: 14, city: 'Eskisehir' });
      }
    };
    fetchWeather();
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
      {/* 1. Ust Bilgi Cubugu (Tarih, Hava Durumu, Sosyal Medya) */}
      <div className="bg-gray-100 dark:bg-[#111] border-b border-gray-300 dark:border-[#262626] text-xs py-2 hidden lg:block">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
            <span className="capitalize">{formattedDate}</span>
            <span className="w-px h-3 bg-[#333]"></span>
            <span>{weather ? `${weather.city} ${weather.temp}°C` : 'Yükleniyor...'}</span>
            <span className="w-px h-3 bg-[#333]"></span>
            <span>USD: 34.20</span>
            <span>EUR: 37.50</span>
          </div>
          <div className="flex items-center gap-3">
             {siteAyarlari?.sosyalTwitter && (
               <a href={siteAyarlari.sosyalTwitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#1DA1F2] transition-colors"><TwitterIcon /></a>
             )}
             {siteAyarlari?.sosyalFacebook && (
               <a href={siteAyarlari.sosyalFacebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#1877F2] transition-colors"><FacebookIcon /></a>
             )}
             {siteAyarlari?.sosyalInstagram && (
               <a href={siteAyarlari.sosyalInstagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#E4405F] transition-colors"><InstagramIcon /></a>
             )}
             {siteAyarlari?.sosyalYoutube && (
               <a href={siteAyarlari.sosyalYoutube} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#FF0000] transition-colors"><YoutubeIcon /></a>
             )}
             {!siteAyarlari?.sosyalTwitter && !siteAyarlari?.sosyalFacebook && !siteAyarlari?.sosyalInstagram && !siteAyarlari?.sosyalYoutube && (
               <>
                 <a href="#" className="text-gray-500 hover:text-[#1DA1F2] transition-colors"><TwitterIcon /></a>
                 <a href="#" className="text-gray-500 hover:text-[#1877F2] transition-colors"><FacebookIcon /></a>
                 <a href="#" className="text-gray-500 hover:text-[#E4405F] transition-colors"><InstagramIcon /></a>
                 <a href="#" className="text-gray-500 hover:text-[#FF0000] transition-colors"><YoutubeIcon /></a>
               </>
             )}
             <span className="w-px h-4 bg-gray-700"></span>
             <button
               onClick={toggleTheme}
               className="text-gray-500 hover:text-yellow-500 dark:hover:text-blue-400 transition-colors p-1"
               title={theme === 'light' ? 'Koyu Mod' : 'Aydınlık Mod'}
             >
               {theme === 'light' ? <MoonIcon /> : <SunIcon />}
             </button>
             <Link href="/kunye" className="ml-2 text-gray-400 hover:text-white dark:hover:text-white transition-colors">Künye</Link>
             <Link href="/admin" className="text-gray-400 hover:text-white dark:hover:text-white transition-colors">Yönetim</Link>
          </div>
        </div>
      </div>

      {/* 2. Ana Header (Logo, Reklam Alani) */}
      <header className={`bg-white dark:bg-[#0a0a0a] border-b border-gray-300 dark:border-[#262626] transition-all duration-300 ${scrolled ? 'sticky top-0 z-50 shadow-lg' : 'relative'}`}>
        <div className="container">
          <div className="flex items-center justify-between h-[80px]">
            {/* Mobile Menu Trigger */}
            <button
              className="lg:hidden p-2 text-gray-900 dark:text-white"
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              {siteAyarlari?.logoUrl ? (
                <Image
                  src={siteAyarlari.logoUrl}
                  alt={siteAyarlari.siteAdi || 'Logo'}
                  width={200}
                  height={60}
                  className="h-[50px] w-auto object-contain"
                  unoptimized={siteAyarlari.logoUrl.includes('/uploads/')}
                />
              ) : (
                <>
                  <div className="bg-red-600 text-white font-black text-3xl px-2 py-1 transform -skew-x-12 group-hover:bg-red-700 transition-colors">
                    HABER
                  </div>
                  <div className="text-gray-900 dark:text-white font-bold text-2xl tracking-tighter">
                    PORTALI
                  </div>
                </>
              )}
            </Link>

            {/* Desktop Search & Categories Placeholder */}
            <div className="hidden lg:flex items-center gap-6">
               <div className="relative">
                 <form action="/arama" className="relative group">
                   <input
                      type="text"
                      name="q"
                      placeholder="Haber ara..."
                      className="bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] text-gray-900 dark:text-gray-300 pl-4 pr-10 py-2 rounded-full text-sm w-[200px] focus:w-[300px] transition-all focus:border-red-600 outline-none"
                   />
                   <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500">
                     <SearchIcon />
                   </button>
                 </form>
               </div>
            </div>

            {/* Mobile Search Toggle */}
             <button
              className="lg:hidden p-2 text-gray-900 dark:text-white"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <SearchIcon />
            </button>
          </div>

          {/* Mobile Search Bar (Expandable) */}
          {searchOpen && (
            <div className="lg:hidden pb-4">
               <form action="/arama" className="relative">
                   <input
                      type="text"
                      name="q"
                      placeholder="Haber ara..."
                      className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] text-gray-900 dark:text-gray-300 pl-4 pr-10 py-3 rounded-lg text-sm outline-none focus:border-red-600"
                   />
                   <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                     <SearchIcon />
                   </button>
               </form>
            </div>
          )}
        </div>

        {/* 3. Kategori Menusu (Desktop) */}
        <nav className="border-t border-gray-300 dark:border-[#262626] hidden lg:block bg-gray-50 dark:bg-[#111]">
          <div className="container">
             <ul className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
               <li>
                 <Link href="/" className="block py-3 px-4 text-sm font-bold text-red-500 hover:bg-gray-200 dark:hover:bg-[#1a1a1a] border-b-2 border-red-600">
                   MANŞET
                 </Link>
               </li>
               {kategoriler?.map((k) => (
                 <li key={k.id}>
                   <Link
                    href={`/kategori/${k.slug}`}
                    className="block py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#1a1a1a] border-b-2 border-transparent hover:border-red-600 transition-all whitespace-nowrap"
                   >
                     {k.ad.toUpperCase()}
                   </Link>
                 </li>
               ))}
               <li className="ml-auto">
                 <Link href="/kunye" className="block py-3 px-4 text-sm text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white">
                   Künye
                 </Link>
               </li>
             </ul>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-[80%] max-w-[300px] bg-white dark:bg-[#0a0a0a] border-r border-gray-300 dark:border-[#262626] shadow-2xl flex flex-col">
            <div className="p-4 border-b border-gray-300 dark:border-[#262626] flex justify-between items-center">
               <span className="font-black text-xl text-gray-900 dark:text-white">MENÜ</span>
               <button onClick={() => setMobileMenuOpen(false)} className="text-gray-900 dark:text-white"><CloseIcon /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              <nav className="space-y-1">
                 <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded bg-red-600 text-white font-bold">
                   ANA SAYFA
                 </Link>
                 {kategoriler?.map((k) => (
                   <Link
                    key={k.id}
                    href={`/kategori/${k.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 px-4 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-white font-medium border-l-2 border-transparent hover:border-red-600 transition-all"
                   >
                     {k.ad}
                   </Link>
                 ))}
                 <div className="my-4 border-t border-gray-300 dark:border-[#262626]" />
                 <Link href="/kunye" className="block py-2 text-gray-600 dark:text-gray-400">Künye / İletişim</Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}