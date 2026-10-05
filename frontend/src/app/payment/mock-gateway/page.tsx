'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import { toast } from 'sonner';
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

function MockGatewayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  
  const [isProcessing, setIsProcessing] = useState(false);

  if (!orderId || !amount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Yêu Cầu Thanh Toán Không Hợp Lệ</h2>
        <p className="text-xs text-[#d1c7ba]">Thiếu thông tin đơn hàng hoặc số tiền (orderId, amount).</p>
        <Button 
          onClick={() => router.push('/')}
          className="rounded-full bg-[#ff4b72] hover:bg-[#ff6584] text-white font-bold"
        >
          Về trang chủ ClGV
        </Button>
      </div>
    );
  }

  const handleSimulatePayment = async (success: boolean) => {
    setIsProcessing(true);
    
    // Simulate real network processing delay
    await new Promise((resolve) => setTimeout(resolve, 1400));
    
    const responseCode = success ? '00' : '24'; // 00 is success, 24 is cancelled in VNPAY
    
    try {
      // Call backend callback
      await axios.get(
        `http://localhost:4000/api/v1/payments/vnpay/callback?vnp_ResponseCode=${responseCode}&vnp_TxnRef=${orderId}&vnp_Amount=${amount}`
      );
      
      if (success) {
        toast.success('Thanh toán VNPAY thành công!');
        router.push(`/booking/success?bookingId=${orderId}`);
      } else {
        toast.error('Giao dịch thanh toán đã bị hủy.');
        router.push('/booking/showtimes');
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi gọi callback thanh toán.');
      setIsProcessing(false);
    }
  };

  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(amount));

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* VNPAY Branding Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wider uppercase mb-1">
          <span>SANDBOX TEST ENVIRONMENT</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="bg-white px-3 py-1.5 rounded-lg shadow-md inline-block">
            <img 
              src="https://vnpay.vn/wp-content/uploads/2020/07/Logo-VNPAYQR-update.png" 
              alt="VNPAY" 
              className="h-6 object-contain" 
            />
          </div>
        </div>
        <p className="text-xs text-[#afa49b]">Cổng Giả Lập Thanh Toán Trực Tuyến VNPAY-QR</p>
      </div>
      
      {/* Payment Card */}
      <div className="bg-[#27211f] border border-[#4a423d] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Order Details Header */}
        <div className="pb-4 border-b border-[#4a423d] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-[#afa49b] uppercase tracking-wider">Mã Giao Dịch</p>
            <p className="text-sm font-mono font-bold text-white mt-0.5">{orderId}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold text-[#afa49b] uppercase tracking-wider">Số Tiền</p>
            <p className="text-xl font-extrabold text-[#ff4b72] mt-0.5">{formattedAmount}</p>
          </div>
        </div>

        {/* QR Code Canvas */}
        <div className="flex flex-col items-center justify-center space-y-4 pt-2">
          <div className="bg-white p-4 rounded-2xl shadow-xl border-4 border-[#3b3230]">
            <QRCodeSVG 
              value={`VNPAY_SANDBOX_${orderId}_${amount}_PAYMENT_VERIFIED`}
              size={190}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"Q"}
            />
          </div>
          <p className="text-xs text-[#d1c7ba] text-center max-w-[260px] leading-relaxed">
            Mở ứng dụng Mobile Banking hoặc Ví điện tử quét mã QR để thanh toán thử nghiệm.
          </p>
        </div>

        {/* Sandbox Action Simulation Buttons */}
        <div className="pt-4 border-t border-[#4a423d] space-y-3">
          <Button 
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-[0_4px_16px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
            onClick={() => handleSimulatePayment(true)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý giao dịch...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Xác nhận đã quét thành công (Thành công)
              </span>
            )}
          </Button>

          <Button 
            variant="outline" 
            className="w-full h-11 rounded-xl border-[#4a423d] text-[#d1c7ba] hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 text-xs font-semibold cursor-pointer"
            onClick={() => handleSimulatePayment(false)}
            disabled={isProcessing}
          >
            Hủy giao dịch thanh toán
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-[#afa49b]/70 pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>VNPAY Sandbox Simulator · Dành cho kiểm thử hệ thống</span>
        </div>
      </div>
    </div>
  );
}

export default function MockPaymentGatewayPage() {
  return (
    <div className="min-h-screen bg-[#1f1a18] text-white py-14 flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-center text-[#d1c7ba]">Đang kết nối cổng VNPAY Sandbox...</div>}>
        <MockGatewayContent />
      </Suspense>
    </div>
  );
}
