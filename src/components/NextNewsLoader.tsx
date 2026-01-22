'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Haber {
  id: number;
  baslik: string;
  slug: string;
  spot: string | null;
  icerik: string;
  resim: string | null;
  resimAlt: string | null;
  yayinTarihi: string;
  goruntulenme: number;
  kategori: { id: number; ad: string; slug: string } | null;
  yazar: { id: number; ad: string; slug: string } | null;
  etiketler: { etiket: { id: number; ad: string; slug: string } }[];
}

interface NextNewsLoaderProps {
  currentHaberId: number;
  currentSlug: string;
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

function HaberCard({ haber }: { haber: Haber }) {
  return (
    <article className="bg-white dark:bg-[#111] rounded-xl overflow-hidden border border-gray-300 dark:border-[#262626] scroll-mt-20">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center gap-3 mb-4 text-sm">
          {haber.kategori && (
            <Link
              href={`/kategori/${haber.kategori.slug}`}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full font-medium transition-colors"
            >
              {haber.kategori.ad}
            </Link>
          )}
          <time className="text-gray-600 dark:text-gray-400">{formatDate(haber.yayinTarihi)}</time>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
          <Link href={`/haber/${haber.slug}`} className="hover:text-red-500 transition-colors">
            {haber.baslik}
          </Link>
        </h2>

        {haber.spot && (
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {haber.spot}
          </p>
        )}

        {haber.yazar && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {haber.yazar.ad.charAt(0)}
            </div>
            <span className="text-gray-600 dark:text-gray-400 text-sm">{haber.yazar.ad}</span>
          </div>
        )}
      </header>

      {/* Resim */}
      {haber.resim && (
        <figure className="relative aspect-video">
          <Image
            src={haber.resim}
            alt={haber.resimAlt || haber.baslik}
            fill
            className="object-cover"
            unoptimized={haber.resim.includes('/uploads/')}
          />
        </figure>
      )}

      {/* İçerik */}
      <div className="p-6">
        <div
          className="prose dark:prose-invert prose-lg max-w-none
            prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold
            prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
            prose-a:text-red-500 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 dark:prose-strong:text-white"
          dangerouslySetInnerHTML={{ __html: haber.icerik }}
        />

        {/* Etiketler */}
        {haber.etiketler && haber.etiketler.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-300 dark:border-[#262626]">
            <div className="flex flex-wrap gap-2">
              {haber.etiketler.map(({ etiket }) => (
                <Link
                  key={etiket.id}
                  href={`/etiket/${etiket.slug}`}
                  className="bg-gray-200 dark:bg-[#1a1a1a] hover:bg-gray-300 dark:hover:bg-[#262626] text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm transition-colors"
                >
                  #{etiket.ad}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default function NextNewsLoader({ currentHaberId, currentSlug }: NextNewsLoaderProps) {
  const [haberler, setHaberler] = useState<Haber[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeSlug, setActiveSlug] = useState(currentSlug);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const articleRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const lastLoadedId = useRef(currentHaberId);

  // Sıradaki haberleri yükle
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/haberler/sonraki?currentId=${lastLoadedId.current}&limit=1`);

      if (!res.ok) throw new Error('Haberler yüklenemedi');

      const yeniHaberler: Haber[] = await res.json();

      if (yeniHaberler.length === 0) {
        setHasMore(false);
      } else {
        setHaberler(prev => [...prev, ...yeniHaberler]);
        lastLoadedId.current = yeniHaberler[yeniHaberler.length - 1].id;
      }
    } catch (error) {
      console.error('Haber yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);

  // URL güncelleme (scroll'a göre) - pushState ile kalıcı history
  useEffect(() => {
    let lastPushedSlug = currentSlug;

    const handleScroll = () => {
      // Ana haber için kontrol - viewport'un ortasında mı?
      const mainArticle = document.querySelector('[data-main-article]');
      if (mainArticle) {
        const rect = mainArticle.getBoundingClientRect();
        // Viewport ortasına geldiğinde aktif et
        if (rect.top <= 200 && rect.bottom > 200 && activeSlug !== currentSlug) {
          setActiveSlug(currentSlug);
          if (lastPushedSlug !== currentSlug) {
            window.history.pushState({ slug: currentSlug }, '', `/haber/${currentSlug}`);
            lastPushedSlug = currentSlug;
          }
        }
      }

      // Yüklenen haberler için kontrol - daha agresif tracking
      articleRefs.current.forEach((element, slug) => {
        const rect = element.getBoundingClientRect();
        // Header'ın hemen altında (200px) geldiğinde aktif et
        const isInView = rect.top <= 200 && rect.bottom > 200;

        if (isInView && activeSlug !== slug) {
          const haber = haberler.find(h => h.slug === slug);
          if (haber) {
            setActiveSlug(slug);
            document.title = `${haber.baslik} | Haber`;
            // Sadece farklı bir habere geçildiğinde pushState yap
            if (lastPushedSlug !== slug) {
              window.history.pushState({ slug: slug, haberId: haber.id }, haber.baslik, `/haber/${slug}`);
              lastPushedSlug = slug;
            }
          }
        }
      });
    };

    // Geri/ileri tuşlarını dinle
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.slug) {
        const targetSlug = event.state.slug;
        setActiveSlug(targetSlug);

        // İlgili habere scroll yap
        if (targetSlug === currentSlug) {
          const mainArticle = document.querySelector('[data-main-article]');
          mainArticle?.scrollIntoView({ behavior: 'smooth' });
        } else {
          const targetElement = articleRefs.current.get(targetSlug);
          targetElement?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [haberler, activeSlug, currentSlug]);

  // Intersection Observer - sayfa sonuna yaklaşınca yeni haber yükle
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: '400px' }
    );

    return () => observerRef.current?.disconnect();
  }, [loadMore, hasMore, loading]);

  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    if (node) observerRef.current?.observe(node);
  }, []);

  const setArticleRef = useCallback((slug: string, element: HTMLDivElement | null) => {
    if (element) {
      articleRefs.current.set(slug, element);
    } else {
      articleRefs.current.delete(slug);
    }
  }, []);

  if (haberler.length === 0 && !loading && !hasMore) {
    return null;
  }

  return (
    <div className="mt-12 space-y-8">
      {/* Ayırıcı */}
      {(haberler.length > 0 || loading) && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-500">
            <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
            <span className="text-sm font-bold text-red-500 uppercase tracking-wider">Sonraki Haber</span>
            <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
          </div>
        </div>
      )}

      {/* Yüklenen Haberler */}
      {haberler.map((haber, index) => (
        <div key={haber.id}>
          <div
            ref={(el) => setArticleRef(haber.slug, el)}
            className="scroll-mt-20"
          >
            <HaberCard haber={haber} />
          </div>

          {/* Her haber arasında ayırıcı */}
          {index < haberler.length - 1 && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-4 text-gray-500">
                <div className="h-px w-24 bg-gradient-to-r from-transparent to-gray-400 dark:to-gray-600"></div>
                <span className="text-xs">•</span>
                <div className="h-px w-24 bg-gradient-to-l from-transparent to-gray-400 dark:to-gray-600"></div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Sonraki haber yükleniyor...</span>
          </div>
        </div>
      )}

      {/* Load more trigger */}
      {hasMore && !loading && (
        <div ref={loadMoreRef} className="h-40" />
      )}

      {/* Son */}
      {!hasMore && haberler.length > 0 && (
        <div className="text-center py-8 border-t border-gray-300 dark:border-[#262626]">
          <p className="text-gray-500 mb-4">Daha fazla haber yok</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      )}
    </div>
  );
}
