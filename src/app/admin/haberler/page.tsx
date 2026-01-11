'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Haber {
  id: number;
  baslik: string;
  slug: string;
  durum: string;
  manset: boolean;
  sondakika: boolean;
  okunmaSayisi: number;
  yayinTarihi: string;
  kategori?: { isim: string };
  yazar?: { isim: string };
}

export default function AdminHaberlerPage() {
  const [haberler, setHaberler] = useState<Haber[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [durum, setDurum] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadHaberler();
  }, [page, durum]);

  const loadHaberler = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (durum) params.set('durum', durum);
      
      const res = await fetch(`/api/admin/haberler?${params}`);
      if (res.status === 401) {
        router.push('/admin');
        return;
      }
      const data = await res.json();
      setHaberler(data.data);
      setTotalPages(data.meta.totalPages);
    } catch {
      console.error('Error loading haberler');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu haberi silmek istediğinize emin misiniz?')) return;
    
    await fetch(`/api/admin/haberler/${id}`, { method: 'DELETE' });
    loadHaberler();
  };

  const getDurumBadge = (d: string) => {
    switch (d) {
      case 'yayinda':
        return <span className="px-2 py-1 bg-green-900/30 text-green-400 border border-green-900 rounded text-xs">Yayında</span>;
      case 'taslak':
        return <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 border border-yellow-900 rounded text-xs">Taslak</span>;
      case 'arsiv':
        return <span className="px-2 py-1 bg-gray-800 text-gray-400 border border-gray-700 rounded text-xs">Arşiv</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300">
      <header className="bg-[#161616] border-b border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
              ← Geri
            </Link>
            <h1 className="text-xl font-bold text-white">Haberler</h1>
          </div>
          <Link
            href="/admin/haberler/yeni"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            + Yeni Haber
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-[#161616] border border-[#262626] rounded-lg p-4 mb-6">
          <div className="flex gap-4">
            <select
              value={durum}
              onChange={(e) => { setDurum(e.target.value); setPage(1); }}
              className="bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600"
            >
              <option value="">Tüm Durumlar</option>
              <option value="yayinda">Yayında</option>
              <option value="taslak">Taslak</option>
              <option value="arsiv">Arşiv</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#161616] border border-[#262626] rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#1a1a1a] border-b border-[#262626]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Başlık</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Kategori</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Yazar</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Durum</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tarih</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {haberler.map((haber) => (
                  <tr key={haber.id} className="hover:bg-[#1c1c1c] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {haber.manset && <span className="text-yellow-500" title="Manşet">★</span>}
                        {haber.sondakika && <span className="text-red-500" title="Son Dakika">⚡</span>}
                        <span className="font-medium text-white">{haber.baslik}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{haber.kategori?.isim || '-'}</td>
                    <td className="px-4 py-3 text-gray-400">{haber.yazar?.isim || '-'}</td>
                    <td className="px-4 py-3">{getDurumBadge(haber.durum)}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {new Date(haber.yayinTarihi).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/haber/${haber.slug}`}
                          target="_blank"
                          className="text-blue-500 hover:text-blue-400 text-sm"
                        >
                          Görüntüle
                        </Link>
                        <Link
                          href={`/admin/haberler/${haber.id}`}
                          className="text-gray-400 hover:text-white text-sm"
                        >
                          Düzenle
                        </Link>
                        <button
                          onClick={() => handleDelete(haber.id)}
                          className="text-red-500 hover:text-red-400 text-sm"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-[#333] rounded-lg disabled:opacity-50 hover:bg-[#1a1a1a] text-gray-300"
            >
              Önceki
            </button>
            <span className="px-4 py-2 text-white">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-[#333] rounded-lg disabled:opacity-50 hover:bg-[#1a1a1a] text-gray-300"
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
