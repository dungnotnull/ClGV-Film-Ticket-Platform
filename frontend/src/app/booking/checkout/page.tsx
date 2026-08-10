'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';
import { ChevronLeft, CreditCard, Wallet, AlertCircle, Ticket, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  }, [reservationId, accessToken, isProcessing]);

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
        const { bookingId, paymentUrl, paymentQrPayload } = res.data.data;
        
        if (paymentMethod === 'VNPAY') {
          // Rewrite the backend mock gateway URL to the frontend's mock gateway
          const frontendPaymentUrl = paymentUrl.replace(
            'http://localhost:4000/api/v1/payments/vnpay/mock-gateway',
            'http://localhost:3000/payment/mock-gateway'
          );
          window.location.href = frontendPaymentUrl;
        } else if (paymentMethod === 'VIETQR') {
          setPaymentQr(paymentUrl);
          setBookingId(bookingId);
        } else {
          // CGV Card deducts balance immediately
          toast.success('Thanh toán thành công bằng ví CGV!');
          resetBooking();
          router.push(`/booking/success?bookingId=${bookingId}`);
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error?.message || 'Có lỗi xảy ra khi tạo đơn hàng.');
      setIsProcessing(false);
    }
  };


  const seatsTotal = selectedSeats.reduce((acc, seat) => acc + seat.price, 0);
  const combosTotal = combos.reduce((acc, combo) => acc + combo.price * combo.quantity, 0);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => {
              setExitAction(() => () => router.back());
              setShowExitPrompt(true);
            }}>
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-3xl font-bold text-primary">Thanh Toán</h1>
          </div>
          <Button variant="destructive" className="border-destructive text-white hover:bg-destructive/90" onClick={() => {
            setExitAction(() => () => {
              isConfirmedExitRef.current = true;
              router.push('/booking/showtimes');
            });
            setShowExitPrompt(true);
          }}>
            Hủy Đặt Vé
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Payment Method & QR */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Phương thức thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between transition-colors ${paymentMethod === 'VNPAY' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                  onClick={() => setPaymentMethod('VNPAY')}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded">
                      <img src="https://vnpay.vn/wp-content/uploads/2020/07/Logo-VNPAYQR-update.png" alt="VNPAY" className="h-6 object-contain" />
                    </div>
                    <div>
                      <h3 className="font-bold">Thanh toán qua VNPAY-QR</h3>
                      <p className="text-sm text-muted-foreground">Mở ứng dụng ngân hàng để quét mã</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'VNPAY' ? 'border-primary' : 'border-muted'}`}>
                    {paymentMethod === 'VNPAY' && <div className="w-3 h-3 bg-primary rounded-full" />}
                  </div>
                </div>

                <div 
                  className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between transition-colors ${paymentMethod === 'CGV_CARD' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                  onClick={() => setPaymentMethod('CGV_CARD')}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-muted p-2 rounded text-primary">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold">Ví CGV Card</h3>
                      <p className="text-sm text-muted-foreground">Số dư: <span className="font-bold text-white">{(user?.cgvCardBalance || 0).toLocaleString('vi-VN')} ₫</span></p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'CGV_CARD' ? 'border-primary' : 'border-muted'}`}>
                    {paymentMethod === 'CGV_CARD' && <div className="w-3 h-3 bg-primary rounded-full" />}
                  </div>
                </div>

                <div 
                  className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between transition-colors ${paymentMethod === 'VIETQR' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                  onClick={() => setPaymentMethod('VIETQR')}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded">
                      <QrCode className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">Thanh toán qua VietQR</h3>
                      <p className="text-sm text-muted-foreground">Quét mã bằng ứng dụng ngân hàng</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'VIETQR' ? 'border-primary' : 'border-muted'}`}>
                    {paymentMethod === 'VIETQR' && <div className="w-3 h-3 bg-primary rounded-full" />}
                  </div>
                </div>

                {paymentMethod === 'CGV_CARD' && (user?.cgvCardBalance || 0) < getTotalAmount() && (
                  <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" /> Số dư ví không đủ để thanh toán.
                  </div>
                )}
              </CardContent>
            </Card>

            {paymentQr && (
              <Card className="bg-card border-border animate-in fade-in zoom-in duration-300">
                <CardContent className="p-8 flex flex-col items-center justify-center space-y-6">
                  <h3 className="text-xl font-bold text-center">Quét mã QR để thanh toán</h3>
                  <div className="bg-white p-4 rounded-xl">
                    {paymentMethod === 'VIETQR' ? (
                      <img src={paymentQr} alt="VietQR" className="w-[200px] h-[200px] object-contain" />
                    ) : (
                      <QRCodeSVG 
                        value={paymentQr}
                        size={200}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"Q"}
                      />
                    )}
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-bold text-primary text-2xl">{getTotalAmount().toLocaleString('vi-VN')} ₫</p>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Đang chờ thanh toán...
                    </div>
                  </div>
                  {paymentMethod === 'VIETQR' && (
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => {
                        resetBooking();
                        router.push(`/booking/success?bookingId=${bookingId}`);
                      }}
                    >
                      Tôi đã hoàn tất thanh toán
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border sticky top-24">
              <CardHeader className="bg-muted/50 border-b border-border">
                <CardTitle className="uppercase text-lg">Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  {/* Seats */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white">Vé xem phim ({selectedSeats.length})</p>
                      <p className="text-sm text-muted-foreground">Ghế: {selectedSeats.map(s => s.name).join(', ')}</p>
                    </div>
                    <p className="font-bold">{seatsTotal.toLocaleString('vi-VN')} ₫</p>
                  </div>

                  {/* Combos */}
                  {combos.length > 0 && (
                    <div className="pt-4 border-t border-border border-dashed">
                      <p className="font-bold text-white mb-2">Bắp nước</p>
                      <div className="space-y-2">
                        {combos.map(combo => (
                          <div key={combo.comboId} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{combo.quantity}x {combo.name}</span>
                            <span>{(combo.price * combo.quantity).toLocaleString('vi-VN')} ₫</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Discount */}
                  {appliedVoucher && (
                    <div className="pt-4 border-t border-border border-dashed flex justify-between items-center text-primary">
                      <span className="font-bold flex items-center gap-2">
                        <Ticket className="w-4 h-4" /> Mã giảm giá
                      </span>
                      <span className="font-bold">-{appliedVoucher.discountAmount.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="p-6 bg-primary/10 border-t border-primary/20 flex justify-between items-center">
                  <span className="font-bold text-lg">Tổng cộng</span>
                  <span className="font-bold text-3xl text-primary">{getTotalAmount().toLocaleString('vi-VN')} ₫</span>
                </div>

                <div className="p-6">
                  <Button 
                    className="w-full text-lg font-bold h-12" 
                    onClick={handleCheckout}
                    disabled={isProcessing || paymentQr !== null || (paymentMethod === 'CGV_CARD' && (user?.cgvCardBalance || 0) < getTotalAmount())}
                  >
                    {isProcessing ? 'Đang xử lý...' : 'Xác Nhận Thanh Toán'}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    Bằng việc bấm xác nhận, bạn đồng ý với Điều khoản và Điều kiện của CGV.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      <AlertDialog open={showExitPrompt} onOpenChange={setShowExitPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy thanh toán và thoát?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn thoát khỏi trang thanh toán? Chỗ ngồi bạn đã chọn sẽ bị hủy giữ và đơn hàng sẽ bị hủy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ở lại trang</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={async () => {
                isConfirmedExitRef.current = true;
                // Call release seat API before executing the exit action
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
              Đồng ý thoát
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
