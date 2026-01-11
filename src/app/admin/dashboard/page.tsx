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
  const [user, setUser] = useState<{ isim: string } | null>(null);
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Merhaba, {user?.isim}</span>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-red-600">{stats.haberler}</div>
            <div className="text-gray-600">Toplam Haber</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-blue-600">{stats.kategoriler}</div>
            <div className="text-gray-600">Kategori</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-green-600">{stats.yazarlar}</div>
            <div className="text-gray-600">Yazar</div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/admin/haberler"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-xl font-bold mb-2">📰 Haberler</div>
            <p className="text-gray-600">Haberleri yönet, yeni haber ekle</p>
          </Link>
          <Link
            href="/admin/haberler/yeni"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-xl font-bold mb-2">✏️ Yeni Haber</div>
            <p className="text-gray-600">Yeni haber oluştur</p>
          </Link>
          <Link
            href="/admin/kategoriler"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-xl font-bold mb-2">📁 Kategoriler</div>
            <p className="text-gray-600">Kategorileri yönet</p>
          </Link>
          <Link
            href="/admin/yazarlar"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-xl font-bold mb-2">👤 Yazarlar</div>
            <p className="text-gray-600">Yazarları yönet</p>
          </Link>
        </div>

        {/* Site Links */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Site Bağlantıları</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/" target="_blank" className="text-blue-600 hover:underline">
              🏠 Ana Sayfa
            </Link>
            <Link href="/sitemap.xml" target="_blank" className="text-blue-600 hover:underline">
              🗺️ Sitemap
            </Link>
            <Link href="/news-sitemap.xml" target="_blank" className="text-blue-600 hover:underline">
              📰 News Sitemap
            </Link>
            <Link href="/rss/feed.xml" target="_blank" className="text-blue-600 hover:underline">
              📡 RSS Feed
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
