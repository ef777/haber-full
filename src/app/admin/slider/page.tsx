'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ImageUpload from '@/components/admin/ImageUpload';

interface Slider {
  id: number;
  baslik: string;
  aciklama: string;
  resim: string;
  link: string;
  sira: number;
  aktif: boolean;
}

export default function AdminSliderPage() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    baslik: '',
    aciklama: '',
    resim: '',
    link: '',
    sira: 0,
    aktif: true,
  });
  const router = useRouter();

  useEffect(() => {
    loadSliders();
  }, []);

  const loadSliders = async () => {
    try {
      const res = await fetch('/api/admin/slider');
      if (res.status === 401) {
        router.push('/admin');
        return;
      }
      const data = await res.json();
      setSliders(data);
    } catch {
      console.error('Error loading sliders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await fetch(`/api/admin/slider/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/admin/slider', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadSliders();
    } catch {
      console.error('Error saving slider');
    }
  };

  const resetForm = () => {
    setFormData({
      baslik: '',
      aciklama: '',
      resim: '',
      link: '',
      sira: 0,
      aktif: true,
    });
  };

  const handleEdit = (slider: Slider) => {
    setFormData({
      baslik: slider.baslik,
      aciklama: slider.aciklama || '',
      resim: slider.resim,
      link: slider.link || '',
      sira: slider.sira,
      aktif: slider.aktif,
    });
    setEditingId(slider.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu slider öğesini silmek istediğinize emin misiniz?')) return;

    await fetch(`/api/admin/slider/${id}`, { method: 'DELETE' });
    loadSliders();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300">
      <header className="bg-[#161616] border-b border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
              ← Geri
            </Link>
            <h1 className="text-xl font-bold text-white">Slider Yönetimi</h1>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            + Yeni Slider
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm overflow-y-auto py-8">
            <div className="bg-[#161616] border border-[#262626] rounded-lg p-6 w-full max-w-2xl shadow-2xl mx-4">
              <h2 className="text-lg font-bold mb-4 text-white">
                {editingId ? 'Slider Düzenle' : 'Yeni Slider'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.baslik}
                    onChange={(e) => setFormData({ ...formData, baslik: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                    placeholder="Slider başlığı"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    rows={2}
                    value={formData.aciklama}
                    onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                    placeholder="Kısa açıklama"
                  />
                </div>

                <ImageUpload
                  value={formData.resim}
                  onChange={(url) => setFormData({ ...formData, resim: url })}
                  label="Slider Görseli *"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Link (Tıklandığında gidilecek sayfa)
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                  <div className="flex items-end">
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

        {/* Slider List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : sliders.length === 0 ? (
          <div className="bg-[#161616] border border-[#262626] rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🎠</div>
            <h3 className="text-lg font-semibold text-white mb-2">Henüz slider eklenmemiş</h3>
            <p className="text-gray-400 mb-4">Ana sayfada gösterilecek slider öğeleri ekleyin</p>
            <button
              onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              + İlk Slider Ekle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sliders.map((slider) => (
              <div
                key={slider.id}
                className="bg-[#161616] border border-[#262626] rounded-lg overflow-hidden group"
              >
                <div className="relative aspect-video">
                  {slider.resim && (
                    <Image
                      src={slider.resim}
                      alt={slider.baslik}
                      fill
                      className="object-cover"
                      unoptimized={slider.resim.startsWith('/uploads/')}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(slider)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(slider.id)}
                      className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Sil
                    </button>
                  </div>
                  {!slider.aktif && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-gray-800/80 text-gray-400 text-xs rounded">
                      Pasif
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                    Sıra: {slider.sira}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate">{slider.baslik}</h3>
                  {slider.aciklama && (
                    <p className="text-sm text-gray-400 truncate mt-1">{slider.aciklama}</p>
                  )}
                  {slider.link && (
                    <a
                      href={slider.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-400 truncate block mt-2"
                    >
                      {slider.link}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
