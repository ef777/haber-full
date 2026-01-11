import React from 'react';

type Kategori = {
  id: number;
  ad: string;
  slug: string;
};

export default function Footer({ kategoriler }: { kategoriler?: Kategori[] }) {
  return (
    <footer className="site-footer mt-12">
      <div className="container py-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <div className="text-lg font-semibold">Haber Sitesi</div>
            <div className="text-sm text-gray-300 mt-2">Güncel haberler, son dakika gelişmeleri ve analizler.</div>
          </div>

          <nav className="flex gap-4 flex-wrap">
            {kategoriler?.slice(0, 8).map(k => (
              <a key={k.id} href={`/kategori/${k.slug}`} className="text-sm text-gray-300 hover:text-white">
                {k.ad}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-6 text-sm text-gray-400">© {new Date().getFullYear()} Haber Sitesi. Tüm hakları saklıdır.</div>
      </div>
    </footer>
  );
}
