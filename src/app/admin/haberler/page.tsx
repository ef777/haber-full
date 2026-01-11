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
    if (!confirm('Bu haberi silmek istediginize emin misiniz?')) return;
    
    await fetch(`/api/admin/haberler/${id}`, { method: 'DELETE' });
    loadHaberler();
  };

  const getDurumBadge = (d: string) => {
    switch (d) {
      case 'yayinda':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Yayinda</span>;
      case 'taslak':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Taslak</span>;
      case 'arsiv':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Arsiv</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
              ← Geri
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Haberler</h1>
          </div>
          <Link
            href="/admin/haberler/yeni"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            + Yeni Haber
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4">
            <select
              value={durum}
              onChange={(e) => { setDurum(e.target.value); setPage(1); }}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">Tum Durumlar</option>
              <option value="yayinda">Yayinda</option>
              <option value="taslak">Taslak</option>
              <option value="arsiv">Arsiv</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Baslik</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yazar</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Islemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {haberler.map((haber) => (
                  <tr key={haber.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {haber.manset && <span className="text-yellow-500" title="Manset">★</span>}
                        {haber.sondakika && <span className="text-red-500" title="Son Dakika">⚡</span>}
                        <span className="font-medium">{haber.baslik}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{haber.kategori?.isim || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{haber.yazar?.isim || '-'}</td>
                    <td className="px-4 py-3">{getDurumBadge(haber.durum)}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {new Date(haber.yayinTarihi).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/haber/${haber.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Goruntule
                        </Link>
                        <Link
                          href={`/admin/haberler/${haber.id}`}
                          className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Duzenle
                        </Link>
                        <button
                          onClick={() => handleDelete(haber.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
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
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Onceki
            </button>
            <span className="px-4 py-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
