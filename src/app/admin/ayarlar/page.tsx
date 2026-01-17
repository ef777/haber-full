'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';

interface SiteAyarlari {
  id: number;
  siteAdi: string;
  siteUrl: string;
  siteAciklama: string;
  logoUrl: string;
  logoAltUrl: string;
  faviconUrl: string;
  footerText: string;
  copyrightText: string;
  sosyalFacebook: string;
  sosyalTwitter: string;
  sosyalInstagram: string;
  sosyalYoutube: string;
  sosyalTiktok: string;
  sosyalLinkedin: string;
  analyticsId: string;
  headerKod: string;
  footerKod: string;
  iletisimEmail: string;
  iletisimTelefon: string;
  iletisimAdres: string;
}

export default function AdminAyarlarPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('genel');
  const router = useRouter();

  const [form, setForm] = useState<SiteAyarlari>({
    id: 0,
    siteAdi: '',
    siteUrl: '',
    siteAciklama: '',
    logoUrl: '',
    logoAltUrl: '',
    faviconUrl: '',
    footerText: '',
    copyrightText: '',
    sosyalFacebook: '',
    sosyalTwitter: '',
    sosyalInstagram: '',
    sosyalYoutube: '',
    sosyalTiktok: '',
    sosyalLinkedin: '',
    analyticsId: '',
    headerKod: '',
    footerKod: '',
    iletisimEmail: '',
    iletisimTelefon: '',
    iletisimAdres: '',
  });

  useEffect(() => {
    loadAyarlar();
  }, []);

  const loadAyarlar = async () => {
    try {
      const res = await fetch('/api/admin/ayarlar');
      if (res.status === 401) {
        router.push('/admin');
        return;
      }
      const data = await res.json();
      setForm({
        ...data,
        siteAdi: data.siteAdi || '',
        siteUrl: data.siteUrl || '',
        siteAciklama: data.siteAciklama || '',
        logoUrl: data.logoUrl || '',
        logoAltUrl: data.logoAltUrl || '',
        faviconUrl: data.faviconUrl || '',
        footerText: data.footerText || '',
        copyrightText: data.copyrightText || '',
        sosyalFacebook: data.sosyalFacebook || '',
        sosyalTwitter: data.sosyalTwitter || '',
        sosyalInstagram: data.sosyalInstagram || '',
        sosyalYoutube: data.sosyalYoutube || '',
        sosyalTiktok: data.sosyalTiktok || '',
        sosyalLinkedin: data.sosyalLinkedin || '',
        analyticsId: data.analyticsId || '',
        headerKod: data.headerKod || '',
        footerKod: data.footerKod || '',
        iletisimEmail: data.iletisimEmail || '',
        iletisimTelefon: data.iletisimTelefon || '',
        iletisimAdres: data.iletisimAdres || '',
      });
    } catch {
      setError('Ayarlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/ayarlar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error('Ayarlar kaydedilemedi');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'genel', label: 'Genel', icon: '⚙️' },
    { id: 'logo', label: 'Logo & Görsel', icon: '🖼️' },
    { id: 'sosyal', label: 'Sosyal Medya', icon: '📱' },
    { id: 'iletisim', label: 'İletişim', icon: '📧' },
    { id: 'kod', label: 'Özel Kodlar', icon: '💻' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300">
      <header className="bg-[#161616] border-b border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
              ← Geri
            </Link>
            <h1 className="text-xl font-bold text-white">Site Ayarları</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Kaydediliyor...
              </>
            ) : (
              'Kaydet'
            )}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-900/30 border border-red-900 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/30 border border-green-900 text-green-400 p-4 rounded-lg mb-6">
            Ayarlar başarıyla kaydedildi!
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-[#262626] pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#262626] hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Genel Ayarlar */}
          {activeTab === 'genel' && (
            <div className="bg-[#161616] border border-[#262626] rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-[#262626] pb-3">
                Genel Site Ayarları
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Site Adı *
                  </label>
                  <input
                    type="text"
                    value={form.siteAdi}
                    onChange={(e) => setForm({ ...form, siteAdi: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                    placeholder="Site adı"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Site URL
                  </label>
                  <input
                    type="url"
                    value={form.siteUrl}
                    onChange={(e) => setForm({ ...form, siteUrl: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Site Açıklaması (SEO)
                </label>
                <textarea
                  value={form.siteAciklama}
                  onChange={(e) => setForm({ ...form, siteAciklama: e.target.value })}
                  rows={3}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                  placeholder="Sitenizin kısa açıklaması (meta description)"
                />
                <p className="text-xs text-gray-500 mt-1">SEO için önemli: 150-160 karakter önerilir</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Footer Metni
                </label>
                <textarea
                  value={form.footerText}
                  onChange={(e) => setForm({ ...form, footerText: e.target.value })}
                  rows={2}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                  placeholder="Footer alanında görünecek açıklama metni"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Copyright Metni
                </label>
                <input
                  type="text"
                  value={form.copyrightText}
                  onChange={(e) => setForm({ ...form, copyrightText: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                  placeholder="© 2024 Site Adı. Tüm hakları saklıdır."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  value={form.analyticsId}
                  onChange={(e) => setForm({ ...form, analyticsId: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                  placeholder="G-XXXXXXXXXX veya UA-XXXXXXXXX-X"
                />
              </div>
            </div>
          )}

          {/* Logo & Görsel Ayarları */}
          {activeTab === 'logo' && (
            <div className="bg-[#161616] border border-[#262626] rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-[#262626] pb-3">
                Logo ve Görsel Ayarları
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUpload
                  value={form.logoUrl}
                  onChange={(url) => setForm({ ...form, logoUrl: url })}
                  label="Ana Logo (Header)"
                />

                <ImageUpload
                  value={form.logoAltUrl}
                  onChange={(url) => setForm({ ...form, logoAltUrl: url })}
                  label="Alternatif Logo (Footer)"
                />
              </div>

              <ImageUpload
                value={form.faviconUrl}
                onChange={(url) => setForm({ ...form, faviconUrl: url })}
                label="Favicon"
                className="max-w-md"
              />
              <p className="text-xs text-gray-500">Tavsiye: 32x32 veya 64x64 piksel PNG/ICO formatı</p>
            </div>
          )}

          {/* Sosyal Medya Ayarları */}
          {activeTab === 'sosyal' && (
            <div className="bg-[#161616] border border-[#262626] rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-[#262626] pb-3">
                Sosyal Medya Hesapları
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={form.sosyalFacebook}
                    onChange={(e) => setForm({ ...form, sosyalFacebook: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                    placeholder="https://facebook.com/sayfaniz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Twitter / X
                  </label>
                  <input
                    type="url"
                    value={form.sosyalTwitter}
                    onChange={(e) => setForm({ ...form, sosyalTwitter: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                    placeholder="https://twitter.com/hesabiniz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={form.sosyalInstagram}
                    onChange={(e) => setForm({ ...form, sosyalInstagram: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                    placeholder="https://instagram.com/hesabiniz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    YouTube
                  </label>
                  <input
                    type="url"
                    value={form.sosyalYoutube}
                    onChange={(e) => setForm({ ...form, sosyalYoutube: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                    placeholder="https://youtube.com/@kanaliniz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    TikTok
                  </label>
                  <input
                    type="url"
                    value={form.sosyalTiktok}
                    onChange={(e) => setForm({ ...form, sosyalTiktok: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                    placeholder="https://tiktok.com/@hesabiniz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={form.sosyalLinkedin}
                    onChange={(e) => setForm({ ...form, sosyalLinkedin: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                    placeholder="https://linkedin.com/company/sirketiniz"
                  />
                </div>
              </div>
            </div>
          )}

          {/* İletişim Ayarları */}
          {activeTab === 'iletisim' && (
            <div className="bg-[#161616] border border-[#262626] rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-[#262626] pb-3">
                İletişim Bilgileri
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    E-posta Adresi
                  </label>
                  <input
                    type="email"
                    value={form.iletisimEmail}
                    onChange={(e) => setForm({ ...form, iletisimEmail: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                    placeholder="iletisim@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    value={form.iletisimTelefon}
                    onChange={(e) => setForm({ ...form, iletisimTelefon: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                    placeholder="+90 (XXX) XXX XX XX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Adres
                </label>
                <textarea
                  value={form.iletisimAdres}
                  onChange={(e) => setForm({ ...form, iletisimAdres: e.target.value })}
                  rows={3}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                  placeholder="Sokak, Mahalle, İlçe/Şehir"
                />
              </div>
            </div>
          )}

          {/* Özel Kod Ayarları */}
          {activeTab === 'kod' && (
            <div className="bg-[#161616] border border-[#262626] rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-[#262626] pb-3">
                Özel Kod Alanları
              </h2>

              <div className="bg-yellow-900/20 border border-yellow-700 text-yellow-300 p-4 rounded-lg text-sm">
                <strong>Dikkat:</strong> Bu alanlara eklenen kodlar doğrudan sitenize eklenir.
                Sadece güvendiğiniz kaynaklardan gelen kodları ekleyin. Hatalı kod sitenizin
                çalışmasını engelleyebilir.
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Header Kodu ({"<head>"} içine eklenir)
                </label>
                <textarea
                  value={form.headerKod}
                  onChange={(e) => setForm({ ...form, headerKod: e.target.value })}
                  rows={8}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white font-mono text-sm outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                  placeholder={`<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Google Analytics, Facebook Pixel, meta tagları vb. kodları buraya ekleyin
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Footer Kodu ({"</body>"} öncesine eklenir)
                </label>
                <textarea
                  value={form.footerKod}
                  onChange={(e) => setForm({ ...form, footerKod: e.target.value })}
                  rows={8}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white font-mono text-sm outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                  placeholder={`<!-- Chat Widget -->
<script>
  // Chat widget kodu buraya
</script>`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Canlı destek, chat widget, analitik scriptleri vb. kodları buraya ekleyin
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
