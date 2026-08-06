'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Clock, ChevronRight, ChevronLeft, Ticket, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBookingStore } from '@/store/useBookingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/input';

export default function FBAndVoucherPage() {
  const router = useRouter();
  const { 
    selectedSeats, 
    reservationId, 
    expiresAt, 
    combos, 
    addCombo, 
    removeCombo, 
    appliedVoucher, 
    applyVoucher,
    getTotalAmount 
  } = useBookingStore();
  const { isAuthenticated, accessToken } = useAuthStore();

  const [availableCombos, setAvailableCombos] = useState<any[]>([]);
  const [walletVouchers, setWalletVouchers] = useState<any[]>([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [timeLeft, setTimeLeft] = useState<string>('10:00');

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

  const handleApplyVoucher = () => {
    if (!voucherCode) return;
    
    // In real app, we would validate code via API.
    // For now, check if it's in wallet or mock it
    const voucher = walletVouchers.find(v => v.code === voucherCode);
    if (voucher) {
      applyVoucher({ code: voucher.code, discountAmount: voucher.discountValue || 50000 });
      toast.success('Áp dụng mã giảm giá thành công!');
    } else if (voucherCode === 'CGV50K') { // mock valid code
      applyVoucher({ code: 'CGV50K', discountAmount: 50000 });
      toast.success('Áp dụng mã giảm giá thành công!');
    } else {
      toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
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

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Top Timer Bar */}
      <div className="bg-primary/10 border-b border-primary/20 sticky top-0 z-40 backdrop-blur-md">
        <div className="container mx-auto px-4 h-12 flex justify-between items-center text-sm font-medium">
          <span>Mã giữ chỗ: <span className="text-primary font-bold">{reservationId?.substring(0, 8)}</span></span>
          <span className="flex items-center gap-2 text-primary font-bold">
            <Clock className="w-4 h-4" /> Thời gian giữ ghế: {timeLeft}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          
          {/* Bắp Nước Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><ShoppingBag className="text-primary"/> Combo Bắp Nước</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCombos.length > 0 ? availableCombos.map((combo) => {
                const selected = combos.find(c => c.comboId === combo.id);
                const quantity = selected ? selected.quantity : 0;
                
                return (
                  <Card key={combo.id} className="bg-card border-border overflow-hidden flex flex-row h-32">
                    <div className="w-32 bg-muted shrink-0">
                      <img src={combo.imageUrl || 'https://via.placeholder.com/150?text=Combo'} alt={combo.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 flex flex-col justify-between w-full">
                      <div>
                        <h3 className="font-bold text-sm leading-tight">{combo.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{combo.description}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="font-bold text-primary">{combo.price.toLocaleString('vi-VN')} ₫</span>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7 rounded-full"
                            onClick={() => {
                              if (quantity > 1) {
                                addCombo({ comboId: combo.id, name: combo.title, price: combo.price, quantity: quantity - 1 });
                              } else if (quantity === 1) {
                                removeCombo(combo.id);
                              }
                            }}
                          >-</Button>
                          <span className="w-4 text-center text-sm font-bold">{quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7 rounded-full bg-primary/20 hover:bg-primary border-primary/50"
                            onClick={() => {
                              addCombo({ comboId: combo.id, name: combo.title, price: combo.price, quantity: quantity + 1 });
                            }}
                          >+</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              }) : (
                <div className="col-span-2 p-8 text-center text-muted-foreground border rounded-lg">
                  Tạm thời chưa có combo bắp nước nào.
                </div>
              )}
            </div>
          </section>

          {/* Vouchers & Điểm Thưởng Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Ticket className="text-primary"/> Khuyến Mãi & Voucher</h2>
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <Input 
                    placeholder="Nhập mã giảm giá CGV..." 
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleApplyVoucher} variant="secondary">Áp Dụng</Button>
                </div>

                {appliedVoucher && (
                  <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-primary w-5 h-5" />
                      <div>
                        <p className="font-bold">Đã áp dụng mã: {appliedVoucher.code}</p>
                        <p className="text-sm text-primary">Giảm {appliedVoucher.discountAmount.toLocaleString('vi-VN')} ₫</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => applyVoucher(null)}>Hủy</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50 p-4">
        <div className="container mx-auto flex justify-between items-center max-w-4xl">
          <Button variant="outline" onClick={() => router.back()} className="hidden md:flex">
            <ChevronLeft className="mr-2 w-4 h-4" /> Quay Lại
          </Button>
          
          <div className="flex items-center gap-8 flex-1 justify-end">
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Tổng cộng:</p>
              <div className="flex items-end gap-2 flex-col md:flex-row">
                {appliedVoucher && (
                  <span className="text-sm line-through text-muted-foreground">
                    {(getTotalAmount() + appliedVoucher.discountAmount).toLocaleString('vi-VN')} ₫
                  </span>
                )}
                <span className="font-bold text-2xl text-primary">{getTotalAmount().toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>
            <Button 
              size="lg" 
              onClick={handleNext}
              className="text-lg font-bold px-8 shadow-lg shadow-primary/30"
            >
              Thanh Toán <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
