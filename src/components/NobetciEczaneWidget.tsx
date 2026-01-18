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
      <div className="bg-[#111] border border-[#262626] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">💊</span>
          <h3 className="font-bold text-white">Nöbetçi Eczaneler</h3>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-[#262626] rounded w-3/4"></div>
          <div className="h-4 bg-[#262626] rounded w-1/2"></div>
          <div className="h-4 bg-[#262626] rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (eczaneler.length === 0) {
    return (
      <div className="bg-[#111] border border-[#262626] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">💊</span>
          <h3 className="font-bold text-white">Nöbetçi Eczaneler</h3>
        </div>
        <p className="text-gray-400 text-sm">
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
    <div className="bg-[#111] border border-[#262626] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">💊</span>
          <h3 className="font-bold text-white">Nöbetçi Eczaneler</h3>
        </div>
        <span className="text-xs text-gray-500 bg-[#1a1a1a] px-2 py-1 rounded">
          Eskişehir
        </span>
      </div>

      <div className="space-y-3">
        {displayEczaneler.map((eczane) => (
          <div
            key={eczane.id}
            className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3 hover:border-red-600/50 transition-colors"
          >
            <h4 className="font-semibold text-white text-sm mb-1">{eczane.ad}</h4>
            <p className="text-gray-400 text-xs mb-2 line-clamp-2">{eczane.adres}</p>
            <div className="flex items-center justify-between">
              {eczane.ilce && (
                <span className="text-xs text-gray-500">{eczane.ilce}</span>
              )}
              {eczane.telefon && (
                <a
                  href={`tel:${eczane.telefon.replace(/\s/g, '')}`}
                  className="text-xs text-red-500 hover:text-red-400 transition-colors flex items-center gap-1"
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
          className="w-full mt-3 text-center text-sm text-red-500 hover:text-red-400 transition-colors py-2 border-t border-[#262626]"
        >
          {expanded ? 'Daha az göster ↑' : `Tümünü göster (${eczaneler.length}) ↓`}
        </button>
      )}

      <div className="mt-3 pt-3 border-t border-[#262626] text-center">
        <a
          href="tel:182"
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          📞 182 ALO İlaç Hattı
        </a>
      </div>
    </div>
  );
}
