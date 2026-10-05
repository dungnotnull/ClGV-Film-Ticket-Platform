'use client';

import { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/axios';
import { BookingProgressRail } from '@/components/booking/BookingProgressRail';
import { useBookingStore } from '@/store/useBookingStore';
import { 
  MapPin, 
  Clock, 
  Film, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  Armchair, 
  CheckCircle2, 
  Info,
  Flame,
  ArrowRight,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Showtime {
  id: string;
  movieId: string;
  cinemaId: string;
  hallId: string;
  startTime: string;
  endTime: string;
  basePrice: number;
  movie?: {
    id: string;
    title: string;
    durationMinutes: number;
    posterUrl: string;
    ageRating?: string;
  };
  cinema?: {
    id: string;
    name: string;
    address: string;
  };
  hall?: {
    id: string;
    name: string;
    screenType: string;
  };
}

interface DateItem {
  key: string;       // YYYY-MM-DD
  dayName: string;   // Hôm nay, Thứ Bảy...
  dateStr: string;   // 18.10
  fullDate: Date;
  hasShowtimes: boolean;
}

function ShowtimesContent() {
  const searchParams = useSearchParams();
  const initialMovieId = searchParams.get('movieId');
  const router = useRouter();
  const { setShowtime } = useBookingStore();

  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedMovieId, setSelectedMovieId] = useState<string>(initialMovieId || '');
  const [movieSearchQuery, setMovieSearchQuery] = useState<string>('');
  const [selectedDateKey, setSelectedDateKey] = useState<string>('');
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);

  // Scroll references
  const movieScrollRef = useRef<HTMLDivElement>(null);
  const dateScrollRef = useRef<HTMLDivElement>(null);

  const [movieScrollState, setMovieScrollState] = useState({ canLeft: false, canRight: false });
  const [dateScrollState, setDateScrollState] = useState({ canLeft: false, canRight: false });

  // Fetch showtimes
  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        setLoading(true);
        const res = await api.get('/showtimes');
        if (res.success && Array.isArray(res.data)) {
          setShowtimes(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch showtimes', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShowtimes();
  }, []);

  // Extract distinct movies from showtimes
  const distinctMovies = useMemo(() => {
    const movieMap = new Map<string, any>();
    showtimes.forEach((st) => {
      if (st.movie && !movieMap.has(st.movie.id)) {
        movieMap.set(st.movie.id, st.movie);
      }
    });
    return Array.from(movieMap.values());
  }, [showtimes]);

  // Filter movies by search query if any
  const filteredMovies = useMemo(() => {
    if (!movieSearchQuery.trim()) return distinctMovies;
    return distinctMovies.filter(m => 
      (m.title || '').toLowerCase().includes(movieSearchQuery.toLowerCase().trim())
    );
  }, [distinctMovies, movieSearchQuery]);

  // Set default movie if none selected or initialMovieId not in list
  useEffect(() => {
    if (distinctMovies.length > 0) {
      if (!selectedMovieId || !distinctMovies.some(m => m.id === selectedMovieId)) {
        setSelectedMovieId(initialMovieId && distinctMovies.some(m => m.id === initialMovieId) ? initialMovieId : distinctMovies[0].id);
      }
    }
  }, [distinctMovies, initialMovieId, selectedMovieId]);

  // Update scroll bounds for movie container
  const updateMovieScrollBounds = () => {
    if (movieScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = movieScrollRef.current;
      setMovieScrollState({
        canLeft: scrollLeft > 8,
        canRight: scrollLeft < scrollWidth - clientWidth - 8
      });
    }
  };

  // Update scroll bounds for date container
  const updateDateScrollBounds = () => {
    if (dateScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = dateScrollRef.current;
      setDateScrollState({
        canLeft: scrollLeft > 8,
        canRight: scrollLeft < scrollWidth - clientWidth - 8
      });
    }
  };

  useEffect(() => {
    updateMovieScrollBounds();
    updateDateScrollBounds();
    const handleResize = () => {
      updateMovieScrollBounds();
      updateDateScrollBounds();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [filteredMovies, showtimes]);

  // Generate 14-day horizontal date list starting from today
  const dateList: DateItem[] = useMemo(() => {
    const dates: DateItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekdayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;

      let dayName = weekdayNames[d.getDay()];
      if (i === 0) dayName = 'Hôm nay';
      else if (i === 1) dayName = 'Ngày mai';

      const dateStr = `${day}.${month}`;

      // Check if any showtime matches this date and selected movie
      const hasShowtimes = showtimes.some(st => {
        const matchesMovie = !selectedMovieId || st.movieId === selectedMovieId;
        const matchesDate = st.startTime.startsWith(key);
        return matchesMovie && matchesDate;
      });

      dates.push({
        key,
        dayName,
        dateStr,
        fullDate: d,
        hasShowtimes,
      });
    }

    return dates;
  }, [showtimes, selectedMovieId]);

  // Default selected date: pick first date with showtimes or today
  useEffect(() => {
    if (!selectedDateKey && dateList.length > 0) {
      const firstWithShowtimes = dateList.find(d => d.hasShowtimes);
      setSelectedDateKey(firstWithShowtimes ? firstWithShowtimes.key : dateList[0].key);
    }
  }, [dateList, selectedDateKey]);

  // Filter showtimes by selected movie and selected date
  const filteredShowtimes = useMemo(() => {
    return showtimes.filter((st) => {
      const matchMovie = !selectedMovieId || st.movieId === selectedMovieId;
      const matchDate = !selectedDateKey || st.startTime.startsWith(selectedDateKey);
      return matchMovie && matchDate;
    });
  }, [showtimes, selectedMovieId, selectedDateKey]);

  // Group filtered showtimes by Cinema
  const cinemaGroups = useMemo(() => {
    const map: Record<string, { cinema: any; list: Showtime[] }> = {};
    filteredShowtimes.forEach((st) => {
      const cId = st.cinema?.id || st.cinemaId || 'unknown';
      if (!map[cId]) {
        map[cId] = {
          cinema: st.cinema || { id: cId, name: 'ClGV Cinema', address: 'TP. Hồ Chí Minh' },
          list: [],
        };
      }
      map[cId].list.push(st);
    });

    // Sort slots by startTime inside each cinema
    Object.values(map).forEach(group => {
      group.list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    });

    return Object.values(map);
  }, [filteredShowtimes]);

  // Selected Movie Object
  const currentMovie = useMemo(() => {
    return distinctMovies.find(m => m.id === selectedMovieId) || distinctMovies[0] || null;
  }, [distinctMovies, selectedMovieId]);

  // Smooth scroll handler for buttons
  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right', distance = 350) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -distance : distance;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Convert vertical mouse wheel to horizontal scrolling on hover
  const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.currentTarget.scrollLeft += e.deltaY * 0.9;
    }
  };

  // Mouse Drag-to-Scroll implementation
  const handleMouseDown = (e: React.MouseEvent, containerRef: React.RefObject<HTMLDivElement | null>) => {
    if (!containerRef.current) return;
    const startX = e.pageX - containerRef.current.offsetLeft;
    const initialScroll = containerRef.current.scrollLeft;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      const x = moveEvent.pageX - containerRef.current.offsetLeft;
      const walk = (x - startX) * 1.3;
      containerRef.current.scrollLeft = initialScroll - walk;
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Handle selecting a slot
  const handleSelectSlot = (st: Showtime) => {
    setSelectedShowtime(st);
    setShowtime(st.movieId, st.cinemaId, st.id);
  };

  // Handle Proceed to Seats
  const handleProceedToSeats = () => {
    if (!selectedShowtime) return;
    router.push(`/booking/seats?showtimeId=${selectedShowtime.id}`);
  };

  // Select movie and smoothly center it into view
  const handleSelectMovie = (movieId: string, e?: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedMovieId(movieId);
    setSelectedShowtime(null);
    if (e?.currentTarget) {
      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  return (
    <div className="min-h-screen pb-28 text-[#faf8f5] pt-8 md:pt-12">
      {/* ─── Ticket Rail (Figma CLGV / 05 Ticket Rail) ─── */}
      <BookingProgressRail currentStep="showtime" />

      <div className="max-w-[1240px] mx-auto px-4 space-y-8">
        {/* ─── Header: Step Kicker, Title & Subtitle (Figma 3274:12504 - 12506) ─── */}
        <div className="space-y-2 border-b border-[#4a423d] pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff8fa3]">
            BƯỚC 2 / 5 · CHỌN SUẤT CHIẾU THEO RẠP
          </p>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white">
              Lịch chiếu & Phòng chiếu
            </h1>
            {currentMovie && (
              <p className="text-sm text-[#d1c7ba]">
                <strong className="text-white font-semibold">{currentMovie.title}</strong> · {currentMovie.durationMinutes || 120} phút · Định dạng phòng IMAX Laser & 2D
              </p>
            )}
          </div>
        </div>

        {/* ─── Movie Switcher (Ultra-smooth Horizontal Scroll + Navigation Controls) ─── */}
        <div className="space-y-3 bg-[#27211f]/60 border border-[#4a423d] p-4 sm:p-5 rounded-3xl backdrop-blur-md shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#ff4b72]/15 border border-[#ff4b72]/30 flex items-center justify-center text-[#ff4b72]">
                <Film className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#faf8f5] font-bold">
                Chọn phim điện ảnh
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#302927] text-[#ff8fa3] border border-[#ff4b72]/20">
                {distinctMovies.length} phim đang có suất
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Optional Search Input for quick filter */}
              {distinctMovies.length > 5 && (
                <div className="relative w-44 sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#afa49b]" />
                  <Input 
                    type="text" 
                    placeholder="Tìm tên phim..." 
                    value={movieSearchQuery}
                    onChange={(e) => setMovieSearchQuery(e.target.value)}
                    className="h-8 pl-8 pr-3 text-xs bg-[#1f1a18] border-[#4a423d] text-[#faf8f5] placeholder:text-[#afa49b] rounded-xl focus:border-[#ff4b72]"
                  />
                </div>
              )}

              {/* Navigation buttons for horizontal scrolling */}
              <div className="flex items-center gap-1.5 ml-auto">
                <button 
                  onClick={() => handleScroll(movieScrollRef, 'left', 340)}
                  disabled={!movieScrollState.canLeft}
                  className="w-8 h-8 rounded-full bg-[#1f1a18] border border-[#4a423d] flex items-center justify-center text-[#d1c7ba] hover:text-white hover:border-[#ff4b72] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-sm"
                  title="Cuộn sang trái"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleScroll(movieScrollRef, 'right', 340)}
                  disabled={!movieScrollState.canRight}
                  className="w-8 h-8 rounded-full bg-[#1f1a18] border border-[#4a423d] flex items-center justify-center text-[#d1c7ba] hover:text-white hover:border-[#ff4b72] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-sm"
                  title="Cuộn sang phải"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Container with Edge Gradient Fades */}
          <div className="relative">
            {/* Left Edge Shadow */}
            {movieScrollState.canLeft && (
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[#27211f] to-transparent z-10 rounded-l-2xl transition-opacity duration-300" />
            )}

            {/* Right Edge Shadow */}
            {movieScrollState.canRight && (
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#27211f] to-transparent z-10 rounded-r-2xl transition-opacity duration-300" />
            )}

            <div 
              ref={movieScrollRef}
              onScroll={updateMovieScrollBounds}
              onWheel={handleWheelScroll}
              onMouseDown={(e) => handleMouseDown(e, movieScrollRef)}
              className="flex items-center gap-3.5 overflow-x-auto py-2 px-1 scroll-smooth select-none cursor-grab active:cursor-grabbing scrollbar-thin scrollbar-thumb-[#4a423d] hover:scrollbar-thumb-[#ff4b72]/60 scrollbar-track-transparent"
              style={{ scrollSnapType: 'x proximity' }}
            >
              {filteredMovies.map((movie) => {
                const isSelected = movie.id === selectedMovieId;
                return (
                  <button
                    key={movie.id}
                    onClick={(e) => handleSelectMovie(movie.id, e)}
                    style={{ scrollSnapAlign: 'start' }}
                    className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all cursor-pointer shrink-0 min-w-[220px] sm:min-w-[260px] max-w-[300px] ${
                      isSelected
                        ? 'bg-[#302927] border-[#ff4b72] shadow-[0_4px_20px_rgba(255,75,114,0.35)] scale-[1.02]'
                        : 'bg-[#1f1a18] border-[#4a423d] hover:border-[#ff4b72]/60 hover:bg-[#27211f] text-[#d1c7ba]'
                    }`}
                  >
                    {/* Poster */}
                    <div className="w-10 h-14 rounded-xl overflow-hidden bg-[#14100f] border border-[#4a423d] shrink-0 shadow-md">
                      {movie.posterUrl ? (
                        <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-4 h-4 text-[#ff8fa3]" />
                        </div>
                      )}
                    </div>

                    {/* Movie Metadata */}
                    <div className="text-left flex-1 min-w-0">
                      <div className={`text-sm font-bold truncate leading-snug ${isSelected ? 'text-white' : 'text-[#faf8f5] group-hover:text-white'}`}>
                        {movie.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-[#27211f] text-[#ff8fa3] border border-[#ff4b72]/30">
                          {movie.ageRating || 'T16'}
                        </span>
                        <span className="text-[11px] font-mono text-[#afa49b]">
                          {movie.durationMinutes || 120} ph
                        </span>
                      </div>
                    </div>

                    {/* Active Checkmark Pill */}
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-[#ff4b72] shadow-[0_0_8px_#ff4b72] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Horizontal Scrolling Date Picker (Figma Date w:150 h:72 r:16) ─── */}
        <div className="space-y-3 bg-[#27211f]/60 border border-[#4a423d] p-4 sm:p-5 rounded-3xl backdrop-blur-md shadow-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#ff4b72]/15 border border-[#ff4b72]/30 flex items-center justify-center text-[#ff4b72]">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#faf8f5] font-bold">
                Chọn ngày chiếu
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => handleScroll(dateScrollRef, 'left', 300)} 
                disabled={!dateScrollState.canLeft}
                className="w-8 h-8 rounded-full bg-[#1f1a18] border border-[#4a423d] flex items-center justify-center text-[#d1c7ba] hover:text-white hover:border-[#ff4b72] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-sm"
                title="Ngày trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleScroll(dateScrollRef, 'right', 300)} 
                disabled={!dateScrollState.canRight}
                className="w-8 h-8 rounded-full bg-[#1f1a18] border border-[#4a423d] flex items-center justify-center text-[#d1c7ba] hover:text-white hover:border-[#ff4b72] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-sm"
                title="Ngày kế tiếp"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative">
            {/* Left Edge Shadow */}
            {dateScrollState.canLeft && (
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[#27211f] to-transparent z-10 rounded-l-2xl transition-opacity duration-300" />
            )}

            {/* Right Edge Shadow */}
            {dateScrollState.canRight && (
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#27211f] to-transparent z-10 rounded-r-2xl transition-opacity duration-300" />
            )}

            <div 
              ref={dateScrollRef}
              onScroll={updateDateScrollBounds}
              onWheel={handleWheelScroll}
              onMouseDown={(e) => handleMouseDown(e, dateScrollRef)}
              className="flex items-center gap-3.5 overflow-x-auto py-2 px-1 scroll-smooth select-none cursor-grab active:cursor-grabbing scrollbar-thin scrollbar-thumb-[#4a423d] hover:scrollbar-thumb-[#ff4b72]/60 scrollbar-track-transparent"
              style={{ scrollSnapType: 'x proximity' }}
            >
              {dateList.map((dateItem) => {
                const isSelected = selectedDateKey === dateItem.key;
                return (
                  <button
                    key={dateItem.key}
                    onClick={() => {
                      setSelectedDateKey(dateItem.key);
                      setSelectedShowtime(null);
                    }}
                    style={{ scrollSnapAlign: 'start' }}
                    className={`relative flex flex-col items-center justify-center w-[130px] sm:w-[150px] h-[72px] shrink-0 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#ff4b72] border-[#ff6584] text-white shadow-[0_6px_25px_rgba(255,75,114,0.45)] scale-[1.03]'
                        : 'bg-[#1f1a18] border-[#4a423d] text-[#d1c7ba] hover:bg-[#27211f] hover:border-[#ff4b72]/60 hover:text-white'
                    }`}
                  >
                    <span className={`text-sm ${isSelected ? 'font-semibold text-white' : 'font-medium text-[#d1c7ba]'}`}>
                      {dateItem.dayName}
                    </span>
                    <span className={`text-base font-bold font-mono tracking-tight mt-0.5 ${isSelected ? 'text-white' : 'text-[#faf8f5]'}`}>
                      {dateItem.dateStr}
                    </span>

                    {/* Indicator dot if showtimes are available on this date */}
                    {dateItem.hasShowtimes && (
                      <span 
                        className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${
                          isSelected ? 'bg-white shadow-[0_0_8px_white]' : 'bg-[#ff4b72]'
                        }`} 
                        title="Có suất chiếu"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Main Content Grid: Showtime Rows + Order Preview ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cinemas & Time Slots (Figma 3274:12517 - 12560) */}
          <div className="lg:col-span-8 space-y-5">
            {loading ? (
              <div className="p-16 rounded-3xl bg-[#27211f] border border-[#4a423d] text-center text-[#afa49b] space-y-3">
                <div className="w-8 h-8 border-2 border-[#ff4b72] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm">Đang tải lịch chiếu từ rạp...</p>
              </div>
            ) : cinemaGroups.length === 0 ? (
              <div className="p-16 rounded-3xl bg-[#27211f] border border-[#4a423d] text-center text-[#afa49b] space-y-4 shadow-xl">
                <Clock className="w-12 h-12 text-[#ff4b72]/50 mx-auto" />
                <h3 className="font-heading text-xl uppercase tracking-wider text-white font-bold">
                  Không có suất chiếu cho ngày này
                </h3>
                <p className="text-sm max-w-md mx-auto text-[#d1c7ba]">
                  Vui lòng chọn một ngày khác có chấm hồng trên thanh lịch hoặc đổi sang phim khác để đặt vé.
                </p>
                {dateList.some(d => d.hasShowtimes) && (
                  <Button 
                    variant="outline"
                    className="border-[#ff4b72] text-[#ff8fa3] hover:bg-[#ff4b72] hover:text-white rounded-xl text-xs"
                    onClick={() => {
                      const firstAvail = dateList.find(d => d.hasShowtimes);
                      if (firstAvail) setSelectedDateKey(firstAvail.key);
                    }}
                  >
                    Xem ngày có suất chiếu gần nhất &rarr;
                  </Button>
                )}
              </div>
            ) : (
              cinemaGroups.map(({ cinema, list }) => (
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
                        const isSelected = selectedShowtime?.id === st.id;
                        const d = new Date(st.startTime);
                        const isPast = d.getTime() < new Date().getTime();
                        const timeStr = d.toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        });

                        return (
                          <button
                            key={st.id}
                            disabled={isPast}
                            onClick={() => handleSelectSlot(st)}
                            className={`min-w-[110px] h-[46px] px-4 rounded-full border transition-all cursor-pointer flex flex-col items-center justify-center ${
                              isPast
                                ? 'bg-black/30 border-[#4a423d]/30 text-[#afa49b]/40 cursor-not-allowed'
                                : isSelected
                                ? 'bg-[#ff4b72] border-[#ff6584] text-white font-bold shadow-[0_4px_16px_rgba(255,75,114,0.45)] scale-105'
                                : 'bg-[#302927] border-[#4a423d] text-[#faf8f5] hover:border-[#ff4b72]/60 hover:bg-[#3d3432]'
                            }`}
                            title={`Suất ${timeStr} - ${st.hall?.name || 'Phòng 01'}`}
                          >
                            <span className="text-sm font-bold font-mono tracking-tight leading-none">{timeStr}</span>
                            <span className={`text-[10px] mt-0.5 leading-none ${isSelected ? 'text-white/90' : 'text-[#afa49b]'}`}>
                              {st.hall?.name || '2D'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Order Preview Card (Figma 3274:12561 - w:328 h:548 r:24) */}
          <div className="lg:col-span-4 sticky top-28 space-y-4">
            <div className="p-6 rounded-3xl bg-[#27211f] border border-[#4a423d] shadow-2xl space-y-5">
              <div className="border-b border-[#4a423d]/60 pb-3">
                <span className="text-xs font-mono uppercase tracking-[0.2em] font-semibold text-[#ff8fa3]">
                  ĐANG CHỌN
                </span>
                <h3 className="text-xl font-bold text-[#faf8f5] mt-1 line-clamp-2">
                  {currentMovie?.title || 'Chưa chọn phim'}
                </h3>
              </div>

              {/* Movie info snapshot */}
              {currentMovie && (
                <div className="flex gap-3 items-center bg-[#1f1a18] p-3 rounded-2xl border border-[#4a423d]">
                  {currentMovie.posterUrl && (
                    <img 
                      src={currentMovie.posterUrl} 
                      alt={currentMovie.title} 
                      className="w-12 h-16 object-cover rounded-xl border border-[#4a423d]"
                    />
                  )}
                  <div className="text-xs space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#ff4b72] text-white">
                      {currentMovie.ageRating || 'T16'}
                    </span>
                    <div className="text-[#d1c7ba] font-mono">{currentMovie.durationMinutes || 120} phút</div>
                    <div className="text-[#afa49b]">2D Digital · IMAX</div>
                  </div>
                </div>
              )}

              {/* Selected Slot Information */}
              {selectedShowtime ? (
                <div className="space-y-3 bg-[#1f1a18] p-4 rounded-2xl border border-[#4a423d] text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#ff6584] mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-white">{selectedShowtime.cinema?.name}</div>
                      <div className="text-xs text-[#afa49b]">{selectedShowtime.hall?.name} ({selectedShowtime.hall?.screenType || '2D'})</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#4a423d]/50">
                    <Calendar className="w-4 h-4 text-[#ff6584] shrink-0" />
                    <div className="text-xs text-[#d1c7ba]">
                      {new Date(selectedShowtime.startTime).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#ff6584] shrink-0" />
                    <div className="text-xs text-[#ff8fa3] font-bold font-mono">
                      {new Date(selectedShowtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[#4a423d]/50 text-xs">
                    <span className="text-[#afa49b]">Giá vé cơ bản:</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedShowtime.basePrice)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#1f1a18] border border-dashed border-[#4a423d] text-center text-xs text-[#afa49b] space-y-1">
                  <Armchair className="w-6 h-6 text-[#afa49b]/40 mx-auto" />
                  <p>Vui lòng click vào một khung giờ chiếu để chọn suất</p>
                </div>
              )}

              {/* CTA Button (Figma 3274:12565 - Gradient from-[#ff6584] to-[#ffa07a] h:54 r:9999) */}
              <button
                disabled={!selectedShowtime}
                onClick={handleProceedToSeats}
                className={`w-full h-[54px] rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedShowtime
                    ? 'bg-gradient-to-r from-[#ff6584] to-[#ffa07a] text-white shadow-[0_6px_25px_rgba(255,101,132,0.4)] hover:opacity-95 hover:scale-[1.02]'
                    : 'bg-[#302927] border border-[#4a423d] text-[#afa49b] cursor-not-allowed opacity-60'
                }`}
              >
                <span>{selectedShowtime ? 'Chọn ghế' : 'Vui lòng chọn suất'}</span>
                {selectedShowtime && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingShowtimesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#1f1a18] text-[#faf8f5]">
        <div className="w-8 h-8 border-2 border-[#ff4b72] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ShowtimesContent />
    </Suspense>
  );
}
