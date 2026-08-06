"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function BannerSlider({ banners }: { banners: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Slide every 5 seconds
    
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners || banners.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-900">
        <h2 className="text-3xl font-bold text-primary">CGV Promotions</h2>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {banners.map((banner, index) => (
        <div 
          key={banner.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <Link href={banner.linkUrl || '#'}>
            <div className="w-full h-full relative">
              <img 
                src={banner.imageUrl} 
                alt={banner.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-10 left-10 text-white z-20">
                <h2 className="text-4xl font-bold uppercase tracking-wider drop-shadow-lg">{banner.title}</h2>
              </div>
            </div>
          </Link>
        </div>
      ))}
      
      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex ? 'bg-primary' : 'bg-white/50 hover:bg-white/80'}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
