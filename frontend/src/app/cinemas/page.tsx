import { CinemasExplorer } from '@/components/cinema/CinemasExplorer';
import { Sparkles } from 'lucide-react';

async function getCinemas() {
  try {
    const res = await fetch('http://localhost:4000/api/v1/cinemas', { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error('Failed to fetch cinemas', error);
    return [];
  }
}

export default async function CinemasPage() {
  const cinemas = await getCinemas();

  return (
    <div className="min-h-screen pb-24 text-[#faf8f5] pt-12 md:pt-16">
      <div className="max-w-[1240px] mx-auto px-4 space-y-10">
        {/* ─── Header & Category Pill (Figma WEB / Cinemas / Success / 1440) ─── */}
        <div className="space-y-3 text-center max-w-3xl mx-auto">
          {/* Category Tag Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ff4b72]/10 border border-[#ff4b72]/30 text-[#ff8fa3] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#ff6584]" />
            <span>HỆ THỐNG RẠP CHIẾU TOÀN QUỐC</span>
          </div>

          {/* Heading */}
          <h1 className="font-heading text-4xl sm:text-5xl font-bold uppercase tracking-tight text-white">
            Cụm Rạp Chiếu Phim ClGV Cinema
          </h1>

          {/* Subtitle */}
          <p className="font-sans text-sm sm:text-base text-[#d1c7ba] max-w-2xl mx-auto leading-relaxed">
            Khám phá các cụm rạp tiêu chuẩn quốc tế trải dài khắp các tỉnh thành với trang bị màn chiếu IMAX Laser, công nghệ 4DX và âm thanh Dolby Atmos.
          </p>
        </div>

        {/* ─── Cinemas Explorer (Sidebar + Cards) ─── */}
        <CinemasExplorer cinemas={cinemas} />
      </div>
    </div>
  );
}
