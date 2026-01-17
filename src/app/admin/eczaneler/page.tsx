'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Eczane {
  id: number;
  ad: string;
  adres: string;
  telefon: string | null;
  il: string;
  ilce: string | null;
  tarih: string;
  aktif: boolean;
}

export default function AdminEczanelerPage() {
  const [eczaneler, setEczaneler] = useState<Eczane[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    ad: '',
    adres: '',
    telefon: '',
    il: 'Eskisehir',
    ilce: '',
    tarih: new Date().toISOString().split('T')[0],
    aktif: true,
  });
  const router = useRouter();

  useEffect(() => {
    loadEczaneler();
  }, []);

  const loadEczaneler = async () => {
    try {
      const res = await fetch('/api/admin/eczaneler');
      if (res.status === 401) {
        router.push('/admin');
        return;
      }
      const data = await res.json();
      setEczaneler(data);
    } catch {
      console.error('Error loading eczaneler');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await fetch(`/api/admin/eczaneler/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/admin/eczaneler', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadEczaneler();
    } catch {
      console.error('Error saving eczane');
    }
  };

  const resetForm = () => {
    setFormData({
      ad: '',
      adres: '',
      telefon: '',
      il: 'Eskisehir',
      ilce: '',
      tarih: new Date().toISOString().split('T')[0],
      aktif: true,
    });
  };

  const handleEdit = (eczane: Eczane) => {
    setFormData({
      ad: eczane.ad,
      adres: eczane.adres,
      telefon: eczane.telefon || '',
      il: eczane.il,
      ilce: eczane.ilce || '',
      tarih: new Date(eczane.tarih).toISOString().split('T')[0],
      aktif: eczane.aktif,
    });
    setEditingId(eczane.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu eczaneyi silmek istediğinize emin misiniz?')) return;

    await fetch(`/api/admin/eczaneler/${id}`, { method: 'DELETE' });
    loadEczaneler();
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300">
      <header className="bg-[#161616] border-b border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
              ← Geri
            </Link>
            <h1 className="text-xl font-bold text-white">Nöbetçi Eczaneler</h1>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            + Yeni Eczane
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-[#161616] border border-[#262626] rounded-lg p-6 w-full max-w-lg shadow-2xl mx-4">
              <h2 className="text-lg font-bold mb-4 text-white">
                {editingId ? 'Eczane Düzenle' : 'Yeni Eczane Ekle'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Eczane Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ad}
                    onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600"
                    placeholder="Örn: Merkez Eczanesi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Adres *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.adres}
                    onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600"
                    placeholder="Tam adres"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={formData.telefon}
                      onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600"
                      placeholder="0222 XXX XX XX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Nöbet Tarihi *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.tarih}
                      onChange={(e) => setFormData({ ...formData, tarih: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      İl
                    </label>
                    <input
                      type="text"
                      value={formData.il}
                      onChange={(e) => setFormData({ ...formData, il: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      İlçe
                    </label>
                    <input
                      type="text"
                      value={formData.ilce}
                      onChange={(e) => setFormData({ ...formData, ilce: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600"
                      placeholder="Merkez, Odunpazarı vb."
                    />
                  </div>
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

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}
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

        {/* Eczane List */}
        <div className="bg-[#161616] border border-[#262626] rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            </div>
          ) : eczaneler.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">💊</div>
              <h3 className="text-lg font-semibold text-white mb-2">Henüz eczane eklenmemiş</h3>
              <p className="text-gray-400 mb-4">Bugünün nöbetçi eczanelerini ekleyin</p>
              <button
                onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                + İlk Eczaneyi Ekle
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#1a1a1a] border-b border-[#262626]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Eczane</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Adres</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Telefon</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tarih</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Durum</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {eczaneler.map((e) => (
                  <tr key={e.id} className="hover:bg-[#1c1c1c] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{e.ad}</div>
                      <div className="text-xs text-gray-500">{e.il} {e.ilce && `/ ${e.ilce}`}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm max-w-xs truncate">{e.adres}</td>
                    <td className="px-4 py-3 text-gray-400">{e.telefon || '-'}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{formatDate(e.tarih)}</td>
                    <td className="px-4 py-3">
                      {e.aktif ? (
                        <span className="px-2 py-1 bg-green-900/30 text-green-400 border border-green-900 rounded text-xs">Aktif</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-800 text-gray-400 border border-gray-700 rounded text-xs">Pasif</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(e)}
                          className="text-gray-400 hover:text-white text-sm"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
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
