import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Play, Clock, Calendar, Film, MapPin, Sparkles, AlertTriangle, Ticket, ChevronRight } from 'lucide-react';
import { MovieShowtimesSelector } from '@/components/movie/MovieShowtimesSelector';
import { MovieTrailerModal } from '@/components/movie/MovieTrailerModal';

async function getMovie(id: string) {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/movies/${id}`, { next: { revalidate: 0 } });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch movie');
    }
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = await getMovie(id);

  if (!movie) {
    notFound();
  }

  const ageRating = movie.ageRating || 'T16';
  const ageWarningMap: Record<string, string> = {
    P: 'Phim được phép phổ biến rộng rãi đến người xem ở mọi độ tuổi.',
    K: 'Phim được phổ biến đến người xem dưới 13 tuổi với điều kiện xem cùng cha, mẹ hoặc người giám hộ.',
    T13: 'Phim được phổ biến đến người xem từ đủ 13 tuổi trở lên (13+).',
    T16: 'Phim được phổ biến đến người xem từ đủ 16 tuổi trở lên (16+).',
    T18: 'Phim được phổ biến đến người xem từ đủ 18 tuổi trở lên (18+).',
  };

  const ageWarningText = ageWarningMap[ageRating] || `Phim giới hạn độ tuổi ${ageRating}.`;
  const formatsText = movie.formats && movie.formats.length > 0 ? movie.formats.join('/') : '2D/IMAX';

  return (
    <div className="min-h-screen pb-24 text-[#faf8f5]">
      {/* ─── 1. MOVIE HERO BACKDROP (Figma Movie Hero Backdrop) ─── */}
      <div className="relative w-full min-h-[460px] md:min-h-[520px] overflow-hidden pt-12">
        {/* Background Image with Blur & Gradients */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-20 scale-110 pointer-events-none"
          style={{ backgroundImage: `url(${movie.posterUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1f1a18]/60 via-[#1f1a18]/90 to-[#1f1a18] pointer-events-none" />

        <div className="max-w-[1240px] mx-auto px-4 relative z-10 pt-6">
          {/* Breadcrumb Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-[#d1c7ba] mb-8">
            <Link href="/" className="hover:text-white transition-colors">Trang Chủ</Link>
            <ChevronRight className="w-3 h-3 text-[#afa49b]" />
            <Link href="/movies" className="hover:text-white transition-colors">Phim</Link>
            <ChevronRight className="w-3 h-3 text-[#afa49b]" />
            <span className="text-[#ff8fa3] font-medium truncate max-w-[200px]">{movie.title}</span>
          </div>

          {/* Hero Content: Poster + Info */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Poster Column */}
            <div className="md:col-span-4 lg:col-span-3 flex justify-center md:justify-start">
              <div className="relative w-[230px] sm:w-[260px] aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-[0_16px_50px_rgba(0,0,0,0.8)] bg-[#27211f]">
                <img
                  src={movie.posterUrl || 'https://via.placeholder.com/300x450'}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded bg-[#ff4b72] text-white text-xs font-black tracking-wider uppercase shadow-md">
                  {ageRating}
                </div>
              </div>
            </div>

            {/* Info Column */}
            <div className="md:col-span-8 lg:col-span-9 space-y-5">
              {/* Category Pill */}
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ff8fa3]">
                <Sparkles className="w-3.5 h-3.5 text-[#ff6584]" />
                <span>PHÒNG CHIẾU IMAX LASER & TIÊU CHUẨN</span>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <h1 className="font-heading text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white leading-tight">
                  {movie.title}
                </h1>
                {movie.titleOriginal && (
                  <p className="font-sans text-base text-[#afa49b] italic">
                    {movie.titleOriginal}
                  </p>
                )}
              </div>

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#d1c7ba]">
                <span className="px-2.5 py-1 rounded bg-white/10 text-white font-bold">{ageRating}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#ff8fa3]" /> {movie.durationMinutes || 120} phút</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#ff8fa3]" /> {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</span>
                <span className="flex items-center gap-1.5"><Film className="w-4 h-4 text-[#ff8fa3]" /> {formatsText}</span>
              </div>

              {/* Age Classification Warning */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{ageWarningText}</span>
              </div>

              {/* Synopsis */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#afa49b]">Tóm tắt nội dung</h3>
                <p className="text-sm sm:text-base leading-relaxed text-[#d1c7ba]/90 max-w-3xl">
                  {movie.description || 'Chưa có thông tin mô tả chi tiết cho bộ phim này.'}
                </p>
              </div>

              {/* Credits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                  <span className="text-[#afa49b]">Đạo diễn:</span>
                  <p className="font-semibold text-white">{movie.director || 'Đang cập nhật'}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                  <span className="text-[#afa49b]">Diễn viên:</span>
                  <p className="font-semibold text-white truncate">{movie.cast || 'Đang cập nhật'}</p>
                </div>
              </div>

              {/* Action Buttons Group */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <a
                  href="#showtimes"
                  className="h-12 px-8 rounded-full bg-[#ff4b72] hover:bg-[#ff6584] text-white font-semibold text-sm flex items-center gap-2 transition-all shadow-[0_0_25px_rgba(255,75,114,0.4)] hover:scale-105"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Chọn Suất Chiếu</span>
                </a>

                {movie.trailerUrl && (
                  <MovieTrailerModal trailerUrl={movie.trailerUrl} movieTitle={movie.title} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. SHOWTIMES & CINEMA SECTION (Figma WEB / Movie Detail) ─── */}
      <section id="showtimes" className="max-w-[1240px] mx-auto px-4 pt-16">
        <div className="space-y-2 mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ff8fa3]">
            <Sparkles className="w-3.5 h-3.5 text-[#ff6584]" />
            <span>LỊCH CHIẾU VÀ ĐẶT VÉ TRỰC TUYẾN</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl uppercase tracking-wide text-white">
            Lịch Chiếu & Đặt Vé Nhanh
          </h2>
          <p className="text-sm text-[#d1c7ba]">
            Chọn ngày và rạp phù hợp để giữ chỗ trực quan, chọn ghế realtime.
          </p>
        </div>

        {/* Dynamic Showtimes Selector by Date & Cinema */}
        <MovieShowtimesSelector showtimes={movie.showtimes || []} />
      </section>
    </div>
  );
}
