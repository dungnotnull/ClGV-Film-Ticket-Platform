'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import { toast } from 'sonner';
import { ShieldCheck, Loader2 } from 'lucide-react';

function MockGatewayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  
  const [isProcessing, setIsProcessing] = useState(false);

  if (!orderId || !amount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Invalid Request</h2>
        <p className="text-muted-foreground">Thiếu thông tin thanh toán (orderId, amount).</p>
        <Button onClick={() => router.push('/')}>Về trang chủ</Button>
      </div>
    );
  }

  const handleSimulatePayment = async (success: boolean) => {
    setIsProcessing(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const responseCode = success ? '00' : '24'; // 00 is success, 24 is cancelled in VNPAY
    
    try {
      // Call backend callback
      await axios.get(
        `http://localhost:4000/api/v1/payments/vnpay/callback?vnp_ResponseCode=${responseCode}&vnp_TxnRef=${orderId}&vnp_Amount=${amount}`
      );
      
      if (success) {
        toast.success('Thanh toán thành công!');
        router.push(`/booking/success?bookingId=${orderId}`);
      } else {
        toast.error('Thanh toán đã bị hủy.');
        router.push('/booking/showtimes'); // Go back to booking flow
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi gọi callback thanh toán.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">VNPAY SANDBOX</h1>
        <p className="text-sm text-muted-foreground">Môi trường giả lập thanh toán (Mock Gateway)</p>
      </div>
      
      <Card className="border-border">
        <CardHeader className="bg-muted/50 border-b">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Thông tin đơn hàng</span>
            <span className="text-primary font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount))}</span>
          </CardTitle>
          <CardDescription>Mã đơn: {orderId}</CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-white p-4 rounded-xl border">
              <QRCodeSVG 
                value={`MOCK_PAYMENT_${orderId}_${amount}`}
                size={200}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"Q"}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Quét mã QR bằng ứng dụng ngân hàng hoặc ví VNPAY.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="w-full text-destructive hover:bg-destructive hover:text-white"
              onClick={() => handleSimulatePayment(false)}
              disabled={isProcessing}
            >
              Hủy thanh toán
            </Button>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => handleSimulatePayment(true)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý</>
              ) : (
                <><ShieldCheck className="mr-2 h-4 w-4" /> Xác nhận đã quét</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MockPaymentGatewayPage() {
  return (
    <div className="min-h-screen bg-background py-12 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <Suspense fallback={<div className="text-center">Đang tải cổng thanh toán...</div>}>
          <MockGatewayContent />
        </Suspense>
      </div>
    </div>
  );
}
