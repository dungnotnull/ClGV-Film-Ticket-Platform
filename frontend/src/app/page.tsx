import Link from 'next/link';
import { BannerSlider } from '@/components/home/banner-slider';
import { MovieCard } from '@/components/movie/MovieCard';
import { Ticket, Compass, Sparkles, MapPin, ChevronRight, ShieldCheck } from 'lucide-react';

async function getHomeData() {
  try {
    const res = await fetch('http://localhost:4000/api/v1/home', { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('Failed to fetch home data', error);
    return null;
  }
}

export default async function Home() {
  const data = await getHomeData();

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-3xl font-heading font-bold text-[#ff4b72] mb-3">
          Không thể kết nối đến máy chủ ClGV
        </h1>
        <p className="text-[#afa49b] text-sm max-w-md mx-auto">
          Vui lòng kiểm tra lại dịch vụ Backend đang chạy trên cổng 4000 hoặc tải lại trang.
        </p>
      </div>
    );
  }

  const nowShowing = data.movies?.nowShowing || [];
  const comingSoon = data.movies?.comingSoon || [];
  const banners = data.banners || [];
  const featuredCinemas = data.featuredCinemas || [];

  return (
    <div className="min-h-screen pb-24 text-[#faf8f5]">
      {/* ─── 1. HERO SECTION (Figma WEB / Home / Success / 1440) ─── */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-4 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Glow ambient background spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#ff4b72]/15 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Live Screening Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-[#faf8f5]">
            ĐANG TRÌNH CHIẾU · HỆ THỐNG PHÒNG CHIẾU IMAX LASER & 4DX
          </span>
        </div>

        {/* Tagline */}
        <p className="text-[11px] sm:text-[12px] font-medium tracking-[0.2em] uppercase text-[#ff8fa3] mb-4">
          CHUẨN MỰC ĐIỆN ẢNH ĐỈNH CAO THẾ HỆ MỚI
        </p>

        {/* Main Hero Headline (Instrument Serif in Figma) */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#faf8f5] max-w-4xl font-normal leading-[1.15] mb-6 drop-shadow-md">
          Một chuẩn mực trải nghiệm điện ảnh hoàn toàn mới tại phòng chiếu ClGV
        </h1>

        {/* Hero Subtitle */}
        <p className="font-sans text-sm sm:text-base text-[#d1c7ba] max-w-2xl leading-relaxed mb-8">
          Đắm chìm trong không gian rạp chiếu chuẩn quốc tế với màn hình sắc nét và âm thanh vòm Dolby Atmos đỉnh cao. Giữ chỗ trực quan, chọn ghế realtime qua Socket.io.
        </p>

        {/* CTA Group */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/booking/showtimes"
            className="h-12 px-8 rounded-full bg-[#ff4b72] hover:bg-[#ff6584] text-white font-medium text-sm flex items-center gap-2.5 transition-all shadow-[0_0_30px_rgba(255,75,114,0.4)] hover:scale-105"
          >
            <Ticket className="w-4 h-4" />
            <span>Đặt vé ngay</span>
          </Link>
          <Link
            href="/cinemas"
            className="h-12 px-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-[#faf8f5] font-medium text-sm flex items-center gap-2 transition-all hover:border-white/30"
          >
            <Compass className="w-4 h-4 text-[#ff8fa3]" />
            <span>Khám phá rạp chiếu</span>
          </Link>
        </div>
      </section>

      {/* ─── 2. DYNAMIC BANNER CAROUSEL ─── */}
      {banners.length > 0 && (
        <section className="max-w-[1240px] mx-auto px-4 mb-20">
          <div className="relative w-full h-[360px] md:h-[480px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <BannerSlider banners={banners} />
          </div>
        </section>
      )}

      {/* ─── 3. NOW SHOWING SECTION (Figma WEB / Home) ─── */}
      <section className="max-w-[1240px] mx-auto px-4 mb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4b72]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff8fa3]">
                ĐANG CHIẾU TẠI RẠP
              </p>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl uppercase tracking-wide text-white">
              Phim Đang Chiếu
            </h2>
          </div>

          <Link
            href="/movies?status=NOW_SHOWING"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#ff8fa3] hover:text-white transition-colors group"
          >
            <span>Xem tất cả danh sách</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {nowShowing.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-[#afa49b]">
            Hiện chưa có phim nào trong danh mục Đang chiếu.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {nowShowing.map((movie: any) => (
              <MovieCard key={movie.id} movie={movie} status="NOW_SHOWING" />
            ))}
          </div>
        )}
      </section>

      {/* ─── 4. COMING SOON SECTION (Figma WEB / Home) ─── */}
      <section className="max-w-[1240px] mx-auto px-4 mb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d1c7ba]">
                SẮP KHỞI CHIẾU
              </p>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl uppercase tracking-wide text-white">
              Phim Sắp Chiếu
            </h2>
          </div>

          <Link
            href="/movies?status=COMING_SOON"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#d1c7ba] hover:text-white transition-colors group"
          >
            <span>Lịch phát hành dự kiến</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {comingSoon.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-[#afa49b]">
            Hiện chưa có phim nào trong danh mục Sắp chiếu.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {comingSoon.map((movie: any) => (
              <MovieCard key={movie.id} movie={movie} status="COMING_SOON" />
            ))}
          </div>
        )}
      </section>

      {/* ─── 5. FEATURED CINEMAS SECTION ─── */}
      {featuredCinemas.length > 0 && (
        <section className="max-w-[1240px] mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff8fa3]">
                HỆ THỐNG PHÒNG CHIẾU CAO CẤP
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl uppercase tracking-wide text-white">
                Cụm Rạp Nổi Bật
              </h2>
            </div>
            <Link
              href="/cinemas"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#ff8fa3] hover:text-white transition-colors group"
            >
              <span>Xem tất cả cụm rạp</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCinemas.map((cinema: any) => (
              <Link
                key={cinema.id}
                href={`/cinemas/${cinema.id}`}
                className="group p-6 rounded-2xl bg-[#27211f] border border-[#4a423d]/60 hover:border-[#ff4b72]/50 transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#ff8fa3] font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{cinema.city?.name || 'TP. Hồ Chí Minh'}</span>
                  </div>
                  <h3 className="font-sans font-bold text-lg text-white group-hover:text-[#ff6584] transition-colors">
                    {cinema.name}
                  </h3>
                  <p className="text-xs text-[#afa49b] line-clamp-2">
                    {cinema.address}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[#4a423d]/40 flex items-center justify-between text-xs">
                  <span className="text-[#d1c7ba]">
                    {cinema._count?.halls || 8} phòng chiếu IMAX & 2D
                  </span>
                  <span className="text-[#ff8fa3] group-hover:translate-x-1 transition-transform">
                    Lịch chiếu →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
