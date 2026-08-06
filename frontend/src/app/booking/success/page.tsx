"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Download, Share2, MapPin, Calendar, Clock, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId') || 'BKG_MOCK_12345';
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 flex justify-center">
        <div className="w-full max-w-2xl bg-card border border-border rounded-lg overflow-hidden shadow-2xl">
          
          {/* Header */}
          <div className="bg-green-500/20 p-8 text-center border-b border-green-500/30">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/30 mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Thanh toán thành công!</h1>
            <p className="text-muted-foreground">Mã đơn hàng: <span className="font-bold text-white">{bookingId}</span></p>
          </div>

          {/* Ticket Info */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              
              {/* QR Code Section */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center p-6 bg-white rounded-xl border-4 border-dashed border-gray-300">
                <QRCodeSVG 
                  value={`CLGV_TICKET_${bookingId}_HMAC_VALID`}
                  size={150}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"M"}
                />
                <p className="text-black text-xs font-bold mt-4 tracking-widest text-center">MÃ VÉ ĐIỆN TỬ</p>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-primary uppercase mb-1">Mai (2024)</h2>
                  <p className="text-sm font-medium bg-primary/20 text-primary inline-block px-2 py-0.5 rounded border border-primary/30">
                    2D - T18
                  </p>
                </div>

                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-white" />
                    <div>
                      <p className="font-bold text-white">CGV Vincom Đồng Khởi</p>
                      <p>Hall 3 (IMAX)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-white" />
                    <p className="font-bold text-white">Thứ Sáu, 15/08/2026</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-white" />
                    <p className="font-bold text-white">19:30 - 21:40</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Ticket className="w-5 h-5 text-white" />
                    <p>Ghế: <span className="font-bold text-white text-base">H12, H13</span> (VIP)</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50 border-dashed flex justify-between items-center">
                  <span className="text-muted-foreground">Tổng tiền:</span>
                  <span className="text-xl font-bold text-white">280.000đ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-muted/30 p-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary hover:text-white">
              <Download className="w-4 h-4" /> Tải vé PDF
            </Button>
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" /> Chia sẻ
            </Button>
            <Link href="/">
              <Button className="w-full">Về Trang Chủ</Button>
            </Link>
          </div>
        </div>
        
        {/* Helper Note */}
        <p className="text-center text-xs text-muted-foreground mt-6 max-w-lg">
          Vui lòng đưa mã QR này cho nhân viên soát vé tại rạp. Vé điện tử cũng đã được gửi vào email và lưu trong mục "Lịch sử giao dịch" của bạn.
        </p>
      </div>
    </div>
  );
}
