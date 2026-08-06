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
    <div className="relative w-full h-full overflow-hidden group">
      {banners.map((banner, index) => (
        <div 
          key={banner.id}
          className={`absolute top-0 left-0 w-full h-full transition-all duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <div className="w-full h-full relative overflow-hidden">
            <img 
              src={banner.imageUrl} 
              alt={banner.title} 
              className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${index === currentIndex ? 'scale-110' : 'scale-100'}`}
            />
            {/* Dark vignette overlay for cinematic feel */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/80 pointer-events-none z-10" />
            {/* Deep bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none z-10" />
            
            <div className="absolute bottom-16 left-12 text-white z-20 flex flex-col gap-4 max-w-2xl">
              <h2 className="text-5xl font-black uppercase tracking-widest drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 py-2 leading-relaxed">
                {banner.title}
              </h2>
              <p className="text-lg text-white/80 line-clamp-2 drop-shadow-md">
                Khám phá thế giới điện ảnh đỉnh cao. Đặt vé ngay hôm nay để nhận nhiều ưu đãi hấp dẫn từ hệ thống rạp ClGV toàn quốc!
              </p>
              <div>
                <Link 
                  href={banner.linkUrl || '#'}
                  className="inline-flex items-center justify-center px-8 py-3 mt-4 text-sm font-bold uppercase tracking-widest text-white bg-primary rounded hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(225,29,72,0.6)]"
                >
                  Đặt vé ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-30">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all duration-500 ${index === currentIndex ? 'w-8 bg-primary shadow-[0_0_10px_rgba(225,29,72,0.8)]' : 'w-2 bg-white/30 hover:bg-white/60'}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
