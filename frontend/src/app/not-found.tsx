import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Film, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-[#1f1a18] flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="w-full max-w-lg bg-[#27211f] border border-[#4a423d] rounded-3xl p-8 sm:p-12 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff4b72]/15 blur-3xl pointer-events-none rounded-full" />

        {/* 404 Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ff4b72]/10 border border-[#ff4b72]/30 text-[#ff8fa3] text-xs font-bold tracking-widest uppercase">
          <Film className="w-3.5 h-3.5" />
          <span>404 · TRANG KHÔNG TỒN TẠI</span>
        </div>

        {/* Big 404 Text */}
        <div>
          <h1 className="text-6xl sm:text-7xl font-black font-serif text-white tracking-tight">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-[#faf8f5] mt-2">
            Không Tìm Thấy Trang Này
          </h2>
          <p className="text-xs sm:text-sm text-[#d1c7ba] mt-2 max-w-sm mx-auto leading-relaxed">
            Đường dẫn bạn đang tìm kiếm có thể đã bị thay đổi, xóa bỏ hoặc suất chiếu đã kết thúc.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto h-12 px-7 rounded-full bg-gradient-to-r from-[#ff4b72] to-[#ff6584] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer">
              <Home className="w-4 h-4" /> Về Trang Chủ
            </Button>
          </Link>

          <Link href="/movies">
            <Button
              variant="outline"
              className="w-full sm:w-auto h-12 px-7 rounded-full border-[#4a423d] text-[#d1c7ba] hover:text-white hover:bg-[#302927] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Film className="w-4 h-4 text-[#ff8fa3]" /> Xem Phim Đang Chiếu
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
