import React from 'react';

type Kategori = {
  id: number;
  ad: string;
  slug: string;
};

export default function Header({ kategoriler }: { kategoriler?: Kategori[] }) {
  return (
    <header className="site-header sticky top-0 z-50">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-6">
          <a href="/" className="site-brand">Haber Sitesi</a>
          <nav className="site-nav hidden md:flex gap-4">
            {kategoriler?.slice(0, 8).map(k => (
              <a key={k.id} href={`/kategori/${k.slug}`} className="text-sm">
                {k.ad}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <form action="/arama" method="GET" className="hidden md:block">
            <input name="q" placeholder="Ara..." className="px-3 py-2 border rounded text-sm" />
          </form>
          <a href="/admin" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Giriş</a>
        </div>
      </div>
    </header>
  );
}
