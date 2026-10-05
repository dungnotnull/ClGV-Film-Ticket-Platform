"use client";

import { useState, useMemo } from 'react';
import { MovieCard } from '@/components/movie/MovieCard';
import { Search, Sparkles, Filter, SlidersHorizontal } from 'lucide-react';

interface MoviesExplorerProps {
  initialNowShowing: any[];
  initialComingSoon: any[];
}

const GENRES = [
  'Tất cả',
  'Hành động',
  'Kinh dị',
  'Tâm lý',
  'Hoạt hình',
  'Hài hước',
  'Khoa học viễn tưởng',
  'Tình cảm',
  'Phiêu lưu',
];

export function MoviesExplorer({ initialNowShowing, initialComingSoon }: MoviesExplorerProps) {
  const [activeTab, setActiveTab] = useState<'NOW_SHOWING' | 'COMING_SOON'>('NOW_SHOWING');
  const [selectedGenre, setSelectedGenre] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'duration'>('newest');

  const currentList = activeTab === 'NOW_SHOWING' ? initialNowShowing : initialComingSoon;

  const filteredMovies = useMemo(() => {
    return currentList.filter((movie) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        movie.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.titleOriginal?.toLowerCase().includes(searchQuery.toLowerCase());

      // Genre filter
      const matchesGenre =
        selectedGenre === 'Tất cả' ||
        (Array.isArray(movie.genres) &&
          movie.genres.some((g: string) => g.toLowerCase() === selectedGenre.toLowerCase()));

      return matchesSearch && matchesGenre;
    });
  }, [currentList, searchQuery, selectedGenre]);

  return (
    <div className="space-y-8">
      {/* ─── Controls Row (Tabs, Search, Sort) ─── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-2 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
        {/* Status Tabs Pills */}
        <div className="flex items-center gap-2 p-1 rounded-full bg-black/40 border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('NOW_SHOWING')}
            className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'NOW_SHOWING'
                ? 'bg-[#ff4b72] text-white shadow-[0_4px_16px_rgba(255,75,114,0.4)]'
                : 'text-[#d1c7ba] hover:text-white'
            }`}
          >
            Đang Chiếu ({initialNowShowing.length})
          </button>
          <button
            onClick={() => setActiveTab('COMING_SOON')}
            className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'COMING_SOON'
                ? 'bg-[#ff4b72] text-white shadow-[0_4px_16px_rgba(255,75,114,0.4)]'
                : 'text-[#d1c7ba] hover:text-white'
            }`}
          >
            Sắp Chiếu ({initialComingSoon.length})
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3 flex-1 lg:max-w-md justify-end">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#afa49b]" />
            <input
              type="text"
              placeholder="Tìm tên phim, diễn viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-full bg-[#27211f] border border-[#4a423d] text-xs text-[#faf8f5] placeholder:text-[#afa49b]/50 focus:outline-none focus:border-[#ff4b72] transition-colors"
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 px-3 h-10 rounded-full bg-[#27211f] border border-[#4a423d] text-xs text-[#d1c7ba]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#ff8fa3]" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-xs text-[#d1c7ba] focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-[#27211f]">Mới nhất</option>
              <option value="duration" className="bg-[#27211f]">Thời lượng</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Filter Genres Row ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold text-[#afa49b] mr-2 shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-[#ff8fa3]" />
          Thể loại:
        </span>
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${
              selectedGenre === genre
                ? 'bg-white/20 text-white border border-white/30 shadow-sm'
                : 'bg-white/[0.04] text-[#d1c7ba] border border-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* ─── Movies Grid ─── */}
      {filteredMovies.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white/[0.02] border border-white/5 text-center text-[#afa49b] space-y-2">
          <p className="text-base text-[#faf8f5] font-semibold">Không tìm thấy phim phù hợp</p>
          <p className="text-xs">Thử tìm kiếm với từ khóa khác hoặc bỏ chọn bộ lọc thể loại.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} status={activeTab} />
          ))}
        </div>
      )}
    </div>
  );
}
