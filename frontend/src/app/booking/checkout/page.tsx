'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';
import { ChevronLeft, CreditCard, Wallet, AlertCircle, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [paymentMethod, setPaymentMethod] = useState<'VNPAY' | 'CGV_CARD'>('VNPAY');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentQr, setPaymentQr] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/booking/checkout');
      return;
    }
    
    if (selectedSeats.length === 0 || !reservationId) {
      router.push('/booking/showtimes');
    }
  }, [isAuthenticated, selectedSeats, reservationId, router]);

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    try {
      const res = await axios.post(
        'http://localhost:4000/api/v1/bookings/checkout', 
        {
          reservationId,
          paymentMethod,
          comboIds: combos.map(c => ({ comboId: c.comboId, quantity: c.quantity }))
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      if (res.data.success) {
        const { bookingId, paymentUrl, paymentQrPayload } = res.data.data;
        
        if (paymentMethod === 'VNPAY') {
          // If we receive a QR payload from Mock VNPAY, we can display it.
          // Otherwise we redirect to paymentUrl. For this UI, we will simulate showing the QR code
          // and auto-redirecting to success after 3 seconds.
          setBookingId(bookingId);
          setPaymentQr(paymentQrPayload || `MOCK_VNPAY_QR_${bookingId}`);
          
          toast.info('Quét mã QR bằng ứng dụng ngân hàng hoặc VNPAY để thanh toán');
          
          // Simulate webhook callback after 3 seconds
          setTimeout(() => {
            resetBooking();
            router.push(`/booking/success?bookingId=${bookingId}`);
          }, 3000);
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
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-bold text-primary">Thanh Toán</h1>
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
                    <QRCodeSVG 
                      value={paymentQr}
                      size={200}
                      bgColor={"#ffffff"}
                      fgColor={"#000000"}
                      level={"Q"}
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-bold text-primary text-2xl">{getTotalAmount().toLocaleString('vi-VN')} ₫</p>
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Đang chờ thanh toán...
                    </p>
                  </div>
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
    </div>
  );
}
