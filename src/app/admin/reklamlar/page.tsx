'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Reklam {
  id: number;
  ad: string;
  konum: string;
  icerik: string;
  aktif: boolean;
  baslangic: string | null;
  bitis: string | null;
}

const KONUM_OPTIONS = [
  { value: 'header', label: 'Header (Üst Banner)' },
  { value: 'sidebar', label: 'Sidebar (Yan Alan)' },
  { value: 'content', label: 'İçerik Arası' },
  { value: 'footer', label: 'Footer (Alt Banner)' },
];

export default function AdminReklamlarPage() {
  const [reklamlar, setReklamlar] = useState<Reklam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    ad: '',
    konum: 'sidebar',
    icerik: '',
    aktif: true,
    baslangic: '',
    bitis: '',
  });
  const router = useRouter();

  useEffect(() => {
    loadReklamlar();
  }, []);

  const loadReklamlar = async () => {
    try {
      const res = await fetch('/api/admin/reklamlar');
      if (res.status === 401) {
        router.push('/admin');
        return;
      }
      const data = await res.json();
      setReklamlar(data);
    } catch {
      console.error('Error loading reklamlar');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        baslangic: formData.baslangic || null,
        bitis: formData.bitis || null,
      };

      if (editingId) {
        await fetch(`/api/admin/reklamlar/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/admin/reklamlar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadReklamlar();
    } catch {
      console.error('Error saving reklam');
    }
  };

  const resetForm = () => {
    setFormData({
      ad: '',
      konum: 'sidebar',
      icerik: '',
      aktif: true,
      baslangic: '',
      bitis: '',
    });
  };

  const handleEdit = (reklam: Reklam) => {
    setFormData({
      ad: reklam.ad,
      konum: reklam.konum,
      icerik: reklam.icerik,
      aktif: reklam.aktif,
      baslangic: reklam.baslangic ? new Date(reklam.baslangic).toISOString().split('T')[0] : '',
      bitis: reklam.bitis ? new Date(reklam.bitis).toISOString().split('T')[0] : '',
    });
    setEditingId(reklam.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu reklamı silmek istediğinize emin misiniz?')) return;

    await fetch(`/api/admin/reklamlar/${id}`, { method: 'DELETE' });
    loadReklamlar();
  };

  const getKonumLabel = (konum: string) => {
    return KONUM_OPTIONS.find(o => o.value === konum)?.label || konum;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300">
      <header className="bg-[#161616] border-b border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
              ← Geri
            </Link>
            <h1 className="text-xl font-bold text-white">Reklam / İlan Yönetimi</h1>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            + Yeni Reklam
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm overflow-y-auto py-8">
            <div className="bg-[#161616] border border-[#262626] rounded-lg p-6 w-full max-w-2xl shadow-2xl mx-4">
              <h2 className="text-lg font-bold mb-4 text-white">
                {editingId ? 'Reklam Düzenle' : 'Yeni Reklam Ekle'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Reklam Adı *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ad}
                      onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600"
                      placeholder="Örn: Ana Sayfa Banner"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Konum *
                    </label>
                    <select
                      value={formData.konum}
                      onChange={(e) => setFormData({ ...formData, konum: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600"
                    >
                      {KONUM_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    İçerik (HTML/Script) *
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={formData.icerik}
                    onChange={(e) => setFormData({ ...formData, icerik: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white font-mono text-sm outline-none focus:border-red-600"
                    placeholder={`<!-- Reklam kodu buraya -->
<a href="https://example.com">
  <img src="/uploads/banner.jpg" alt="Reklam" />
</a>`}
                  />
                  <p className="text-xs text-gray-500 mt-1">HTML, resim veya script kodu ekleyebilirsiniz</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Başlangıç Tarihi
                    </label>
                    <input
                      type="date"
                      value={formData.baslangic}
                      onChange={(e) => setFormData({ ...formData, baslangic: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Boş = hemen başlar</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Bitiş Tarihi
                    </label>
                    <input
                      type="date"
                      value={formData.bitis}
                      onChange={(e) => setFormData({ ...formData, bitis: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Boş = süresiz</p>
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

        {/* Reklam List */}
        <div className="bg-[#161616] border border-[#262626] rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            </div>
          ) : reklamlar.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">📢</div>
              <h3 className="text-lg font-semibold text-white mb-2">Henüz reklam eklenmemiş</h3>
              <p className="text-gray-400 mb-4">Sitede gösterilecek reklamları ekleyin</p>
              <button
                onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                + İlk Reklamı Ekle
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#1a1a1a] border-b border-[#262626]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Reklam</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Konum</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tarih Aralığı</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Durum</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {reklamlar.map((r) => (
                  <tr key={r.id} className="hover:bg-[#1c1c1c] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{r.ad}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{r.icerik.substring(0, 50)}...</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-900/30 text-blue-400 border border-blue-900 rounded text-xs">
                        {getKonumLabel(r.konum)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {r.baslangic || r.bitis ? (
                        <>
                          {r.baslangic ? new Date(r.baslangic).toLocaleDateString('tr-TR') : 'Başlangıç yok'}
                          {' - '}
                          {r.bitis ? new Date(r.bitis).toLocaleDateString('tr-TR') : 'Süresiz'}
                        </>
                      ) : (
                        <span className="text-gray-500">Süresiz</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.aktif ? (
                        <span className="px-2 py-1 bg-green-900/30 text-green-400 border border-green-900 rounded text-xs">Aktif</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-800 text-gray-400 border border-gray-700 rounded text-xs">Pasif</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(r)}
                          className="text-gray-400 hover:text-white text-sm"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
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

        {/* Konum Açıklaması */}
        <div className="mt-8 bg-[#161616] border border-[#262626] rounded-lg p-6">
          <h3 className="font-bold text-white mb-4">Reklam Konumları</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex gap-3">
              <span className="px-2 py-1 bg-blue-900/30 text-blue-400 border border-blue-900 rounded text-xs h-fit">Header</span>
              <p className="text-gray-400">Sayfanın üst kısmında, header altında görünen geniş banner alanı</p>
            </div>
            <div className="flex gap-3">
              <span className="px-2 py-1 bg-blue-900/30 text-blue-400 border border-blue-900 rounded text-xs h-fit">Sidebar</span>
              <p className="text-gray-400">Sayfanın sağ tarafındaki yan alan reklamları</p>
            </div>
            <div className="flex gap-3">
              <span className="px-2 py-1 bg-blue-900/30 text-blue-400 border border-blue-900 rounded text-xs h-fit">Content</span>
              <p className="text-gray-400">Haber içerikleri arasında görünen reklamlar</p>
            </div>
            <div className="flex gap-3">
              <span className="px-2 py-1 bg-blue-900/30 text-blue-400 border border-blue-900 rounded text-xs h-fit">Footer</span>
              <p className="text-gray-400">Sayfanın alt kısmında, footer üzerinde görünen banner</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
