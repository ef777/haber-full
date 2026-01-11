'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Yazar {
  id: number;
  isim: string;
  slug: string;
  email: string;
  bio: string;
  resimUrl: string;
  aktif: boolean;
  _count?: { haberler: number };
}

export default function AdminYazarlarPage() {
  const [yazarlar, setYazarlar] = useState<Yazar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    isim: '',
    email: '',
    bio: '',
    resimUrl: '',
    aktif: true,
  });
  const router = useRouter();

  useEffect(() => {
    loadYazarlar();
  }, []);

  const loadYazarlar = async () => {
    try {
      const res = await fetch('/api/admin/yazarlar');
      if (res.status === 401) {
        router.push('/admin');
        return;
      }
      const data = await res.json();
      setYazarlar(data);
    } catch {
      console.error('Error loading yazarlar');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await fetch(`/api/admin/yazarlar/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/admin/yazarlar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ isim: '', email: '', bio: '', resimUrl: '', aktif: true });
      loadYazarlar();
    } catch {
      console.error('Error saving yazar');
    }
  };

  const handleEdit = (y: Yazar) => {
    setFormData({
      isim: y.isim,
      email: y.email || '',
      bio: y.bio || '',
      resimUrl: y.resimUrl || '',
      aktif: y.aktif,
    });
    setEditingId(y.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu yazari silmek istediginize emin misiniz?')) return;
    
    await fetch(`/api/admin/yazarlar/${id}`, { method: 'DELETE' });
    loadYazarlar();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
              ← Geri
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Yazarlar</h1>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setFormData({ isim: '', email: '', bio: '', resimUrl: '', aktif: true }); }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            + Yeni Yazar
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">
                {editingId ? 'Yazar Duzenle' : 'Yeni Yazar'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Isim Soyisim *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.isim}
                    onChange={(e) => setFormData({ ...formData, isim: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Orn: Ahmet Yilmaz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="yazar@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biyografi
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Yazar hakkinda kisa bilgi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profil Resmi URL
                  </label>
                  <input
                    type="url"
                    value={formData.resimUrl}
                    onChange={(e) => setFormData({ ...formData, resimUrl: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="https://..."
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yazar</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-posta</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Haber Sayisi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Islemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {yazarlar.map((y) => (
                  <tr key={y.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {y.resimUrl && (
                          <img src={y.resimUrl} alt={y.isim} className="w-8 h-8 rounded-full object-cover" />
                        )}
                        <span className="font-medium">{y.isim}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{y.email || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{y._count?.haberler || 0}</td>
                    <td className="px-4 py-3">
                      {y.aktif ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Aktif</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Pasif</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/yazar/${y.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Goruntule
                        </Link>
                        <button
                          onClick={() => handleEdit(y)}
                          className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Duzenle
                        </button>
                        <button
                          onClick={() => handleDelete(y.id)}
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
