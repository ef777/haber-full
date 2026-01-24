'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface SliderItem {
  id: number;
  baslik: string;
  aciklama: string | null;
  resim: string;
  link: string | null;
}

interface SliderProps {
  items: SliderItem[];
  autoPlayInterval?: number;
}

export default function Slider({ items, autoPlayInterval = 5000 }: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play
  useEffect(() => {
    if (items.length <= 1 || isHovered) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [items.length, isHovered, autoPlayInterval, nextSlide]);

  if (!items || items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];

  const slideContent = (
    <div className="relative w-full h-full">
      <Image
        src={currentItem.resim}
        alt={currentItem.baslik}
        fill
        className="object-cover"
        priority={currentIndex === 0}
        unoptimized={currentItem.resim.includes('/uploads/')}
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 line-clamp-2 drop-shadow-lg">
          {currentItem.baslik}
        </h2>
        {currentItem.aciklama && (
          <p className="text-white text-sm md:text-base line-clamp-2 max-w-2xl drop-shadow">
            {currentItem.aciklama}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-[var(--bg-secondary)] rounded-lg overflow-hidden transition-colors duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Slide */}
      {currentItem.link ? (
        <Link href={currentItem.link} className="block w-full h-full">
          {slideContent}
        </Link>
      ) : (
        slideContent
      )}

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
            style={{ opacity: isHovered ? 1 : 0 }}
            aria-label="Önceki"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
            style={{ opacity: isHovered ? 1 : 0 }}
            aria-label="Sonraki"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-red-600 w-8'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {items.length > 1 && !isHovered && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-red-600 transition-all"
            style={{
              animation: `progress ${autoPlayInterval}ms linear`,
              animationIterationCount: 'infinite',
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
