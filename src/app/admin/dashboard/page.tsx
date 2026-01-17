'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Stats {
  haberler: number;
  kategoriler: number;
  yazarlar: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ haberler: 0, kategoriler: 0, yazarlar: 0 });
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/me');
      if (!res.ok) {
        router.push('/admin');
        return;
      }
      const data = await res.json();
      setUser(data.user);
      loadStats();
    } catch {
      router.push('/admin');
    }
  };

  const loadStats = async () => {
    try {
      const [haberRes, katRes, yazRes] = await Promise.all([
        fetch('/api/admin/haberler?limit=1'),
        fetch('/api/admin/kategoriler'),
        fetch('/api/admin/yazarlar'),
      ]);

      const [haberData, katData, yazData] = await Promise.all([
        haberRes.json(),
        katRes.json(),
        yazRes.json(),
      ]);

      setStats({
        haberler: haberData.meta?.total || 0,
        kategoriler: katData.length || 0,
        yazarlar: yazData.length || 0,
      });
    } catch {
      console.error('Error loading stats');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300">
      {/* Header */}
      <header className="bg-[#161616] border-b border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Merhaba, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-400 transition-colors"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#161616] border border-[#262626] rounded-lg p-6">
            <div className="text-4xl font-bold text-red-500">{stats.haberler}</div>
            <div className="text-gray-400">Toplam Haber</div>
          </div>
          <div className="bg-[#161616] border border-[#262626] rounded-lg p-6">
            <div className="text-4xl font-bold text-blue-500">{stats.kategoriler}</div>
            <div className="text-gray-400">Kategori</div>
          </div>
          <div className="bg-[#161616] border border-[#262626] rounded-lg p-6">
            <div className="text-4xl font-bold text-green-500">{stats.yazarlar}</div>
            <div className="text-gray-400">Yazar</div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/admin/haberler"
            className="bg-[#161616] border border-[#262626] rounded-lg p-6 hover:bg-[#1c1c1c] hover:border-red-600/50 transition-all group"
          >
            <div className="text-xl font-bold mb-2 text-white group-hover:text-red-500 transition-colors">📰 Haberler</div>
            <p className="text-gray-400">Haberleri yönet, yeni haber ekle</p>
          </Link>
          <Link
            href="/admin/haberler/yeni"
            className="bg-[#161616] border border-[#262626] rounded-lg p-6 hover:bg-[#1c1c1c] hover:border-red-600/50 transition-all group"
          >
            <div className="text-xl font-bold mb-2 text-white group-hover:text-red-500 transition-colors">✏️ Yeni Haber</div>
            <p className="text-gray-400">Yeni haber oluştur</p>
          </Link>
          <Link
            href="/admin/kategoriler"
            className="bg-[#161616] border border-[#262626] rounded-lg p-6 hover:bg-[#1c1c1c] hover:border-red-600/50 transition-all group"
          >
            <div className="text-xl font-bold mb-2 text-white group-hover:text-red-500 transition-colors">📁 Kategoriler</div>
            <p className="text-gray-400">Kategorileri yönet</p>
          </Link>
          <Link
            href="/admin/yazarlar"
            className="bg-[#161616] border border-[#262626] rounded-lg p-6 hover:bg-[#1c1c1c] hover:border-red-600/50 transition-all group"
          >
            <div className="text-xl font-bold mb-2 text-white group-hover:text-red-500 transition-colors">👤 Yazarlar</div>
            <p className="text-gray-400">Yazarları yönet</p>
          </Link>
          <Link
            href="/admin/slider"
            className="bg-[#161616] border border-[#262626] rounded-lg p-6 hover:bg-[#1c1c1c] hover:border-red-600/50 transition-all group"
          >
            <div className="text-xl font-bold mb-2 text-white group-hover:text-red-500 transition-colors">🎠 Slider</div>
            <p className="text-gray-400">Ana sayfa slider yönetimi</p>
          </Link>
          <Link
            href="/admin/ayarlar"
            className="bg-[#161616] border border-[#262626] rounded-lg p-6 hover:bg-[#1c1c1c] hover:border-red-600/50 transition-all group"
          >
            <div className="text-xl font-bold mb-2 text-white group-hover:text-red-500 transition-colors">⚙️ Site Ayarları</div>
            <p className="text-gray-400">Logo, sosyal medya, özel kodlar</p>
          </Link>
          <Link
            href="/admin/eczaneler"
            className="bg-[#161616] border border-[#262626] rounded-lg p-6 hover:bg-[#1c1c1c] hover:border-red-600/50 transition-all group"
          >
            <div className="text-xl font-bold mb-2 text-white group-hover:text-red-500 transition-colors">💊 Nöbetçi Eczaneler</div>
            <p className="text-gray-400">Günlük nöbetçi eczane yönetimi</p>
          </Link>
          <Link
            href="/admin/reklamlar"
            className="bg-[#161616] border border-[#262626] rounded-lg p-6 hover:bg-[#1c1c1c] hover:border-red-600/50 transition-all group"
          >
            <div className="text-xl font-bold mb-2 text-white group-hover:text-red-500 transition-colors">📢 Reklam/İlan</div>
            <p className="text-gray-400">Reklam alanlarını yönet</p>
          </Link>
        </div>

        {/* Site Links */}
        <div className="mt-8 bg-[#161616] border border-[#262626] rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4 text-white">Site Bağlantıları</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/" target="_blank" className="text-blue-500 hover:text-blue-400 hover:underline">
              🏠 Ana Sayfa
            </Link>
            <Link href="/sitemap.xml" target="_blank" className="text-blue-500 hover:text-blue-400 hover:underline">
              🗺️ Sitemap
            </Link>
            <Link href="/news-sitemap.xml" target="_blank" className="text-blue-500 hover:text-blue-400 hover:underline">
              📰 News Sitemap
            </Link>
            <Link href="/rss/feed.xml" target="_blank" className="text-blue-500 hover:text-blue-400 hover:underline">
              📡 RSS Feed
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
