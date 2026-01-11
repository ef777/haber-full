'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Stats {
  haberler: number;
  kategoriler: number;
  yazarlar: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({ haberler: 0, kategoriler: 0, yazarlar: 0 });
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
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [haberlerRes, kategorilerRes, yazarlarRes] = await Promise.all([
        fetch('/api/admin/haberler?limit=1'),
        fetch('/api/admin/kategoriler'),
        fetch('/api/admin/yazarlar'),
      ]);
      
      const haberlerData = await haberlerRes.json();
      const kategorilerData = await kategorilerRes.json();
      const yazarlarData = await yazarlarRes.json();

      setStats({
        haberler: haberlerData.meta?.total || 0,
        kategoriler: kategorilerData.length || 0,
        yazarlar: yazarlarData.length || 0,
      });
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
            <span className="text-gray-600">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700"
            >
              Cikis Yap
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm">Toplam Haber</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.haberler}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm">Kategoriler</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.kategoriler}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm">Yazarlar</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.yazarlar}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/haberler"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Haberler</h3>
            <p className="text-gray-600 text-sm">Haber ekle, duzenle, sil</p>
          </Link>
          <Link
            href="/admin/haberler/yeni"
            className="bg-red-600 text-white rounded-lg shadow p-6 hover:bg-red-700 transition"
          >
            <h3 className="font-semibold mb-2">+ Yeni Haber</h3>
            <p className="text-red-100 text-sm">Hizlica haber ekle</p>
          </Link>
          <Link
            href="/admin/kategoriler"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Kategoriler</h3>
            <p className="text-gray-600 text-sm">Kategori yonetimi</p>
          </Link>
          <Link
            href="/admin/yazarlar"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Yazarlar</h3>
            <p className="text-gray-600 text-sm">Yazar yonetimi</p>
          </Link>
        </div>

        {/* Site Links */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Site Linkleri</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/" target="_blank" className="text-blue-600 hover:underline">
              Ana Sayfa
            </Link>
            <Link href="/sitemap.xml" target="_blank" className="text-blue-600 hover:underline">
              Sitemap
            </Link>
            <Link href="/news-sitemap.xml" target="_blank" className="text-blue-600 hover:underline">
              News Sitemap
            </Link>
            <Link href="/rss/feed.xml" target="_blank" className="text-blue-600 hover:underline">
              RSS Feed
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
