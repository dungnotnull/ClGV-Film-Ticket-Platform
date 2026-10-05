"use client";

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { MapPin, Clock, Calendar, ChevronRight, ChevronLeft, ArrowRight, Sparkles } from 'lucide-react';

interface MovieShowtimesSelectorProps {
  showtimes: any[];
}

export function MovieShowtimesSelector({ showtimes }: MovieShowtimesSelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Group showtimes by Date key (YYYY-MM-DD)
  const groupedByDate = useMemo(() => {
    const map: Record<string, { label: string; subLabel: string; showtimes: any[] }> = {};

    showtimes.forEach((st) => {
      const d = new Date(st.startTime);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      if (!map[dateKey]) {
        const today = new Date();
        const isToday = d.toDateString() === today.toDateString();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const isTomorrow = d.toDateString() === tomorrow.toDateString();

        let label = d.toLocaleDateString('vi-VN', { weekday: 'long' });
        if (isToday) label = 'Hôm nay';
        else if (isTomorrow) label = 'Ngày mai';

        const subLabel = `${day}.${month}`;

        map[dateKey] = { label, subLabel, showtimes: [] };
      }

      map[dateKey].showtimes.push(st);
    });

    return map;
  }, [showtimes]);

  const dateKeys = Object.keys(groupedByDate).sort();
  const [selectedDate, setSelectedDate] = useState<string>(dateKeys[0] || '');

  // Group the selected date's showtimes by Cinema
  const cinemasOnSelectedDate = useMemo(() => {
    if (!selectedDate || !groupedByDate[selectedDate]) return {};

    const cinemaMap: Record<string, { cinema: any; list: any[] }> = {};
    groupedByDate[selectedDate].showtimes.forEach((st) => {
      const cId = st.cinema?.id || st.hall?.cinemaId || st.cinemaId || 'default';
      const cName = st.cinema?.name || 'ClGV Cinema';

      if (!cinemaMap[cId]) {
        cinemaMap[cId] = {
          cinema: st.cinema || { id: cId, name: cName, address: 'TP. Hồ Chí Minh' },
          list: [],
        };
      }
      cinemaMap[cId].list.push(st);
    });

    // Sort list by startTime
    Object.values(cinemaMap).forEach(g => {
      g.list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    });

    return cinemaMap;
  }, [selectedDate, groupedByDate]);

  const handleScrollDates = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (dateKeys.length === 0) {
    return (
      <div className="p-16 rounded-3xl bg-[#27211f] border border-[#4a423d] text-center space-y-4 shadow-xl">
        <Clock className="w-12 h-12 text-[#ff4b72]/50 mx-auto" />
        <h3 className="font-heading text-xl uppercase tracking-wider text-white font-bold">
          Chưa có lịch chiếu sắp tới
        </h3>
        <p className="text-sm text-[#afa49b] max-w-md mx-auto">
          Bộ phim hiện đang trong giai đoạn chuẩn bị phát hành. Vui lòng quay lại sau hoặc tham khảo các bộ phim đang chiếu khác.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Horizontal Scrolling Date Picker (Figma Date w:150 h:72 r:16) ─── */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-mono uppercase tracking-wider text-[#afa49b] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#ff6584]" />
            Chọn ngày chiếu:
          </span>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => handleScrollDates('left')} 
              className="w-7 h-7 rounded-full bg-[#27211f] border border-[#4a423d] flex items-center justify-center text-[#d1c7ba] hover:text-white hover:border-[#ff4b72] transition-colors"
              title="Ngày trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleScrollDates('right')} 
              className="w-7 h-7 rounded-full bg-[#27211f] border border-[#4a423d] flex items-center justify-center text-[#d1c7ba] hover:text-white hover:border-[#ff4b72] transition-colors"
              title="Ngày kế tiếp"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-3.5 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth"
        >
          {dateKeys.map((dateKey) => {
            const item = groupedByDate[dateKey];
            const isSelected = selectedDate === dateKey;

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(dateKey)}
                className={`relative flex flex-col items-center justify-center w-[130px] sm:w-[150px] h-[72px] shrink-0 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#ff4b72] border-[#ff6584] text-white shadow-[0_6px_25px_rgba(255,75,114,0.45)] scale-[1.03]'
                    : 'bg-[#27211f] border-[#4a423d] text-[#d1c7ba] hover:bg-[#302927] hover:border-[#ff4b72]/60 hover:text-white'
                }`}
              >
                <span className={`text-sm ${isSelected ? 'font-semibold text-white' : 'font-medium text-[#d1c7ba]'}`}>
                  {item.label}
                </span>
                <span className={`text-base font-bold font-mono tracking-tight mt-0.5 ${isSelected ? 'text-white' : 'text-[#faf8f5]'}`}>
                  {item.subLabel}
                </span>
                <span 
                  className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${
                    isSelected ? 'bg-white shadow-[0_0_8px_white]' : 'bg-[#ff4b72]'
                  }`} 
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Cinema Showtimes Cards with Khung thời gian (Time Slots) ─── */}
      <div className="space-y-4">
        {Object.values(cinemasOnSelectedDate).map(({ cinema, list }) => (
          <div
            key={cinema.id}
            className="p-5 sm:p-6 rounded-2xl bg-[#27211f] border border-[#4a423d] hover:border-[#ff4b72]/40 transition-all shadow-xl space-y-4"
          >
            {/* Cinema Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#4a423d]/50 pb-4">
              <div>
                <h3 className="font-sans font-bold text-lg text-[#faf8f5] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#ff6584]" />
                  <span>{cinema.name}</span>
                </h3>
                <p className="text-xs text-[#afa49b] mt-1 ml-6 max-w-xl">
                  {cinema.address}
                </p>
              </div>
              <div className="ml-6 sm:ml-0">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase bg-[#302927] border border-[#4a423d] text-[#ff8fa3]">
                  {list[0]?.hall?.screenType || '2D Digital'} · Phụ đề
                </span>
              </div>
            </div>

            {/* ─── Khung Thời Gian (Time Slots Pills - Figma w:110 h:46 r:9999) ─── */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[#afa49b] block">
                Khung giờ chiếu:
              </span>
              <div className="flex flex-wrap gap-3">
                {list.map((st) => {
                  const d = new Date(st.startTime);
                  const isPast = d.getTime() < new Date().getTime();
                  const timeStr = d.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  });

                  return (
                    <Link
                      key={st.id}
                      href={isPast ? '#' : `/booking/seats?showtimeId=${st.id}`}
                      className={isPast ? 'pointer-events-none' : ''}
                    >
                      <div
                        className={`min-w-[110px] h-[46px] px-4 rounded-full border transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isPast
                            ? 'bg-black/30 border-[#4a423d]/30 text-[#afa49b]/40 cursor-not-allowed'
                            : 'bg-[#302927] border-[#4a423d] text-[#faf8f5] hover:border-[#ff4b72] hover:bg-[#ff4b72] hover:text-white hover:scale-105 shadow-sm'
                        }`}
                        title={`Chọn suất ${timeStr} - ${st.hall?.name || 'Phòng 01'}`}
                      >
                        <span className="text-sm font-bold font-mono tracking-tight leading-none">{timeStr}</span>
                        <span className="text-[10px] mt-0.5 leading-none text-[#afa49b] group-hover:text-white">
                          {st.hall?.name || '2D'}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
