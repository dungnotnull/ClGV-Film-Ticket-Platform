'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/axios';
import { toast } from 'sonner';
import { Monitor, ChevronRight, Armchair, Clock, Info, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/store/useBookingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { io } from 'socket.io-client';
import { BookingProgressRail } from '@/components/booking/BookingProgressRail';

interface Seat {
  id: string; // row + col e.g. A1
  row: string;
  col: number;
  type: 'STANDARD' | 'VIP' | 'COUPLE' | 'BED';
  status: 'AVAILABLE' | 'HOLDING' | 'RESERVED' | 'SOLD' | 'BLOCKED';
  priceModifier: number;
  price?: number;
  heldByUserId?: string;
}

interface ShowtimeMeta {
  movieTitle: string;
  cinemaName: string;
  hallName: string;
  screenType: string;
  startTime: string;
}

function SeatsContent() {
  const searchParams = useSearchParams();
  const showtimeId = searchParams.get('showtimeId');
  const router = useRouter();

  const [matrix, setMatrix] = useState<any>(null);
  const [seats, setSeats] = useState<Record<string, Seat>>({});
  const [basePrice, setBasePrice] = useState(100000);
  const [showtimeMeta, setShowtimeMeta] = useState<ShowtimeMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    selectedSeats, 
    toggleSeat, 
    setShowtime, 
    setReservation 
  } = useBookingStore();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!showtimeId) {
      router.push('/booking/showtimes');
      return;
    }

    // Fetch initial seat matrix & showtime info
    const fetchMatrix = async () => {
      try {
        const res: any = await api.get(`/showtimes/${showtimeId}/seats`);
        if (res.success) {
          const data = res.data;
          setMatrix(data.hall?.roomMatrix);
          setBasePrice(data.basePrice || 100000);

          setShowtimeMeta({
            movieTitle: data.movie?.title || 'Phim Chiếu Rạp',
            cinemaName: data.cinema?.name || 'Rạp ClGV',
            hallName: data.hall?.name || 'Phòng chiếu',
            screenType: data.hall?.screenType || 'STANDARD',
            startTime: data.startTime || '',
          });

          // Flatten seats for easy status lookup
          const seatMap: Record<string, Seat> = {};
          if (data.hall?.roomMatrix?.grid) {
            data.hall.roomMatrix.grid.forEach((row: any) => {
              if (Array.isArray(row)) {
                row.forEach((seat: any) => {
                  if (seat && seat.id) {
                    seatMap[seat.id] = seat;
                  }
                });
              }
            });
          }

          // Merge real-time status from data.seats (ShowtimeSeat records)
          if (data.seats && Array.isArray(data.seats)) {
            data.seats.forEach((s: any) => {
              if (seatMap[s.seatId]) {
                seatMap[s.seatId] = {
                  ...seatMap[s.seatId],
                  status: s.status,
                  priceModifier: s.priceModifier,
                  price: s.price,
                  heldByUserId: s.heldByUserId,
                };
              } else {
                seatMap[s.seatId] = {
                  id: s.seatId,
                  row: s.row,
                  col: s.col,
                  type: s.type,
                  status: s.status,
                  priceModifier: s.priceModifier,
                  price: s.price,
                  heldByUserId: s.heldByUserId,
                };
              }
            });
          }
          setSeats(seatMap);

          // Initialize store
          setShowtime(data.movieId, data.cinemaId, showtimeId);
        }
      } catch (error) {
        console.error(error);
        toast.error('Không thể tải sơ đồ ghế. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatrix();

    // Real-time updates via Socket.io
    const socket = io('http://localhost:4000');
    socket.emit('join:showtime', { showtimeId });

    socket.on('seat:state_changed', (data: any) => {
      setSeats((prevSeats) => {
        const newSeats = { ...prevSeats };

        if (newSeats[data.seatId] && newSeats[data.seatId].status !== data.status) {
          newSeats[data.seatId] = { 
            ...newSeats[data.seatId], 
            status: data.status,
            heldByUserId: data.heldByUserId,
          };

          if (data.status !== 'AVAILABLE') {
            const currentUser = useAuthStore.getState().user;
            if (data.heldByUserId !== currentUser?.id) {
              useBookingStore.setState((state) => {
                if (state.selectedSeats.find((selected) => selected.id === data.seatId)) {
                  toast.warning(`Ghế ${data.seatId} vừa có người khác giữ chỗ!`);
                  return { selectedSeats: state.selectedSeats.filter((selected) => selected.id !== data.seatId) };
                }
                return state;
              });
            }
          }
        }

        return newSeats;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [showtimeId, router, setShowtime]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE' && !selectedSeats.find((s) => s.id === seat.id) && seat.heldByUserId !== user?.id) {
      return; // Cannot select unavailable seat
    }

    const price = seat.price ? seat.price : Math.round(basePrice * (seat.priceModifier || 1.0));
    toggleSeat({
      id: seat.id,
      name: seat.id,
      price: price,
    });
  };

  const handleHoldSeats = async () => {
    if (selectedSeats.length === 0) return;

    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để tiếp tục đặt vé');
      router.push(`/login?redirect=/booking/seats?showtimeId=${showtimeId}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res: any = await api.post(`/bookings/hold-seat`, {
        showtimeId,
        seatIds: selectedSeats.map((s) => s.id),
      });

      if (res.success) {
        setReservation(res.data.reservationId, res.data.expiresAt);
        router.push('/booking/fb');
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Một số ghế bạn chọn đã bị đặt hoặc đang được người khác giữ. Vui lòng chọn ghế khác.');
      } else {
        toast.error('Đã có lỗi xảy ra khi giữ ghế. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1f1a18] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-3 border-[#ff4b72] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-[#d1c7ba]">Đang tải sơ đồ phòng chiếu & trạng thái ghế realtime...</p>
      </div>
    );
  }

  const totalPrice = selectedSeats.reduce((acc, seat) => acc + seat.price, 0);

  // Group seats by type for breakdown summary
  const standardCount = selectedSeats.filter((s) => {
    const seatObj = seats[s.id];
    return !seatObj || seatObj.type === 'STANDARD';
  }).length;

  const vipCount = selectedSeats.filter((s) => {
    const seatObj = seats[s.id];
    return seatObj?.type === 'VIP';
  }).length;

  const coupleCount = selectedSeats.filter((s) => {
    const seatObj = seats[s.id];
    return seatObj?.type === 'COUPLE';
  }).length;

  const formattedDate = showtimeMeta?.startTime
    ? new Date(showtimeMeta.startTime).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      })
    : '';

  return (
    <div className="min-h-screen bg-[#1f1a18] text-white pt-6 pb-28">
      {/* Ticket Progress Rail */}
      <BookingProgressRail currentStep="seat" />

      {/* Main Container */}
      <div className="max-w-[1320px] mx-auto px-4">
        {/* Header Title Section */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-serif tracking-wide text-white">
            Sơ đồ ghế phòng chiếu
          </h1>
          <p className="text-xs md:text-sm text-[#d1c7ba] mt-1.5 flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="font-semibold text-white">{showtimeMeta?.movieTitle}</span>
            <span>·</span>
            <span>{showtimeMeta?.cinemaName}</span>
            <span>·</span>
            <span className="text-[#ff8fa3] font-medium">{showtimeMeta?.hallName} ({showtimeMeta?.screenType})</span>
            {formattedDate && (
              <>
                <span>·</span>
                <span className="text-emerald-400 font-medium">🕒 {formattedDate}</span>
              </>
            )}
          </p>
        </div>

        {/* 2-Column Booking Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Screen & Seat Matrix */}
          <div className="lg:col-span-8 bg-[#27211f] border border-[#4a423d] rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
            
            {/* Ambient Screen Projector Beam */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-[140px] bg-[#ff4b72]/15 blur-3xl pointer-events-none rounded-full" />

            {/* Cinema Screen Indicator */}
            <div className="flex flex-col items-center mb-10 pt-2 relative z-10">
              <div className="w-full max-w-[620px] h-10 bg-gradient-to-b from-[#ff8fa3]/30 via-[#ff4b72]/10 to-transparent rounded-t-[100px] border-t-3 border-[#ff4b72] flex items-center justify-center shadow-[0_-12px_25px_rgba(255,75,114,0.25)]">
                <span className="text-[#d1c7ba] font-bold uppercase tracking-[0.25em] text-[11px] flex items-center gap-2">
                  <Monitor className="w-3.5 h-3.5 text-[#ff8fa3]" /> MÀN HÌNH CHIẾU PHIM (SCREEN)
                </span>
              </div>
              <p className="text-[11px] text-[#afa49b] mt-1.5 font-medium tracking-wide">Mắt nhìn hướng về màn hình</p>
            </div>

            {/* Seat Matrix Grid */}
            <div className="overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-[#4a423d] scrollbar-track-transparent">
              <div className="min-w-max mx-auto flex flex-col items-center gap-2.5">
                {matrix?.grid?.map((rowArr: any[], rowIndex: number) => {
                  const rowLetter = String.fromCharCode(65 + rowIndex);
                  return (
                    <div key={`row-${rowIndex}`} className="flex items-center gap-3">
                      {/* Left Row Label */}
                      <div className="w-6 text-center text-xs font-bold text-[#afa49b]">
                        {rowLetter}
                      </div>

                      {/* Row Seats */}
                      <div className="flex items-center gap-2">
                        {rowArr.map((seat: any, colIndex: number) => {
                          if (!seat || seat.type === 'EMPTY' || seat.type === 'EMPTY_SPACE') {
                            return <div key={`empty-${rowIndex}-${colIndex}`} className="w-8 h-8 sm:w-10 sm:h-9" />;
                          }

                          const currentSeat = seats[seat.id] || seat;
                          const isSelected = !!selectedSeats.find((s) => s.id === currentSeat.id);
                          const isSold = currentSeat.status === 'SOLD' || currentSeat.status === 'RESERVED';
                          const isHolding = currentSeat.status === 'HOLDING' && currentSeat.heldByUserId !== user?.id;
                          const isBlocked = currentSeat.status === 'BLOCKED';

                          let bgClass = "bg-[#302927] border-[#4a423d] text-[#d1c7ba] hover:border-[#ff4b72] hover:text-white";
                          if (currentSeat.type === 'VIP') {
                            bgClass = "bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20";
                          }
                          if (currentSeat.type === 'COUPLE') {
                            bgClass = "bg-pink-500/10 border-pink-500/40 text-pink-300 hover:bg-pink-500/20";
                          }

                          if (isHolding) {
                            bgClass = "bg-[#25201e] border-[#38312e] text-[#6d625b] cursor-not-allowed opacity-60";
                          }
                          if (isSold) {
                            bgClass = "bg-[#1f1a18] border-[#2c2624] text-[#4a423d] cursor-not-allowed opacity-40";
                          }
                          if (isBlocked) {
                            bgClass = "bg-black/60 border-black/40 text-transparent cursor-not-allowed opacity-20";
                          }

                          if (isSelected) {
                            bgClass = "bg-gradient-to-r from-[#ff4b72] to-[#ff6584] border-[#ff8fa3] text-white shadow-[0_0_16px_rgba(255,75,114,0.65)] scale-110 z-10 font-bold";
                          }

                          return (
                            <button
                              key={currentSeat.id}
                              disabled={isSold || isHolding || isBlocked}
                              onClick={() => handleSeatClick(currentSeat)}
                              title={`Ghế ${currentSeat.id} (${currentSeat.type}) - ${((currentSeat.price || basePrice * (currentSeat.priceModifier || 1))).toLocaleString('vi-VN')} ₫`}
                              className={`
                                relative h-8 sm:h-9 rounded-t-lg rounded-b-sm border flex items-center justify-center text-[11px] font-semibold transition-all duration-150
                                ${currentSeat.type === 'COUPLE' ? 'w-18 sm:w-22' : 'w-8 sm:w-10'}
                                ${bgClass}
                              `}
                            >
                              {isSelected ? (
                                <Armchair className="w-3.5 h-3.5" />
                              ) : (
                                currentSeat.col || currentSeat.id
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Right Row Label */}
                      <div className="w-6 text-center text-xs font-bold text-[#afa49b]">
                        {rowLetter}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Seat Legends */}
            <div className="mt-6 pt-6 border-t border-[#4a423d]/60 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#d1c7ba]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-t-md rounded-b-xs bg-[#302927] border border-[#4a423d]" />
                <span>Tiêu chuẩn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-t-md rounded-b-xs bg-amber-500/20 border border-amber-500/50" />
                <span className="text-amber-300 font-medium">VIP (+15%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-5 rounded-t-md rounded-b-xs bg-pink-500/20 border border-pink-500/50" />
                <span className="text-pink-300 font-medium">Ghế đôi Couple</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-t-md rounded-b-xs bg-[#ff4b72] border border-[#ff8fa3] shadow-[0_0_8px_rgba(255,75,114,0.8)]" />
                <span className="text-white font-bold">Đang chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-t-md rounded-b-xs bg-[#25201e] border border-[#38312e] opacity-60" />
                <span className="text-[#afa49b]">Đang giữ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-t-md rounded-b-xs bg-[#1f1a18] border border-[#2c2624] opacity-40" />
                <span className="text-[#afa49b]">Đã bán</span>
              </div>
            </div>
          </div>

          {/* Right Column: Seat Summary Card (Figma Seat Summary) */}
          <div className="lg:col-span-4">
            <div className="bg-[#27211f] border border-[#4a423d] rounded-3xl p-6 shadow-2xl space-y-6 sticky top-24">
              
              {/* Timer & Hall Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#4a423d]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#ff8fa3] uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>GIỮ CHỖ 10 PHÚT REALTIME</span>
                </div>
                <span className="text-[11px] font-semibold bg-[#3b3230] text-[#d1c7ba] px-2.5 py-1 rounded-full border border-[#4a423d]">
                  {showtimeMeta?.hallName}
                </span>
              </div>

              {/* Selected Seats Display */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#afa49b]">Ghế đã chọn</p>
                <div className="mt-1.5 min-h-[44px] flex items-center">
                  {selectedSeats.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map((seat) => (
                        <span
                          key={seat.id}
                          className="px-3 py-1 bg-[#ff4b72]/20 border border-[#ff4b72]/50 text-white rounded-lg text-sm font-bold shadow-sm"
                        >
                          {seat.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-[#afa49b]/70 italic">Vui lòng nhấp chọn ghế trên sơ đồ</span>
                  )}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2 text-xs text-[#d1c7ba] bg-[#1f1a18]/60 p-4 rounded-2xl border border-[#4a423d]/50">
                {standardCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span>{standardCount} × Ghế Standard</span>
                    <span className="font-semibold text-white">
                      {(standardCount * basePrice).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                )}
                {vipCount > 0 && (
                  <div className="flex justify-between items-center text-amber-300">
                    <span>{vipCount} × Ghế VIP</span>
                    <span className="font-semibold">
                      {(vipCount * Math.round(basePrice * 1.15)).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                )}
                {coupleCount > 0 && (
                  <div className="flex justify-between items-center text-pink-300">
                    <span>{coupleCount} × Ghế Đôi Couple</span>
                    <span className="font-semibold">
                      {(coupleCount * Math.round(basePrice * 1.3)).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                )}
                {selectedSeats.length === 0 && (
                  <div className="text-center text-[#afa49b] py-2">
                    Chưa có ghế nào được chọn
                  </div>
                )}
              </div>

              {/* Total Calculation */}
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#afa49b]">TỔNG TẠM TÍNH</p>
                <p className="text-3xl font-extrabold text-[#ff4b72] mt-1 tracking-tight">
                  {totalPrice.toLocaleString('vi-VN')} ₫
                </p>
              </div>

              {/* Action CTA */}
              <Button
                size="lg"
                disabled={selectedSeats.length === 0 || isSubmitting}
                onClick={handleHoldSeats}
                className="w-full h-13 rounded-full bg-gradient-to-r from-[#ff4b72] to-[#ff6584] hover:opacity-95 text-white font-bold text-base shadow-[0_8px_20px_rgba(255,75,114,0.35)] transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang giữ ghế Redlock...</span>
                  </div>
                ) : (
                  <>
                    <span>Tiếp Tục (Bắp Nước)</span>
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </Button>

              <div className="flex items-center gap-2 text-[11px] text-[#afa49b] justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Khóa giữ ghế 10 phút đảm bảo không bị tranh chỗ</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#27211f]/95 backdrop-blur-xl border-t border-[#4a423d] p-4 z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-[#afa49b]">Ghế ({selectedSeats.length}):</p>
            <p className="text-sm font-bold text-white truncate max-w-[140px]">
              {selectedSeats.length > 0 ? selectedSeats.map((s) => s.name).join(', ') : 'Chưa chọn'}
            </p>
            <p className="text-base font-extrabold text-[#ff4b72]">
              {totalPrice.toLocaleString('vi-VN')} ₫
            </p>
          </div>
          <Button
            size="lg"
            disabled={selectedSeats.length === 0 || isSubmitting}
            onClick={handleHoldSeats}
            className="rounded-full px-6 bg-gradient-to-r from-[#ff4b72] to-[#ff6584] text-white font-bold shadow-lg"
          >
            Tiếp Tục <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SeatsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1f1a18] flex items-center justify-center text-white">Đang tải...</div>}>
      <SeatsContent />
    </Suspense>
  );
}
