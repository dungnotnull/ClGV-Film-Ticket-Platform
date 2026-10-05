'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';
import { ChevronLeft, CreditCard, Wallet, AlertCircle, Ticket, QrCode, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { QRCodeSVG } from 'qrcode.react';
import { BookingProgressRail } from '@/components/booking/BookingProgressRail';

export default function CheckoutPage() {
  const router = useRouter();
  const { 
    showtimeId,
    selectedSeats, 
    reservationId,
    combos,
    appliedVoucher,
    getTotalAmount,
    resetBooking
  } = useBookingStore();
  
  const { isAuthenticated, user, accessToken } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState<'VNPAY' | 'CGV_CARD' | 'VIETQR'>('VNPAY');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentQr, setPaymentQr] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [exitAction, setExitAction] = useState<(() => void) | null>(null);
  const isConfirmedExitRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/booking/checkout');
      return;
    }
    
    if (selectedSeats.length === 0 || !reservationId) {
      router.push('/booking/showtimes');
    }
  }, [isAuthenticated, selectedSeats, reservationId, router]);

  useEffect(() => {
    if (isProcessing) return;

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
  }, [reservationId, accessToken, isProcessing, showtimeId, selectedSeats]);

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    try {
      const res = await axios.post(
        'http://localhost:4000/api/v1/bookings/checkout', 
        {
          reservationId,
          showtimeId,
          seatIds: selectedSeats.map(s => s.id),
          paymentMethod,
          comboIds: combos.map(c => ({ comboId: c.comboId, quantity: c.quantity })),
          voucherCode: appliedVoucher?.code,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      if (res.data.success) {
        const { bookingId, paymentUrl } = res.data.data;
        
        if (paymentMethod === 'VNPAY') {
          // Rewrite backend mock gateway URL to frontend mock gateway
          const frontendPaymentUrl = paymentUrl.replace(
            'http://localhost:4000/api/v1/payments/vnpay/mock-gateway',
            'http://localhost:3000/payment/mock-gateway'
          );
          window.location.href = frontendPaymentUrl;
        } else if (paymentMethod === 'VIETQR') {
          setPaymentQr(paymentUrl);
          setBookingId(bookingId);
          setIsProcessing(false);
        } else {
          // CGV Card deducts balance immediately
          toast.success('Thanh toán thành công bằng ví CGV Card!');
          resetBooking();
          router.push(`/booking/success?bookingId=${bookingId}`);
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error?.message || 'Có lỗi xảy ra khi tạo đơn hàng thanh toán.');
      setIsProcessing(false);
    }
  };

  const seatsTotal = selectedSeats.reduce((acc, seat) => acc + seat.price, 0);
  const combosTotal = combos.reduce((acc, combo) => acc + combo.price * combo.quantity, 0);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#1f1a18] text-white pt-6 pb-28">
      {/* Ticket Rail */}
      <BookingProgressRail currentStep="checkout" />

      <div className="max-w-[1240px] mx-auto px-4">
        {/* Title Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-serif tracking-wide text-white">
            Phương Thức Thanh Toán
          </h1>
          <p className="text-sm text-[#d1c7ba] mt-2 flex items-center justify-center md:justify-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Giao dịch bảo mật 256-bit SSL · Mã vé điện tử xuất tức thì ngay sau khi thanh toán</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Payment Methods Selection */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Method 1: VNPAY-QR */}
            <div 
              onClick={() => setPaymentMethod('VNPAY')}
              className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                paymentMethod === 'VNPAY'
                  ? 'bg-[#27211f] border-[#ff4b72] shadow-[0_0_25px_rgba(255,75,114,0.25)] ring-1 ring-[#ff4b72]'
                  : 'bg-[#27211f]/60 border-[#4a423d] hover:border-[#ff8fa3]/40'
              }`}
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                  paymentMethod === 'VNPAY' ? 'border-[#ff4b72]' : 'border-[#4a423d]'
                }`}>
                  {paymentMethod === 'VNPAY' && <div className="w-3 h-3 bg-[#ff4b72] rounded-full" />}
                </div>

                <div className="w-12 h-12 bg-white rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-sm">
                  <img 
                    src="https://vnpay.vn/wp-content/uploads/2020/07/Logo-VNPAYQR-update.png" 
                    alt="VNPAY" 
                    className="w-full h-full object-contain" 
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base text-white">Cổng VNPAY-QR (Khuyên Dùng)</h3>
                    <span className="text-[10px] font-bold bg-[#ff4b72]/20 border border-[#ff4b72]/40 text-[#ff8fa3] px-2.5 py-0.5 rounded-full">
                      GIẢM 20K CHO ĐƠN TỪ 200K
                    </span>
                  </div>
                  <p className="text-xs text-[#d1c7ba] mt-1 leading-relaxed">
                    Quét mã VNPAY-QR qua 40+ ứng dụng ngân hàng & ví điện tử (VCB, ACB, MB, Techcombank...)
                  </p>
                </div>
              </div>
            </div>

            {/* Method 2: ClGV Card Wallet */}
            <div 
              onClick={() => setPaymentMethod('CGV_CARD')}
              className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                paymentMethod === 'CGV_CARD'
                  ? 'bg-[#27211f] border-[#ff4b72] shadow-[0_0_25px_rgba(255,75,114,0.25)] ring-1 ring-[#ff4b72]'
                  : 'bg-[#27211f]/60 border-[#4a423d] hover:border-[#ff8fa3]/40'
              }`}
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                  paymentMethod === 'CGV_CARD' ? 'border-[#ff4b72]' : 'border-[#4a423d]'
                }`}>
                  {paymentMethod === 'CGV_CARD' && <div className="w-3 h-3 bg-[#ff4b72] rounded-full" />}
                </div>

                <div className="w-12 h-12 bg-[#3b3230] border border-[#4a423d] rounded-xl flex items-center justify-center text-[#ff8fa3] shrink-0">
                  <Wallet className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base text-white">Ví ClGV Card & Điểm Thưởng</h3>
                    <span className="text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 rounded-full">
                      KHẢ DỤNG
                    </span>
                  </div>
                  <p className="text-xs text-[#d1c7ba] mt-1 leading-relaxed">
                    Trừ tiền trực tiếp vào số dư ví của bạn (Số dư khả dụng:{' '}
                    <strong className="text-white">{(user?.cgvCardBalance || 0).toLocaleString('vi-VN')} ₫</strong>)
                  </p>
                </div>
              </div>
            </div>

            {/* Insufficient balance warning */}
            {paymentMethod === 'CGV_CARD' && (user?.cgvCardBalance || 0) < getTotalAmount() && (
              <div className="flex items-center gap-3 text-red-400 text-xs bg-red-500/10 border border-red-500/30 p-4 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Số dư ví hiện tại không đủ để thanh toán đơn hàng này. Vui lòng nạp thêm hoặc chọn phương thức VNPAY / VietQR.</span>
              </div>
            )}

            {/* Method 3: VietQR Napas 247 */}
            <div 
              onClick={() => setPaymentMethod('VIETQR')}
              className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                paymentMethod === 'VIETQR'
                  ? 'bg-[#27211f] border-[#ff4b72] shadow-[0_0_25px_rgba(255,75,114,0.25)] ring-1 ring-[#ff4b72]'
                  : 'bg-[#27211f]/60 border-[#4a423d] hover:border-[#ff8fa3]/40'
              }`}
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                  paymentMethod === 'VIETQR' ? 'border-[#ff4b72]' : 'border-[#4a423d]'
                }`}>
                  {paymentMethod === 'VIETQR' && <div className="w-3 h-3 bg-[#ff4b72] rounded-full" />}
                </div>

                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 p-1">
                  <QrCode className="w-7 h-7 text-indigo-700" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base text-white">Chuyển Khoản Ngân Hàng VietQR (Napas 247)</h3>
                    <span className="text-[10px] font-bold bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 px-2.5 py-0.5 rounded-full">
                      TỰ ĐỘNG
                    </span>
                  </div>
                  <p className="text-xs text-[#d1c7ba] mt-1 leading-relaxed">
                    Quét mã QR chuyển khoản liên ngân hàng 24/7, hệ thống tự động xác nhận đơn tức thì
                  </p>
                </div>
              </div>
            </div>

            {/* VietQR Live Code Preview Card */}
            {paymentQr && (
              <div className="bg-[#27211f] border border-[#ff4b72] rounded-2xl p-8 flex flex-col items-center justify-center space-y-6 shadow-2xl animate-in fade-in zoom-in duration-300">
                <h3 className="text-xl font-bold text-center text-white">Quét mã QR để thanh toán VietQR</h3>
                
                <div className="bg-white p-5 rounded-2xl shadow-xl">
                  {paymentMethod === 'VIETQR' && paymentQr.startsWith('http') ? (
                    <img src={paymentQr} alt="VietQR" className="w-[220px] h-[220px] object-contain" />
                  ) : (
                    <QRCodeSVG 
                      value={paymentQr}
                      size={220}
                      bgColor={"#ffffff"}
                      fgColor={"#000000"}
                      level={"Q"}
                    />
                  )}
                </div>

                <div className="text-center space-y-2">
                  <p className="font-extrabold text-[#ff4b72] text-3xl">
                    {getTotalAmount().toLocaleString('vi-VN')} ₫
                  </p>
                  <div className="text-xs text-[#d1c7ba] flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-[#ff4b72] border-t-transparent rounded-full animate-spin" />
                    <span>Đang chờ bạn quét mã hoàn tất thanh toán...</span>
                  </div>
                </div>

                {paymentMethod === 'VIETQR' && (
                  <Button 
                    className="w-full max-w-sm h-12 rounded-full bg-gradient-to-r from-[#ff4b72] to-[#ff6584] hover:opacity-95 text-white font-bold cursor-pointer" 
                    onClick={() => {
                      resetBooking();
                      router.push(`/booking/success?bookingId=${bookingId}`);
                    }}
                  >
                    Tôi đã chuyển khoản thành công
                  </Button>
                )}
              </div>
            )}

          </div>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-4">
            <div className="bg-[#27211f] border border-[#4a423d] rounded-3xl p-6 shadow-2xl space-y-6 sticky top-24">
              <h2 className="text-base font-bold text-white uppercase tracking-wider pb-4 border-b border-[#4a423d]">
                Tóm tắt đơn hàng
              </h2>

              {/* Seats Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-white">Vé xem phim ({selectedSeats.length})</p>
                    <p className="text-xs text-[#afa49b] mt-0.5">
                      Ghế: <strong className="text-[#ff8fa3]">{selectedSeats.map(s => s.name).join(', ')}</strong>
                    </p>
                  </div>
                  <span className="text-sm font-bold text-white">
                    {seatsTotal.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              {/* Combos Section */}
              {combos.length > 0 && (
                <div className="pt-4 border-t border-[#4a423d] border-dashed space-y-2">
                  <p className="text-xs font-semibold text-white uppercase tracking-wider">Bắp Nước</p>
                  <div className="space-y-1.5">
                    {combos.map((combo) => (
                      <div key={combo.comboId} className="flex justify-between text-xs text-[#d1c7ba]">
                        <span>{combo.quantity}× {combo.name}</span>
                        <span className="font-semibold text-white">
                          {(combo.price * combo.quantity).toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Voucher Discount */}
              {appliedVoucher && (
                <div className="pt-4 border-t border-[#4a423d] border-dashed flex justify-between items-center text-emerald-400 text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5" /> Mã giảm ({appliedVoucher.code})
                  </span>
                  <span>-{appliedVoucher.discountAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
              )}

              {/* Grand Total */}
              <div className="pt-4 border-t border-[#4a423d] flex justify-between items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#afa49b]">TỔNG CỘNG</p>
                  <p className="text-xs text-[#afa49b]/80 mt-0.5">Đã bao gồm VAT</p>
                </div>
                <span className="text-3xl font-extrabold text-[#ff4b72]">
                  {getTotalAmount().toLocaleString('vi-VN')} ₫
                </span>
              </div>

              {/* Submit CTA Button */}
              <Button
                size="lg"
                onClick={handleCheckout}
                disabled={isProcessing || (paymentMethod === 'CGV_CARD' && (user?.cgvCardBalance || 0) < getTotalAmount())}
                className="w-full h-13 rounded-full bg-gradient-to-r from-[#ff4b72] to-[#ff6584] hover:opacity-95 text-white font-bold text-base shadow-[0_8px_20px_rgba(255,75,114,0.35)] transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang kết nối cổng thanh toán...</span>
                  </div>
                ) : (
                  <>
                    <span>Xác Nhận & Thanh Toán</span>
                    <ArrowRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setExitAction(() => () => {
                      isConfirmedExitRef.current = true;
                      router.push('/booking/showtimes');
                    });
                    setShowExitPrompt(true);
                  }}
                  className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  Hủy đặt vé này
                </Button>

                <p className="text-[11px] text-[#afa49b]/70 text-right">
                  Bảo mật 100%
                </p>
              </div>

              <p className="text-center text-[10px] text-[#afa49b]/60 leading-normal">
                Bằng việc bấm xác nhận, bạn đồng ý với Điều khoản dịch vụ và Quy chế vé của ClGV Cinema.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Confirmation Exit Dialog */}
      <AlertDialog open={showExitPrompt} onOpenChange={setShowExitPrompt}>
        <AlertDialogContent className="bg-[#27211f] border border-[#4a423d] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" /> Hủy thanh toán và thoát?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#d1c7ba]">
              Bạn có chắc chắn muốn thoát khỏi trang thanh toán? Chỗ ngồi bạn đã chọn sẽ bị hủy giữ và đơn hàng sẽ bị xóa.
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
              Đồng ý hủy & Thoát
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
