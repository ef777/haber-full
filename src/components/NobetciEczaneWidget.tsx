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
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function fetchEczaneler() {
      try {
        const res = await fetch('/api/eczaneler');
        if (res.ok) {
          const data = await res.json();
          setEczaneler(data);
        }
      } catch (error) {
        console.error('Eczane verileri alınamadı:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEczaneler();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#262626] rounded-lg p-4 transition-colors duration-300">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">💊</span>
          <h3 className="font-bold text-gray-900 dark:text-white transition-colors duration-300">Nöbetçi Eczaneler</h3>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-3/4 transition-colors duration-300"></div>
          <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/2 transition-colors duration-300"></div>
          <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-2/3 transition-colors duration-300"></div>
        </div>
      </div>
    );
  }

  if (eczaneler.length === 0) {
    return (
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#262626] rounded-lg p-4 transition-colors duration-300">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">💊</span>
          <h3 className="font-bold text-gray-900 dark:text-white transition-colors duration-300">Nöbetçi Eczaneler</h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
          Nöbetçi eczane bilgisi bulunamadı.
          <br />
          <a href="tel:182" className="text-red-500 hover:underline">
            182 ALO İlaç Hattı
          </a>
        </p>
      </div>
    );
  }

  const displayEczaneler = expanded ? eczaneler : eczaneler.slice(0, 3);

  return (
    <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#262626] rounded-lg p-4 transition-colors duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">💊</span>
          <h3 className="font-bold text-gray-900 dark:text-white transition-colors duration-300">Nöbetçi Eczaneler</h3>
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-[#1a1a1a] px-2 py-1 rounded transition-colors duration-300">
          Eskişehir
        </span>
      </div>

      <div className="space-y-3">
        {displayEczaneler.map((eczane) => (
          <div
            key={eczane.id}
            className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] rounded-lg p-3 hover:border-red-600/50 transition-all duration-300"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 transition-colors duration-300">{eczane.ad}</h4>
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-2 line-clamp-2 transition-colors duration-300">{eczane.adres}</p>
            <div className="flex items-center justify-between">
              {eczane.ilce && (
                <span className="text-xs text-gray-400 dark:text-gray-500 transition-colors duration-300">{eczane.ilce}</span>
              )}
              {eczane.telefon && (
                <a
                  href={`tel:${eczane.telefon.replace(/\s/g, '')}`}
                  className="text-xs text-red-500 hover:text-red-400 transition-colors duration-300 flex items-center gap-1"
                >
                  📞 {eczane.telefon}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {eczaneler.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 text-center text-sm text-red-500 hover:text-red-400 transition-colors duration-300 py-2 border-t border-gray-200 dark:border-[#262626]"
        >
          {expanded ? 'Daha az göster ↑' : `Tümünü göster (${eczaneler.length}) ↓`}
        </button>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#262626] text-center transition-colors duration-300">
        <a
          href="tel:182"
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
        >
          📞 182 ALO İlaç Hattı
        </a>
      </div>
    </div>
  );
}
