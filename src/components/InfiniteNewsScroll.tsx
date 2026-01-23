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

interface InfiniteNewsScrollProps {
  initialHaber: Haber;
  ilgiliHaberler: Haber[];
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

function HaberContent({ haber, isFirst }: { haber: Haber; isFirst: boolean }) {
  return (
    <article className="haber-article bg-white dark:bg-[#111] rounded-xl overflow-hidden border border-gray-300 dark:border-[#262626]">
      {/* Header */}
      <header className="p-6 md:p-8">
        {/* Kategori ve Tarih */}
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
          <span className="text-gray-500">•</span>
          <span className="text-gray-600 dark:text-gray-400">{haber.goruntulenme.toLocaleString('tr-TR')} görüntülenme</span>
        </div>

        {/* Başlık */}
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
          {haber.baslik}
        </h1>

        {/* Spot */}
        {haber.spot && (
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {haber.spot}
          </p>
        )}

        {/* Yazar */}
        {haber.yazar && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
              {haber.yazar.ad.charAt(0)}
            </div>
            <div>
              <Link href={`/yazar/${haber.yazar.slug}`} className="text-gray-900 dark:text-white font-medium hover:text-red-500 transition-colors">
                {haber.yazar.ad}
              </Link>
            </div>
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
            priority={isFirst}
            unoptimized={haber.resim.includes('/uploads/')}
          />
          {haber.resimAlt && (
            <figcaption className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 text-sm text-white text-center">
              {haber.resimAlt}
            </figcaption>
          )}
        </figure>
      )}

      {/* İçerik */}
      <div className="p-6 md:p-8">
        <div
          className="prose prose-gray dark:prose-invert prose-lg max-w-none
            prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold
            prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
            prose-a:text-red-500 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-blockquote:border-l-red-600 prose-blockquote:bg-gray-100 dark:prose-blockquote:bg-[#1a1a1a] prose-blockquote:py-2 prose-blockquote:px-4
            prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: haber.icerik }}
        />

        {/* Etiketler */}
        {haber.etiketler && haber.etiketler.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-300 dark:border-[#262626]">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Etiketler</h3>
            <div className="flex flex-wrap gap-2">
              {haber.etiketler.map(({ etiket }) => (
                <Link
                  key={etiket.id}
                  href={`/etiket/${etiket.slug}`}
                  className="bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-200 dark:hover:bg-[#1c1c1c] text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm transition-colors"
                >
                  #{etiket.ad}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ayırıcı */}
      <div className="h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
    </article>
  );
}

export default function InfiniteNewsScroll({ initialHaber, ilgiliHaberler }: InfiniteNewsScrollProps) {
  const [haberler, setHaberler] = useState<Haber[]>([initialHaber]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentHaberId, setCurrentHaberId] = useState(initialHaber.id);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const articleRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Sıradaki haberleri yükle
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const lastHaber = haberler[haberler.length - 1];
      const res = await fetch(`/api/haberler/sonraki?currentId=${lastHaber.id}&limit=3`);

      if (!res.ok) throw new Error('Haberler yüklenemedi');

      const yeniHaberler: Haber[] = await res.json();

      if (yeniHaberler.length === 0) {
        setHasMore(false);
      } else {
        setHaberler(prev => [...prev, ...yeniHaberler]);
      }
    } catch (error) {
      console.error('Haber yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  }, [haberler, loading, hasMore]);

  // URL güncelleme (scroll'a göre)
  useEffect(() => {
    const handleScroll = () => {
      // Her haber article'ının pozisyonunu kontrol et
      articleRefs.current.forEach((element, haberId) => {
        const rect = element.getBoundingClientRect();
        const isInView = rect.top <= 100 && rect.bottom > 100;

        if (isInView && currentHaberId !== haberId) {
          const haber = haberler.find(h => h.id === haberId);
          if (haber) {
            setCurrentHaberId(haberId);
            // URL'i güncelle (sayfa yenilemeden)
            window.history.replaceState(
              { haberId: haberId },
              haber.baslik,
              `/haber/${haber.slug}`
            );
            // Sayfa başlığını güncelle
            document.title = `${haber.baslik} | Haber`;
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [haberler, currentHaberId]);

  // Intersection Observer - sayfa sonuna yaklaşınca yeni haber yükle
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: '500px' }
    );

    return () => observerRef.current?.disconnect();
  }, [loadMore, hasMore, loading]);

  // Load more trigger element
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    if (node) observerRef.current?.observe(node);
  }, []);

  // Article ref'lerini kaydet
  const setArticleRef = useCallback((haberId: number, element: HTMLDivElement | null) => {
    if (element) {
      articleRefs.current.set(haberId, element);
    } else {
      articleRefs.current.delete(haberId);
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Haberler */}
      {haberler.map((haber, index) => (
        <div
          key={haber.id}
          ref={(el) => setArticleRef(haber.id, el)}
          className="scroll-mt-20"
        >
          <HaberContent haber={haber} isFirst={index === 0} />

          {/* Her haberden sonra küçük bir ayırıcı */}
          {index < haberler.length - 1 && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-4 text-gray-500">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-400 dark:to-gray-600"></div>
                <span className="text-sm">Sonraki Haber</span>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-400 dark:to-gray-600"></div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Yükleniyor...</span>
          </div>
        </div>
      )}

      {/* Load more trigger (görünmez element) */}
      {hasMore && !loading && (
        <div ref={loadMoreRef} className="h-10" />
      )}

      {/* Son */}
      {!hasMore && haberler.length > 1 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Tüm haberler yüklendi</p>
        </div>
      )}

      {/* İlgili Haberler (ilk haber için) */}
      {ilgiliHaberler.length > 0 && haberler.length === 1 && (
        <section className="bg-white dark:bg-[#111] rounded-xl p-6 border border-gray-300 dark:border-[#262626]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-red-600 pl-4">
            İlgili Haberler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ilgiliHaberler.map((ilgili) => (
              <Link
                key={ilgili.id}
                href={`/haber/${ilgili.slug}`}
                className="flex gap-4 group bg-gray-50 dark:bg-[#0a0a0a] p-3 rounded-lg border border-gray-300 dark:border-[#262626] hover:border-red-600/50 transition-all"
              >
                {ilgili.resim ? (
                  <Image
                    src={ilgili.resim}
                    alt={ilgili.baslik}
                    width={120}
                    height={80}
                    className="w-28 h-20 object-cover rounded"
                    unoptimized={ilgili.resim.includes('/uploads/')}
                  />
                ) : (
                  <div className="w-28 h-20 bg-gray-200 dark:bg-[#0a0a0a] rounded flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-600 text-xs">Resim yok</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-gray-900 dark:text-white font-medium group-hover:text-red-500 transition-colors line-clamp-2">
                    {ilgili.baslik}
                  </h3>
                  <time className="text-xs text-gray-500 mt-2 block">
                    {formatDate(ilgili.yayinTarihi)}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
