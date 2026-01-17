'use client';

import { useState, useEffect } from 'react';

interface Eczane {
  id: number;
  ad: string;
  adres: string;
  telefon: string | null;
  ilce: string | null;
}

export default function NobetciEczaneWidget() {
  const [eczaneler, setEczaneler] = useState<Eczane[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEczaneler = async () => {
      try {
        const res = await fetch('/api/eczaneler');
        const data = await res.json();
        setEczaneler(data);
      } catch {
        console.error('Eczaneler yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    fetchEczaneler();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#161616] border border-[#262626] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#262626]">
          <span className="text-xl">💊</span>
          <h3 className="font-bold text-white">Nöbetçi Eczaneler</h3>
        </div>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (eczaneler.length === 0) {
    return (
      <div className="bg-[#161616] border border-[#262626] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#262626]">
          <span className="text-xl">💊</span>
          <h3 className="font-bold text-white">Nöbetçi Eczaneler</h3>
        </div>
        <p className="text-gray-400 text-sm text-center py-4">
          Bugün için nöbetçi eczane bilgisi bulunamadı.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#161616] border border-[#262626] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#262626]">
        <span className="text-xl">💊</span>
        <h3 className="font-bold text-white">Nöbetçi Eczaneler</h3>
        <span className="ml-auto text-xs text-gray-500">
          {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
        </span>
      </div>
      <div className="space-y-3">
        {eczaneler.slice(0, 5).map((e) => (
          <div key={e.id} className="bg-[#1a1a1a] rounded-lg p-3 border border-[#262626]">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-sm truncate">{e.ad}</h4>
                {e.ilce && <span className="text-xs text-gray-500">{e.ilce}</span>}
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{e.adres}</p>
              </div>
              {e.telefon && (
                <a
                  href={`tel:${e.telefon.replace(/\s/g, '')}`}
                  className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded transition-colors"
                >
                  Ara
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      {eczaneler.length > 5 && (
        <p className="text-center text-xs text-gray-500 mt-3">
          ve {eczaneler.length - 5} eczane daha...
        </p>
      )}
    </div>
  );
}
