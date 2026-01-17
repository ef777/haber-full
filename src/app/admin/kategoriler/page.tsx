'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Kategori {
  id: number;
  ad: string;
  slug: string;
  aktif: boolean;
  sira: number;
  _count?: { haberler: number };
}

export default function AdminKategorilerPage() {
  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ ad: '', aktif: true, sira: 0 });
  const router = useRouter();

  useEffect(() => {
    loadKategoriler();
  }, []);

  const loadKategoriler = async () => {
    try {
      const res = await fetch('/api/admin/kategoriler');
      if (res.status === 401) {
        router.push('/admin');
        return;
      }
      const data = await res.json();
      setKategoriler(data);
    } catch {
      console.error('Error loading kategoriler');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await fetch(`/api/admin/kategoriler/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/admin/kategoriler', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ ad: '', aktif: true, sira: 0 });
      loadKategoriler();
    } catch {
      console.error('Error saving kategori');
    }
  };

  const handleEdit = (k: Kategori) => {
    setFormData({ ad: k.ad, aktif: k.aktif, sira: k.sira });
    setEditingId(k.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    
    await fetch(`/api/admin/kategoriler/${id}`, { method: 'DELETE' });
    loadKategoriler();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300">
      <header className="bg-[#161616] border-b border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
              ← Geri
            </Link>
            <h1 className="text-xl font-bold text-white">Kategoriler</h1>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setFormData({ ad: '', aktif: true, sira: 0 }); }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            + Yeni Kategori
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-[#161616] border border-[#262626] rounded-lg p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-lg font-bold mb-4 text-white">
                {editingId ? 'Kategori Düzenle' : 'Yeni Kategori'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Kategori Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ad}
                    onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                    placeholder="Örn: Gündem, Spor, Ekonomi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Sıra
                  </label>
                  <input
                    type="number"
                    value={formData.sira}
                    onChange={(e) => setFormData({ ...formData, sira: Number(e.target.value) })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.aktif}
                      onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })}
                      className="w-4 h-4 text-red-600 bg-[#1a1a1a] border-[#333] rounded focus:ring-red-600"
                    />
                    <span className="text-sm text-gray-300">Aktif</span>
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-[#333] text-gray-300 rounded-lg hover:bg-[#1a1a1a] transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">İsim</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Haber Sayısı</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Sıra</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Durum</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {kategoriler.map((k) => (
                  <tr key={k.id} className="hover:bg-[#1c1c1c] transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{k.ad}</td>
                    <td className="px-4 py-3 text-gray-400">{k.slug}</td>
                    <td className="px-4 py-3 text-gray-400">{k._count?.haberler || 0}</td>
                    <td className="px-4 py-3 text-gray-400">{k.sira}</td>
                    <td className="px-4 py-3">
                      {k.aktif ? (
                        <span className="px-2 py-1 bg-green-900/30 text-green-400 border border-green-900 rounded text-xs">Aktif</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-800 text-gray-400 border border-gray-700 rounded text-xs">Pasif</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/kategori/${k.slug}`}
                          target="_blank"
                          className="text-blue-500 hover:text-blue-400 text-sm"
                        >
                          Görüntüle
                        </Link>
                        <button
                          onClick={() => handleEdit(k)}
                          className="text-gray-400 hover:text-white text-sm"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(k.id)}
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
      </div>
    </div>
  );
}
