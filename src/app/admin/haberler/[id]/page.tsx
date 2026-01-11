'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Kategori {
  id: number;
  isim: string;
}

interface Yazar {
  id: number;
  isim: string;
}

interface Etiket {
  id: number;
  isim: string;
}

interface Haber {
  id: number;
  baslik: string;
  spot: string;
  icerik: string;
  resimUrl: string;
  resimAlt: string;
  kategoriId: number | null;
  yazarId: number | null;
  durum: string;
  manset: boolean;
  sondakika: boolean;
  seoBaslik: string;
  seoAciklama: string;
  seoAnahtarKelimeler: string;
  kaynak: string;
  kaynakUrl: string;
  etiketler: { etiket: Etiket }[];
}

export default function DuzenleHaberPage() {
  const params = useParams();
  const haberId = params.id as string;
  
  const [formData, setFormData] = useState({
    baslik: '',
    spot: '',
    icerik: '',
    resimUrl: '',
    resimAlt: '',
    kategoriId: '',
    yazarId: '',
    etiketler: [] as number[],
    durum: 'taslak',
    manset: false,
    sondakika: false,
    seoBaslik: '',
    seoAciklama: '',
    seoAnahtarKelimeler: '',
    kaynak: '',
    kaynakUrl: '',
  });
  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [yazarlar, setYazarlar] = useState<Yazar[]>([]);
  const [etiketler, setEtiketler] = useState<Etiket[]>([]);
  const [yeniEtiket, setYeniEtiket] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [katRes, yazRes, etRes, haberRes] = await Promise.all([
        fetch('/api/admin/kategoriler'),
        fetch('/api/admin/yazarlar'),
        fetch('/api/admin/etiketler'),
        fetch(`/api/admin/haberler/${haberId}`),
      ]);
      
      if (katRes.status === 401 || haberRes.status === 401) {
        router.push('/admin');
        return;
      }

      if (haberRes.status === 404) {
        router.push('/admin/haberler');
        return;
      }

      const [katData, yazData, etData, haberData] = await Promise.all([
        katRes.json(),
        yazRes.json(),
        etRes.json(),
        haberRes.json(),
      ]);

      setKategoriler(katData);
      setYazarlar(yazData);
      setEtiketler(etData);

      const haber = haberData as Haber;
      setFormData({
        baslik: haber.baslik || '',
        spot: haber.spot || '',
        icerik: haber.icerik || '',
        resimUrl: haber.resimUrl || '',
        resimAlt: haber.resimAlt || '',
        kategoriId: haber.kategoriId?.toString() || '',
        yazarId: haber.yazarId?.toString() || '',
        etiketler: haber.etiketler?.map(e => e.etiket.id) || [],
        durum: haber.durum || 'taslak',
        manset: haber.manset || false,
        sondakika: haber.sondakika || false,
        seoBaslik: haber.seoBaslik || '',
        seoAciklama: haber.seoAciklama || '',
        seoAnahtarKelimeler: haber.seoAnahtarKelimeler || '',
        kaynak: haber.kaynak || '',
        kaynakUrl: haber.kaynakUrl || '',
      });
    } catch {
      console.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/haberler/${haberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          kategoriId: formData.kategoriId ? Number(formData.kategoriId) : null,
          yazarId: formData.yazarId ? Number(formData.yazarId) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Haber guncellenemedi');
      }

      router.push('/admin/haberler');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata olustu');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEtiket = async () => {
    if (!yeniEtiket.trim()) return;
    
    try {
      const res = await fetch('/api/admin/etiketler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isim: yeniEtiket }),
      });
      const data = await res.json();
      setEtiketler([...etiketler, data]);
      setFormData({ ...formData, etiketler: [...formData.etiketler, data.id] });
      setYeniEtiket('');
    } catch {
      console.error('Error adding etiket');
    }
  };

  const toggleEtiket = (id: number) => {
    if (formData.etiketler.includes(id)) {
      setFormData({ ...formData, etiketler: formData.etiketler.filter(e => e !== id) });
    } else {
      setFormData({ ...formData, etiketler: [...formData.etiketler, id] });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/haberler" className="text-gray-600 hover:text-gray-900">
            ← Geri
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Haberi Duzenle</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Baslik */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Baslik *
            </label>
            <input
              type="text"
              required
              value={formData.baslik}
              onChange={(e) => setFormData({ ...formData, baslik: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Haber basligi"
            />
          </div>

          {/* Spot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spot (Ozet)
            </label>
            <textarea
              rows={2}
              value={formData.spot}
              onChange={(e) => setFormData({ ...formData, spot: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Kisa ozet"
            />
          </div>

          {/* Icerik */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icerik *
            </label>
            <textarea
              rows={12}
              required
              value={formData.icerik}
              onChange={(e) => setFormData({ ...formData, icerik: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-sm"
              placeholder="Haber icerigi (HTML destekler)"
            />
          </div>

          {/* Resim */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resim URL
              </label>
              <input
                type="url"
                value={formData.resimUrl}
                onChange={(e) => setFormData({ ...formData, resimUrl: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resim Alt Text
              </label>
              <input
                type="text"
                value={formData.resimAlt}
                onChange={(e) => setFormData({ ...formData, resimAlt: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Resim aciklamasi"
              />
            </div>
          </div>

          {/* Kategori ve Yazar */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                value={formData.kategoriId}
                onChange={(e) => setFormData({ ...formData, kategoriId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Seciniz</option>
                {kategoriler.map((k) => (
                  <option key={k.id} value={k.id}>{k.isim}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yazar
              </label>
              <select
                value={formData.yazarId}
                onChange={(e) => setFormData({ ...formData, yazarId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Seciniz</option>
                {yazarlar.map((y) => (
                  <option key={y.id} value={y.id}>{y.isim}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Etiketler */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Etiketler
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {etiketler.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => toggleEtiket(e.id)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.etiketler.includes(e.id)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {e.isim}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={yeniEtiket}
                onChange={(e) => setYeniEtiket(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2"
                placeholder="Yeni etiket ekle"
              />
              <button
                type="button"
                onClick={handleAddEtiket}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Ekle
              </button>
            </div>
          </div>

          {/* Durum ve Ozellikler */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                value={formData.durum}
                onChange={(e) => setFormData({ ...formData, durum: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="taslak">Taslak</option>
                <option value="yayinda">Yayinda</option>
                <option value="arsiv">Arsiv</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.manset}
                  onChange={(e) => setFormData({ ...formData, manset: e.target.checked })}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm text-gray-700">★ Manset</span>
              </label>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sondakika}
                  onChange={(e) => setFormData({ ...formData, sondakika: e.target.checked })}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm text-gray-700">⚡ Son Dakika</span>
              </label>
            </div>
          </div>

          {/* Kaynak */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kaynak
              </label>
              <input
                type="text"
                value={formData.kaynak}
                onChange={(e) => setFormData({ ...formData, kaynak: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Haber kaynagi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kaynak URL
              </label>
              <input
                type="url"
                value={formData.kaynakUrl}
                onChange={(e) => setFormData({ ...formData, kaynakUrl: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* SEO */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Ayarlari</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Baslik (Title Tag)
                </label>
                <input
                  type="text"
                  value={formData.seoBaslik}
                  onChange={(e) => setFormData({ ...formData, seoBaslik: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Bos birakilirsa baslik kullanilir"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Aciklama (Meta Description)
                </label>
                <textarea
                  rows={2}
                  value={formData.seoAciklama}
                  onChange={(e) => setFormData({ ...formData, seoAciklama: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Bos birakilirsa spot kullanilir (max 160 karakter)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anahtar Kelimeler
                </label>
                <input
                  type="text"
                  value={formData.seoAnahtarKelimeler}
                  onChange={(e) => setFormData({ ...formData, seoAnahtarKelimeler: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="kelime1, kelime2, kelime3"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 mt-6">
          <Link
            href="/admin/haberler"
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Iptal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Guncelle'}
          </button>
        </div>
      </form>
    </div>
  );
}
