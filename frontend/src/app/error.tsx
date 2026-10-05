'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-[75vh] bg-[#1f1a18] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-[#27211f] border border-[#4a423d] rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Error State Pill (Figma 3274:14941) */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold tracking-widest uppercase">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>LỖI KẾT NỐI HỆ THỐNG</span>
        </div>

        {/* Error Bubble (Figma 3274:14942) */}
        <div className="relative mx-auto w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <span className="text-4xl font-extrabold font-serif">!</span>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <h2 className="text-2xl font-serif text-white font-bold tracking-wide">
            Có lỗi khi tải dữ liệu
          </h2>
          <p className="text-xs text-[#d1c7ba] leading-relaxed">
            Hệ thống không thể kết nối tới máy chủ hoặc đã xảy ra sự cố không mong muốn. Vui lòng thử tải lại trang hoặc quay về trang chủ.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="flex-1 h-12 rounded-full bg-gradient-to-r from-[#ff4b72] to-[#ff6584] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Thử Tải Lại
          </Button>

          <Link href="/" className="flex-1">
            <Button
              variant="outline"
              className="w-full h-12 rounded-full border-[#4a423d] text-[#d1c7ba] hover:text-white hover:bg-[#302927] font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" /> Về Trang Chủ
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
