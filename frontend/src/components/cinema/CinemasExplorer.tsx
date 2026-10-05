"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Monitor, ChevronRight, Search, Sparkles } from 'lucide-react';

interface CinemasExplorerProps {
  cinemas: any[];
}

export function CinemasExplorer({ cinemas }: CinemasExplorerProps) {
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract list of unique cities and their counts
  const cityStats = useMemo(() => {
    const map: Record<string, number> = {};
    cinemas.forEach((c) => {
      const cityName = (typeof c.city === 'object' && c.city !== null)
        ? c.city.name
        : c.city || 'TP. Hồ Chí Minh';
      map[cityName] = (map[cityName] || 0) + 1;
    });
    return map;
  }, [cinemas]);

  const filteredCinemas = useMemo(() => {
    return cinemas.filter((cinema) => {
      const cityName = (typeof cinema.city === 'object' && cinema.city !== null)
        ? cinema.city.name
        : cinema.city || 'TP. Hồ Chí Minh';

      const matchesCity = selectedCity === 'ALL' || cityName === selectedCity;
      const matchesSearch =
        !searchQuery ||
        cinema.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cinema.address?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCity && matchesSearch;
    });
  }, [cinemas, selectedCity, searchQuery]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ─── Left City Sidebar (Figma City Sidebar) ─── */}
      <div className="lg:col-span-4 xl:col-span-3 space-y-4 p-5 rounded-3xl bg-[#27211f] border border-[#4a423d] shadow-lg sticky top-24">
        <div className="flex items-center justify-between pb-3 border-b border-[#4a423d]/60">
          <h3 className="font-heading text-lg font-bold uppercase tracking-wide text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#ff6584]" />
            <span>Khu vực</span>
          </h3>
          <span className="text-xs text-[#afa49b]">
            {cinemas.length} rạp
          </span>
        </div>

        {/* City Filter Pills / Buttons */}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setSelectedCity('ALL')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCity === 'ALL'
                ? 'bg-[#ff4b72] text-white shadow-md font-bold'
                : 'text-[#d1c7ba] hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>Tất cả cụm rạp</span>
            <span className="text-[11px] opacity-75">{cinemas.length}</span>
          </button>

          {Object.entries(cityStats).map(([cityName, count]) => (
            <button
              key={cityName}
              onClick={() => setSelectedCity(cityName)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCity === cityName
                  ? 'bg-[#ff4b72] text-white shadow-md font-bold'
                  : 'text-[#d1c7ba] hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{cityName}</span>
              <span className="text-[11px] opacity-75">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Right Cinema Grid (Figma Cinema Cards) ─── */}
      <div className="lg:col-span-8 xl:col-span-9 space-y-6">
        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#afa49b]" />
          <input
            type="text"
            placeholder="Tìm theo tên rạp, đường, quận huyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-full bg-[#27211f] border border-[#4a423d] text-xs text-[#faf8f5] placeholder:text-[#afa49b]/50 focus:outline-none focus:border-[#ff4b72] transition-colors shadow-sm"
          />
        </div>

        {filteredCinemas.length === 0 ? (
          <div className="p-16 rounded-3xl bg-[#27211f] border border-[#4a423d] text-center text-[#afa49b] space-y-2">
            <p className="text-base font-semibold text-white">Không tìm thấy cụm rạp</p>
            <p className="text-xs">Vui lòng thử tìm kiếm theo khu vực khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCinemas.map((cinema) => {
              const cityName = (typeof cinema.city === 'object' && cinema.city !== null)
                ? cinema.city.name
                : cinema.city || 'TP. Hồ Chí Minh';

              return (
                <div
                  key={cinema.id}
                  className="group rounded-3xl bg-[#27211f] border border-[#4a423d] hover:border-[#ff4b72]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Cinema Image Thumbnail */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#1e181b]">
                      <img
                        src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=60"
                        alt={cinema.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#27211f] via-transparent to-black/30 pointer-events-none" />

                      {/* City badge */}
                      <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-semibold text-[#faf8f5]">
                        {cityName}
                      </div>
                    </div>

                    {/* Cinema Details */}
                    <div className="px-6 space-y-3">
                      <h3 className="font-sans font-bold text-xl text-white group-hover:text-[#ff6584] transition-colors">
                        {cinema.name}
                      </h3>

                      <div className="space-y-2 text-xs text-[#d1c7ba]">
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-[#ff8fa3] shrink-0 mt-0.5" />
                          <span className="line-clamp-2 leading-relaxed">{cinema.address}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Phone className="w-4 h-4 text-[#ff8fa3] shrink-0" />
                          <span>{cinema.phone || cinema.hotline || '1900 6017'}</span>
                        </div>
                      </div>

                      {/* Hall tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff4b72]/15 border border-[#ff4b72]/30 text-[#ff8fa3]">
                          IMAX Laser
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-[#d1c7ba]">
                          4DX
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-[#d1c7ba]">
                          Dolby Atmos
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="p-6 pt-4 mt-2 border-t border-[#4a423d]/40 flex items-center justify-between">
                    <span className="text-xs text-[#afa49b]">
                      {cinema._count?.halls || 6} phòng chiếu
                    </span>
                    <Link
                      href={`/cinemas/${cinema.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-[#ff4b72] border border-white/10 hover:border-[#ff4b72] text-xs font-semibold text-white transition-all shadow-sm"
                    >
                      <span>Xem Lịch Chiếu</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
