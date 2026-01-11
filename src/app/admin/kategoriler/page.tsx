'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Kategori {
  id: number;
  isim: string;
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
  const [formData, setFormData] = useState({ isim: '', aktif: true, sira: 0 });
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
      setFormData({ isim: '', aktif: true, sira: 0 });
      loadKategoriler();
    } catch {
      console.error('Error saving kategori');
    }
  };

  const handleEdit = (k: Kategori) => {
    setFormData({ isim: k.isim, aktif: k.aktif, sira: k.sira });
    setEditingId(k.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kategoriyi silmek istediginize emin misiniz?')) return;
    
    await fetch(`/api/admin/kategoriler/${id}`, { method: 'DELETE' });
    loadKategoriler();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
              ← Geri
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Kategoriler</h1>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setFormData({ isim: '', aktif: true, sira: 0 }); }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            + Yeni Kategori
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">
                {editingId ? 'Kategori Duzenle' : 'Yeni Kategori'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori Adi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.isim}
                    onChange={(e) => setFormData({ ...formData, isim: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Orn: Gundem, Spor, Ekonomi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sira
                  </label>
                  <input
                    type="number"
                    value={formData.sira}
                    onChange={(e) => setFormData({ ...formData, sira: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.aktif}
                      onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Aktif</span>
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Iptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Isim</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Haber Sayisi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sira</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Islemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {kategoriler.map((k) => (
                  <tr key={k.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{k.isim}</td>
                    <td className="px-4 py-3 text-gray-600">{k.slug}</td>
                    <td className="px-4 py-3 text-gray-600">{k._count?.haberler || 0}</td>
                    <td className="px-4 py-3 text-gray-600">{k.sira}</td>
                    <td className="px-4 py-3">
                      {k.aktif ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Aktif</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Pasif</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/kategori/${k.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Goruntule
                        </Link>
                        <button
                          onClick={() => handleEdit(k)}
                          className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Duzenle
                        </button>
                        <button
                          onClick={() => handleDelete(k.id)}
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
      </div>
    </div>
  );
}
