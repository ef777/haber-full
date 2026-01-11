import React from 'react';

type Kategori = {
  id: number;
  ad: string;
  slug: string;
};

export default function Header({ kategoriler }: { kategoriler?: Kategori[] }) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="text-xl font-bold">Haber Sitesi</a>
        <nav className="flex gap-4">
          {kategoriler?.slice(0, 6).map(k => (
            <a key={k.id} href={`/kategori/${k.slug}`} className="text-sm text-gray-700">
              {k.ad}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
