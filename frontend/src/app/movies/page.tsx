import { MoviesExplorer } from '@/components/movie/MoviesExplorer';
import { Sparkles } from 'lucide-react';

async function getMovies(status: 'NOW_SHOWING' | 'COMING_SOON') {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/movies?status=${status}&limit=50`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error('Failed to fetch movies', error);
    return [];
  }
}

export default async function MoviesPage() {
  const [nowShowing, comingSoon] = await Promise.all([
    getMovies('NOW_SHOWING'),
    getMovies('COMING_SOON'),
  ]);

  return (
    <div className="min-h-screen pb-24 text-[#faf8f5] pt-12 md:pt-16">
      <div className="max-w-[1240px] mx-auto px-4 space-y-8">
        {/* ─── Header & Category Pill (Figma WEB / Movies / Success / 1440) ─── */}
        <div className="space-y-3 text-center max-w-3xl mx-auto">
          {/* Category Tag Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ff4b72]/10 border border-[#ff4b72]/30 text-[#ff8fa3] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#ff6584]" />
            <span>DANH MỤC PHIM CHIẾU RẠP</span>
          </div>

          {/* Heading */}
          <h1 className="font-heading text-4xl sm:text-5xl font-bold uppercase tracking-tight text-white">
            Phim Chiếu Rạp & Suất Chiếu Tại ClGV
          </h1>

          {/* Subtitle */}
          <p className="font-sans text-sm sm:text-base text-[#d1c7ba] max-w-2xl mx-auto leading-relaxed">
            Thưởng thức các siêu phẩm điện ảnh đỉnh cao với chất lượng âm thanh Dolby Atmos và màn chiếu IMAX Laser chuẩn quốc tế.
          </p>
        </div>

        {/* ─── Movies Explorer (Tabs, Filters, Movie Cards) ─── */}
        <MoviesExplorer initialNowShowing={nowShowing} initialComingSoon={comingSoon} />
      </div>
    </div>
  );
}
