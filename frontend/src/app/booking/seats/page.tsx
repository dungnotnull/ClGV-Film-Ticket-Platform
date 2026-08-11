'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/axios';
import { toast } from 'sonner';
import { Clock, Monitor, ChevronRight, Armchair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/store/useBookingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { io } from 'socket.io-client';

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

function SeatsContent() {
  const searchParams = useSearchParams();
  const showtimeId = searchParams.get('showtimeId');
  const router = useRouter();

  const [matrix, setMatrix] = useState<any>(null);
  const [seats, setSeats] = useState<Record<string, Seat>>({});
  const [basePrice, setBasePrice] = useState(100000);
  const [loading, setLoading] = useState(true);
  
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

    // Fetch initial seat matrix
    const fetchMatrix = async () => {
      try {
        const res: any = await api.get(`/showtimes/${showtimeId}/seats`);
        if (res.success) {
          const data = res.data;
          setMatrix(data.hall.roomMatrix);
          setBasePrice(data.basePrice || 100000);
          
          // Flatten seats for easy status lookup
          const seatMap: Record<string, Seat> = {};
          if (data.hall && data.hall.roomMatrix && data.hall.roomMatrix.grid) {
            data.hall.roomMatrix.grid.forEach((row: any) => {
              // Note: row is an array of seat objects, not { rowLabel, seats }
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
                  heldByUserId: s.heldByUserId
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
                  heldByUserId: s.heldByUserId
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
      setSeats(prevSeats => {
        const newSeats = { ...prevSeats };
        
        if (newSeats[data.seatId] && newSeats[data.seatId].status !== data.status) {
          newSeats[data.seatId] = { 
            ...newSeats[data.seatId], 
            status: data.status,
            heldByUserId: data.heldByUserId
          };
          
          if (data.status !== 'AVAILABLE') {
            const currentUser = useAuthStore.getState().user;
            if (data.heldByUserId !== currentUser?.id) {
              useBookingStore.setState((state) => {
                if (state.selectedSeats.find(selected => selected.id === data.seatId)) {
                  toast.warning(`Ghế ${data.seatId} vừa có người đặt hoặc giữ!`);
                  return { selectedSeats: state.selectedSeats.filter(selected => selected.id !== data.seatId) };
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
    if (seat.status !== 'AVAILABLE' && !selectedSeats.find(s => s.id === seat.id) && seat.heldByUserId !== user?.id) {
      return; // Cannot select unavailable seat
    }

    const price = seat.price ? seat.price : Math.round(basePrice * (seat.priceModifier || 1.0));
    toggleSeat({
      id: seat.id,
      name: seat.id,
      price: price
    });
  };

  const handleHoldSeats = async () => {
    if (selectedSeats.length === 0) return;
    
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để tiếp tục đặt vé');
      router.push(`/login?redirect=/booking/seats?showtimeId=${showtimeId}`);
      return;
    }
    
    try {
      const res: any = await api.post(`/bookings/hold-seat`, {
        showtimeId,
        seatIds: selectedSeats.map(s => s.id)
      });
      
      if (res.success) {
        setReservation(res.data.reservationId, res.data.expiresAt);
        router.push('/booking/fb');
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Một số ghế bạn chọn đã bị đặt. Vui lòng chọn ghế khác.');
        // Refresh matrix
      } else {
        toast.error('Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải sơ đồ ghế...</div>;
  }

  const totalPrice = selectedSeats.reduce((acc, seat) => acc + seat.price, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Chọn Ghế</h1>
        </div>

        {/* Screen Indicator */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-full max-w-2xl h-12 bg-gradient-to-b from-primary/20 to-transparent rounded-t-full border-t-4 border-primary flex items-center justify-center shadow-[0_-10px_30px_rgba(229,9,20,0.2)]">
            <span className="text-muted-foreground font-semibold uppercase tracking-widest text-sm flex items-center gap-2">
              <Monitor className="w-4 h-4" /> Màn Hình
            </span>
          </div>
        </div>

        {/* Seat Matrix */}
        <div className="overflow-x-auto pb-8">
          <div className="min-w-max mx-auto flex flex-col items-center gap-2">
            {matrix?.grid?.map((rowArr: any[], rowIndex: number) => (
              <div key={`row-${rowIndex}`} className="flex items-center gap-4">
                <div className="w-6 text-center font-bold text-muted-foreground">{String.fromCharCode(65 + rowIndex)}</div>
                <div className="flex gap-2">
                  {rowArr.map((seat: any, colIndex: number) => {
                    if (!seat || seat.type === 'EMPTY') {
                      // Aisle space
                      return <div key={`empty-${rowIndex}-${colIndex}`} className="w-8 h-8 md:w-10 md:h-10" />;
                    }

                    const currentSeat = seats[seat.id] || seat;
                    const isSelected = !!selectedSeats.find(s => s.id === currentSeat.id);
                    
                    let bgClass = "bg-secondary text-secondary-foreground hover:bg-primary/50"; // AVAILABLE STANDARD
                    if (currentSeat.type === 'VIP') bgClass = "bg-amber-500/20 border-amber-500/50 text-amber-500 hover:bg-amber-500/40";
                    if (currentSeat.type === 'COUPLE') bgClass = "bg-pink-500/20 border-pink-500/50 text-pink-500 hover:bg-pink-500/40 w-18";
                    
                    if (currentSeat.status === 'SOLD') bgClass = "bg-destructive/50 text-muted-foreground cursor-not-allowed border-none opacity-50";
                    if (currentSeat.status === 'HOLDING' && !isSelected) bgClass = "bg-muted text-muted-foreground cursor-not-allowed border-none opacity-50";
                    if (currentSeat.status === 'BLOCKED') bgClass = "bg-black text-transparent cursor-not-allowed border-none opacity-20";
                    
                    if (isSelected) bgClass = "bg-primary text-white shadow-lg shadow-primary/50 border-primary scale-110 z-10 transition-transform";

                    return (
                      <button
                        key={currentSeat.id}
                        disabled={currentSeat.status !== 'AVAILABLE' && !isSelected && currentSeat.heldByUserId !== user?.id}
                        onClick={() => handleSeatClick(currentSeat)}
                        className={`
                          relative h-8 md:h-10 rounded-t-lg rounded-b-sm border flex items-center justify-center text-xs font-semibold transition-all
                          ${currentSeat.type === 'COUPLE' ? 'w-[4.5rem] md:w-[5.5rem]' : 'w-8 md:w-10'}
                          ${bgClass}
                        `}
                      >
                        {isSelected ? <Armchair className="w-4 h-4" /> : currentSeat.id}
                      </button>
                    );
                  })}
                </div>
                <div className="w-6 text-center font-bold text-muted-foreground">{String.fromCharCode(65 + rowIndex)}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Legends */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 p-4 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-2 text-sm"><div className="w-6 h-6 bg-secondary rounded-t-lg"></div> Standard</div>
          <div className="flex items-center gap-2 text-sm"><div className="w-6 h-6 bg-amber-500/20 border border-amber-500/50 rounded-t-lg"></div> VIP</div>
          <div className="flex items-center gap-2 text-sm"><div className="w-10 h-6 bg-pink-500/20 border border-pink-500/50 rounded-t-lg"></div> Couple</div>
          <div className="flex items-center gap-2 text-sm"><div className="w-6 h-6 bg-primary rounded-t-lg"></div> Đang chọn</div>
          <div className="flex items-center gap-2 text-sm"><div className="w-6 h-6 bg-destructive/50 rounded-t-lg opacity-50"></div> Đã bán</div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Ghế đã chọn:</p>
            <p className="font-bold text-lg min-h-[1.75rem]">
              {selectedSeats.length > 0 
                ? selectedSeats.map(s => s.name).join(', ') 
                : 'Chưa chọn ghế nào'}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-sm text-muted-foreground mb-1">Tạm tính:</p>
              <p className="font-bold text-2xl text-primary">{totalPrice.toLocaleString('vi-VN')} ₫</p>
            </div>
            <Button 
              size="lg" 
              onClick={handleHoldSeats}
              disabled={selectedSeats.length === 0}
              className="text-lg font-bold px-8 shadow-lg shadow-primary/30"
            >
              Tiếp Tục <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SeatsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <SeatsContent />
    </Suspense>
  );
}
