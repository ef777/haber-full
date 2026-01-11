import React from 'react';

type Kategori = {
  id: number;
  ad: string;
  slug: string;
};

export default function Footer({ kategoriler }: { kategoriler?: Kategori[] }) {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <div>© {new Date().getFullYear()} Haber Sitesi</div>
          <nav className="flex gap-4">
            {kategoriler?.slice(0, 6).map(k => (
              <a key={k.id} href={`/kategori/${k.slug}`} className="text-sm text-gray-300">
                {k.ad}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
