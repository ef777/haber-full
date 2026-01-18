'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';

interface Kategori {
  id: number;
  ad: string;
}

interface Yazar {
  id: number;
  ad: string;
}

interface Etiket {
  id: number;
  ad: string;
}

interface Haber {
  id: number;
  baslik: string;
  slug: string;
  spot: string;
  icerik: string;
  resim: string;
  resimAlt: string;
  video: string;
  kategoriId: number;
  yazarId: number;
  durum: string;
  manset: boolean;
  slider: boolean;
  sonDakika: boolean;
  seoBaslik: string;
  seoAciklama: string;
  seoKeywords: string;
  canonicalUrl: string;
  etiketler: { etiket: Etiket }[];
}

export default function HaberDuzenle() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [yazarlar, setYazarlar] = useState<Yazar[]>([]);
  const [mevcutEtiketler, setMevcutEtiketler] = useState<Etiket[]>([]);
  const [secilenEtiketler, setSecilenEtiketler] = useState<number[]>([]);
  const [yeniEtiket, setYeniEtiket] = useState('');

  const [form, setForm] = useState({
    baslik: '',
    spot: '',
    icerik: '',
    resim: '',
    resimAlt: '',
    video: '',
    kategoriId: '',
    yazarId: '',
    durum: 'taslak',
    manset: false,
    slider: false,
    sonDakika: false,
    seoBaslik: '',
    seoAciklama: '',
    seoKeywords: '',
    canonicalUrl: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [katRes, yazarRes, etiketRes, haberRes] = await Promise.all([
        fetch('/api/admin/kategoriler'),
        fetch('/api/admin/yazarlar'),
        fetch('/api/admin/etiketler'),
        fetch(`/api/admin/haberler/${id}`),
      ]);

      if (!haberRes.ok) {
        throw new Error('Haber bulunamadı');
      }

      const [katData, yazarData, etiketData, haberData] = await Promise.all([
        katRes.json(),
        yazarRes.json(),
        etiketRes.json(),
        haberRes.json(),
      ]);

      setKategoriler(katData);
      setYazarlar(yazarData);
      setMevcutEtiketler(etiketData);

      const haber: Haber = haberData;
      setForm({
        baslik: haber.baslik || '',
        spot: haber.spot || '',
        icerik: haber.icerik || '',
        resim: haber.resim || '',
        resimAlt: haber.resimAlt || '',
        video: haber.video || '',
        kategoriId: haber.kategoriId?.toString() || '',
        yazarId: haber.yazarId?.toString() || '',
        durum: haber.durum || 'taslak',
        manset: haber.manset || false,
        slider: haber.slider || false,
        sonDakika: haber.sonDakika || false,
        seoBaslik: haber.seoBaslik || '',
        seoAciklama: haber.seoAciklama || '',
        seoKeywords: haber.seoKeywords || '',
        canonicalUrl: haber.canonicalUrl || '',
      });

      setSecilenEtiketler(
        haber.etiketler?.map((e) => e.etiket.id) || []
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/haberler/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          kategoriId: form.kategoriId ? parseInt(form.kategoriId) : null,
          yazarId: form.yazarId ? parseInt(form.yazarId) : null,
          etiketIds: secilenEtiketler,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Haber güncellenemedi');
      }

      router.push('/admin/haberler');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleEtiketEkle = async () => {
    if (!yeniEtiket.trim()) return;

    try {
      const res = await fetch('/api/admin/etiketler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad: yeniEtiket.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setMevcutEtiketler([...mevcutEtiketler, data]);
        setSecilenEtiketler([...secilenEtiketler, data.id]);
        setYeniEtiket('');
      }
    } catch {
      // Ignore
    }
  };

  const toggleEtiket = (id: number) => {
    if (secilenEtiketler.includes(id)) {
      setSecilenEtiketler(secilenEtiketler.filter((e) => e !== id));
    } else {
      setSecilenEtiketler([...secilenEtiketler, id]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Haber Düzenle</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Geri
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Temel Bilgiler</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başlık *
            </label>
            <input
              type="text"
              value={form.baslik}
              onChange={(e) => setForm({ ...form, baslik: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spot (Özet)
            </label>
            <textarea
              value={form.spot}
              onChange={(e) => setForm({ ...form, spot: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              İçerik *
            </label>
            <textarea
              value={form.icerik}
              onChange={(e) => setForm({ ...form, icerik: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={10}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori *
              </label>
              <select
                value={form.kategoriId}
                onChange={(e) => setForm({ ...form, kategoriId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seçiniz</option>
                {kategoriler.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.ad}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yazar
              </label>
              <select
                value={form.yazarId}
                onChange={(e) => setForm({ ...form, yazarId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seçiniz</option>
                {yazarlar.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.ad}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Medya</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <ImageUpload
                value={form.resim}
                onChange={(url) => setForm({ ...form, resim: url })}
                label="Haber Görseli"
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resim Alt Metni (SEO)
                </label>
                <input
                  type="text"
                  value={form.resimAlt}
                  onChange={(e) => setForm({ ...form, resimAlt: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Görseli tanımlayan kısa açıklama"
                />
                <p className="text-xs text-gray-500 mt-1">SEO ve erişilebilirlik için önemli</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL (YouTube vb.)
                </label>
                <input
                  type="url"
                  value={form.video}
                  onChange={(e) => setForm({ ...form, video: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Etiketler</h2>

          <div className="flex flex-wrap gap-2">
            {mevcutEtiketler.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => toggleEtiket(e.id)}
                className={`px-3 py-1 rounded-full text-sm ${
                  secilenEtiketler.includes(e.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {e.ad}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={yeniEtiket}
              onChange={(e) => setYeniEtiket(e.target.value)}
              placeholder="Yeni etiket ekle..."
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleEtiketEkle())}
            />
            <button
              type="button"
              onClick={handleEtiketEkle}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Ekle
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Yayın Ayarları</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durum
            </label>
            <select
              value={form.durum}
              onChange={(e) => setForm({ ...form, durum: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="taslak">Taslak</option>
              <option value="yayinda">Yayında</option>
              <option value="arsiv">Arşiv</option>
            </select>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.manset}
                onChange={(e) => setForm({ ...form, manset: e.target.checked })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Manşet Haber</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.slider}
                onChange={(e) => setForm({ ...form, slider: e.target.checked })}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-sm text-gray-700">🖼️ Slayta Ekle</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.sonDakika}
                onChange={(e) => setForm({ ...form, sonDakika: e.target.checked })}
                className="w-4 h-4 text-red-600"
              />
              <span className="text-sm text-gray-700">Son Dakika</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">SEO Ayarları</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Başlık
            </label>
            <input
              type="text"
              value={form.seoBaslik}
              onChange={(e) => setForm({ ...form, seoBaslik: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Boş bırakılırsa başlık kullanılır"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Açıklama
            </label>
            <textarea
              value={form.seoAciklama}
              onChange={(e) => setForm({ ...form, seoAciklama: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Boş bırakılırsa spot kullanılır"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anahtar Kelimeler
            </label>
            <input
              type="text"
              value={form.seoKeywords}
              onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="kelime1, kelime2, kelime3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Canonical URL
            </label>
            <input
              type="url"
              value={form.canonicalUrl}
              onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Güncelle'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}
