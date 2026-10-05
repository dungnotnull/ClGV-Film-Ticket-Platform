'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Clock, ChevronRight, ChevronLeft, Ticket, CheckCircle2, ShoppingBag, UtensilsCrossed, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBookingStore } from '@/store/useBookingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { BookingProgressRail } from '@/components/booking/BookingProgressRail';

export default function FBAndVoucherPage() {
  const router = useRouter();
  const {
    showtimeId,
    selectedSeats,
    reservationId,
    expiresAt,
    combos,
    addCombo,
    removeCombo,
    appliedVoucher,
    applyVoucher,
    getTotalAmount,
    resetBooking
  } = useBookingStore();
  const { isAuthenticated, accessToken, user } = useAuthStore();

  const [availableCombos, setAvailableCombos] = useState<any[]>([]);
  const [walletVouchers, setWalletVouchers] = useState<any[]>([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [timeLeft, setTimeLeft] = useState<string>('10:00');
  const [isMounted, setIsMounted] = useState(false);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [exitAction, setExitAction] = useState<(() => void) | null>(null);
  const isConfirmedExitRef = useRef(false);

  useEffect(() => {
    if (selectedSeats.length === 0 || !reservationId) {
      router.push('/booking/showtimes');
      return;
    }

    // Timer logic
    const timer = setInterval(() => {
      if (!expiresAt) return;
      const now = new Date().getTime();
      const expires = new Date(expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        clearInterval(timer);
        toast.error('Thời gian giữ ghế đã hết. Vui lòng đặt lại.');
        router.push('/booking/showtimes');
      } else {
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedSeats, reservationId, expiresAt, router]);

  useEffect(() => {
    // 1. Browser Reload/Close Tab Prompt
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isConfirmedExitRef.current) return;
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 2. Actually left the page (closed tab or reloaded) - send beacon
    const handleUnload = () => {
      if (showtimeId && selectedSeats.length > 0 && accessToken) {
        const url = 'http://localhost:4000/api/v1/bookings/release-seat';
        const body = JSON.stringify({ 
          showtimeId, 
          seatIds: selectedSeats.map(s => s.id) 
        });
        navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
      }
    };
    window.addEventListener('unload', handleUnload);

    // 3. Client-side link clicks (Header navigation, etc)
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.href && target.target !== '_blank') {
        const url = new URL(target.href);
        if (url.origin === window.location.origin && url.pathname === '/booking/checkout') {
          return;
        }
        if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
          e.preventDefault();
          e.stopPropagation();
          setExitAction(() => () => {
            window.location.href = target.href;
          });
          setShowExitPrompt(true);
        }
      }
    };
    document.addEventListener('click', handleClick, { capture: true });

    // 4. Back button interception
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      setShowExitPrompt(true);
      setExitAction(() => () => {
        window.history.go(-2); 
      });
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      document.removeEventListener('click', handleClick, { capture: true });
      window.removeEventListener('popstate', handlePopState);
    };
  }, [reservationId, accessToken, showtimeId, selectedSeats]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Fetch Combos
    axios.get('http://localhost:4000/api/v1/combos')
      .then(res => {
        if (res.data.success) setAvailableCombos(res.data.data);
      })
      .catch(err => console.error(err));

    // Fetch Vouchers if logged in
    if (isAuthenticated && accessToken) {
      axios.get('http://localhost:4000/api/v1/vouchers/wallet', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
        .then(res => {
          if (res.data.success) setWalletVouchers(res.data.data);
        })
        .catch(err => console.error(err));
    }
  }, [isAuthenticated, accessToken]);

  const handleApplyVoucher = async (codeToApply?: string) => {
    const code = codeToApply || voucherCode;
    if (!code) return;
    
    if (!isAuthenticated || !accessToken) {
      toast.info('Vui lòng đăng nhập để sử dụng mã giảm giá');
      router.push('/login?redirect=/booking/fb');
      return;
    }

    setIsApplyingVoucher(true);
    try {
      const res = await axios.post(
        'http://localhost:4000/api/v1/vouchers/apply',
        {
          code: code,
          orderAmount: getTotalAmount(),
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (res.data.success) {
        applyVoucher({ 
          code: code, 
          discountAmount: res.data.data.discountAmount 
        });
        toast.success(`Áp dụng mã giảm giá thành công! Giảm ${res.data.data.discountAmount.toLocaleString('vi-VN')} ₫`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc không đủ điều kiện áp dụng.';
      toast.error(message);
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleNext = () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để tiếp tục thanh toán');
      router.push('/login?redirect=/booking/checkout');
      return;
    }
    router.push('/booking/checkout');
  };

  if (!isMounted) return null;

  const totalSeatsPrice = selectedSeats.reduce((acc, s) => acc + s.price, 0);
  const totalCombosPrice = combos.reduce((acc, c) => acc + c.price * c.quantity, 0);

  return (
    <div className="min-h-screen bg-[#1f1a18] text-white pt-4 pb-32">
      {/* Top Floating Timer Pill */}
      <div className="sticky top-20 z-30 px-4 mb-6">
        <div className="max-w-2xl mx-auto h-11 bg-[#27211f]/90 backdrop-blur-xl border border-[#4a423d] rounded-full px-5 flex items-center justify-between shadow-xl">
          <div className="text-xs text-[#d1c7ba] flex items-center gap-1.5 truncate">
            <span>Mã giữ chỗ:</span>
            <span className="font-mono font-bold text-[#ff8fa3]">{reservationId?.substring(0, 8)}...</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#ff4b72] bg-[#ff4b72]/10 px-3 py-1 rounded-full border border-[#ff4b72]/30">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Thời gian giữ ghế: {timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Progress Rail */}
      <BookingProgressRail currentStep="fb" />

      <div className="max-w-[1180px] mx-auto px-4">
        {/* Title Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl md:text-4xl font-serif tracking-wide text-white">
            Bắp Nước & Combo Ưu Đãi
          </h1>
          <p className="text-sm text-[#d1c7ba] mt-2">
            Thêm bắp rang bơ thơm giòn và thức uống mát lạnh để buổi xem phim của bạn thêm thăng hoa
          </p>
        </div>

        {/* Main Grid: Combos & Vouchers */}
        <div className="space-y-12">
          
          {/* Section 1: Combos List */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2.5 text-white">
                <UtensilsCrossed className="w-5 h-5 text-[#ff4b72]" />
                <span>Danh Sách Combo Bắp Nước</span>
              </h2>
              <span className="text-xs text-[#afa49b]">
                Đã chọn: <strong className="text-white">{combos.reduce((acc, c) => acc + c.quantity, 0)}</strong> phần
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCombos.length > 0 ? (
                availableCombos.map((combo) => {
                  const selected = combos.find((c) => c.comboId === combo.id);
                  const quantity = selected ? selected.quantity : 0;

                  return (
                    <div
                      key={combo.id}
                      className={`group bg-[#27211f] border rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between ${
                        quantity > 0
                          ? 'border-[#ff4b72] shadow-[0_0_20px_rgba(255,75,114,0.2)]'
                          : 'border-[#4a423d] hover:border-[#ff8fa3]/50'
                      }`}
                    >
                      {/* Combo Visual / Banner */}
                      <div className="relative h-40 bg-[#302927] overflow-hidden">
                        <img
                          src={combo.imageUrl || 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=500&auto=format&fit=crop&q=60'}
                          alt={combo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#27211f] via-transparent to-transparent" />
                        <span className="absolute top-3 left-3 bg-[#1f1a18]/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/10">
                          🍿 {combo.title}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="font-bold text-base text-white">{combo.title}</h3>
                          <p className="text-xs text-[#afa49b] mt-1.5 line-clamp-2 leading-relaxed">
                            {combo.description || 'Thức uống sảng khoái và bắp rang bơ nóng hổi chuẩn rạp'}
                          </p>
                        </div>

                        {/* Price & Quantity Stepper */}
                        <div className="flex items-center justify-between pt-3 border-t border-[#4a423d]/50">
                          <span className="font-bold text-lg text-[#ff4b72]">
                            {combo.price.toLocaleString('vi-VN')} ₫
                          </span>

                          <div className="flex items-center gap-2 bg-[#1f1a18] px-2 py-1 rounded-full border border-[#4a423d]">
                            <button
                              disabled={quantity === 0}
                              onClick={() => {
                                if (quantity > 1) {
                                  addCombo({ comboId: combo.id, name: combo.title, price: combo.price, quantity: quantity - 1 });
                                } else if (quantity === 1) {
                                  removeCombo(combo.id);
                                }
                              }}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold bg-[#302927] hover:bg-[#ff4b72] disabled:opacity-30 disabled:hover:bg-[#302927] text-white transition-colors cursor-pointer"
                            >
                              −
                            </button>
                            <span className="w-5 text-center text-xs font-bold text-white">
                              {quantity}
                            </span>
                            <button
                              onClick={() => {
                                addCombo({ comboId: combo.id, name: combo.title, price: combo.price, quantity: quantity + 1 });
                              }}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold bg-[#ff4b72] hover:bg-[#ff6584] text-white shadow-sm transition-colors cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full p-12 text-center text-[#afa49b] bg-[#27211f] border border-[#4a423d] rounded-2xl">
                  Hiện chưa có combo bắp nước nào khả dụng cho suất chiếu này.
                </div>
              )}
            </div>
          </section>

          {/* Section 2: Vouchers & Discount Codes */}
          <section className="bg-[#27211f] border border-[#4a423d] rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold flex items-center gap-2.5 text-white mb-6">
              <Ticket className="w-5 h-5 text-[#ff4b72]" />
              <span>Khuyến Mãi & Mã Giảm Giá</span>
            </h2>

            <div className="max-w-xl space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Nhập mã giảm giá (ví dụ: CLGV20K, VIP50)..."
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="bg-[#1f1a18] border-[#4a423d] text-white placeholder:text-[#afa49b]/60 h-12 rounded-xl focus:border-[#ff4b72]"
                />
                <Button
                  onClick={() => handleApplyVoucher()}
                  disabled={!voucherCode.trim() || isApplyingVoucher}
                  className="h-12 px-6 rounded-xl bg-[#ff4b72] hover:bg-[#ff6584] text-white font-bold shrink-0 cursor-pointer"
                >
                  {isApplyingVoucher ? 'Đang kiểm tra...' : 'Áp Dụng'}
                </Button>
              </div>

              {/* Applied Voucher Notification */}
              {appliedVoucher && (
                <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-white">
                        Đã áp dụng mã: <span className="text-emerald-400">{appliedVoucher.code}</span>
                      </p>
                      <p className="text-xs text-emerald-300">
                        Giảm {appliedVoucher.discountAmount.toLocaleString('vi-VN')} ₫ trên tổng đơn hàng
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyVoucher(null)}
                    className="text-xs text-[#afa49b] hover:text-white hover:bg-white/10"
                  >
                    Hủy áp dụng
                  </Button>
                </div>
              )}

              {/* Wallet Vouchers list if available */}
              {walletVouchers.length > 0 && (
                <div className="pt-4 border-t border-[#4a423d]/50">
                  <p className="text-xs font-semibold text-[#afa49b] uppercase tracking-wider mb-3">
                    Voucher trong ví của bạn
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {walletVouchers.map((v: any) => (
                      <button
                        key={v.id || v.code}
                        onClick={() => handleApplyVoucher(v.code)}
                        className="text-xs px-3.5 py-1.5 bg-[#302927] hover:bg-[#ff4b72]/20 border border-[#4a423d] hover:border-[#ff4b72] text-[#d1c7ba] hover:text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Ticket className="w-3.5 h-3.5 text-[#ff8fa3]" />
                        <span className="font-bold">{v.code}</span>
                        <span>(-{v.discountAmount?.toLocaleString('vi-VN') || '10%'})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>

      {/* Fixed Bottom Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#27211f]/95 backdrop-blur-xl border-t border-[#4a423d] p-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.7)]">
        <div className="max-w-[1180px] mx-auto flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setExitAction(() => () => router.back());
              setShowExitPrompt(true);
            }}
            className="border-[#4a423d] text-[#d1c7ba] hover:text-white hover:bg-[#302927] rounded-full px-5 hidden sm:flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> Quay Lại Sơ Đồ Ghế
          </Button>

          <div className="flex items-center gap-6 sm:gap-8 flex-1 justify-end">
            <div className="text-right">
              <p className="text-[11px] text-[#afa49b]">
                Vé: {selectedSeats.length} · Bắp nước: {combos.reduce((acc, c) => acc + c.quantity, 0)}
              </p>
              <div className="flex items-baseline justify-end gap-2">
                {appliedVoucher && (
                  <span className="text-xs line-through text-[#afa49b]">
                    {(getTotalAmount() + appliedVoucher.discountAmount).toLocaleString('vi-VN')} ₫
                  </span>
                )}
                <span className="font-extrabold text-2xl md:text-3xl text-[#ff4b72]">
                  {getTotalAmount().toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleNext}
              className="h-12 sm:h-13 rounded-full px-7 sm:px-9 bg-gradient-to-r from-[#ff4b72] to-[#ff6584] hover:opacity-95 text-white font-bold text-sm sm:text-base shadow-[0_8px_20px_rgba(255,75,114,0.35)] transition-all cursor-pointer"
            >
              <span>Thanh Toán</span>
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Exit Modal */}
      <AlertDialog open={showExitPrompt} onOpenChange={setShowExitPrompt}>
        <AlertDialogContent className="bg-[#27211f] border border-[#4a423d] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" /> Hủy thanh toán và thoát?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#d1c7ba]">
              Bạn có chắc chắn muốn thoát khỏi quá trình đặt vé? Chỗ ngồi bạn đã chọn sẽ bị hủy giữ và thông tin đơn hàng sẽ bị xóa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#4a423d] bg-transparent text-[#d1c7ba] hover:bg-[#302927] hover:text-white">
              Ở lại tiếp tục
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
              onClick={async () => {
                isConfirmedExitRef.current = true;
                try {
                  await axios.post(
                    'http://localhost:4000/api/v1/bookings/release-seat',
                    { 
                      showtimeId, 
                      seatIds: selectedSeats.map(s => s.id) 
                    },
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                  );
                } catch (e) {
                  console.error(e);
                }
                resetBooking();
                if (exitAction) exitAction();
              }}
            >
              Đồng ý thoát & Hủy giữ ghế
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
