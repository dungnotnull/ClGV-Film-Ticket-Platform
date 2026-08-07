"use client";

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { QrCode, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

export default function TicketScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize Scanner on mount
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] },
      false
    );

    scannerRef.current.render(onScanSuccess, onScanFailure);

    return () => {
      // Cleanup
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, []);

  const onScanSuccess = (decodedText: string) => {
    // Only process if it's a new code and we're not already verifying
    if (decodedText !== scanResult && !isVerifying) {
      setScanResult(decodedText);
      verifyTicket(decodedText);
    }
  };

  const onScanFailure = (error: any) => {
    // ignore
  };

  const verifyTicket = async (qrPayload: string) => {
    setIsVerifying(true);
    setTicketDetails(null);
    try {
      const res = await api.post('/tickets/verify-qr', { qrPayload });
      
      if (res.success) {
        setTicketDetails(res.data);
        if (res.data.status === 'VALID') {
          toast.success('Vé HỢP LỆ. Chấp nhận vào rạp.');
        } else {
          toast.error('Vé KHÔNG HỢP LỆ hoặc ĐÃ SỬ DỤNG.');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Lỗi khi xác thực vé');
      setTicketDetails({ status: 'INVALID', message: error.response?.data?.error?.message });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setTicketDetails(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <QrCode className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Soát Vé Qua Mã QR</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Máy quét QR (Camera)</CardTitle>
          </CardHeader>
          <CardContent>
            <div id="qr-reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border-2 border-primary/20"></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kết quả kiểm tra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!scanResult && !isVerifying && (
              <div className="text-center py-12 text-muted-foreground">
                Hãy đưa mã QR của khách hàng vào camera để quét.
              </div>
            )}

            {isVerifying && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-primary">
                <Loader2 className="w-12 h-12 animate-spin" />
                <p className="font-medium">Đang xác thực trên hệ thống...</p>
              </div>
            )}

            {ticketDetails && !isVerifying && (
              <div className={`p-6 rounded-xl border-2 ${ticketDetails.status === 'VALID' ? 'bg-green-500/10 border-green-500/50' : 'bg-destructive/10 border-destructive/50'}`}>
                <div className="flex items-center gap-4 mb-6">
                  {ticketDetails.status === 'VALID' ? (
                    <ShieldCheck className="w-12 h-12 text-green-500" />
                  ) : (
                    <ShieldAlert className="w-12 h-12 text-destructive" />
                  )}
                  <div>
                    <h3 className={`text-2xl font-bold ${ticketDetails.status === 'VALID' ? 'text-green-500' : 'text-destructive'}`}>
                      {ticketDetails.status === 'VALID' ? 'VÉ HỢP LỆ' : 'VÉ KHÔNG HỢP LỆ'}
                    </h3>
                    <p className="text-sm font-medium opacity-80">{ticketDetails.message || 'Có thể đã sử dụng hoặc giả mạo'}</p>
                  </div>
                </div>

                {ticketDetails.ticket && (
                  <div className="space-y-2 text-sm mt-4 pt-4 border-t border-border/50">
                    <p><span className="text-muted-foreground w-24 inline-block">Khách hàng:</span> <span className="font-bold">{ticketDetails.ticket.user?.fullName}</span></p>
                    <p><span className="text-muted-foreground w-24 inline-block">Tên phim:</span> <span className="font-bold">{ticketDetails.ticket.booking?.showtime?.movie?.title}</span></p>
                    <p><span className="text-muted-foreground w-24 inline-block">Rạp chiếu:</span> <span className="font-bold">{ticketDetails.ticket.booking?.showtime?.cinema?.name}</span></p>
                    <p><span className="text-muted-foreground w-24 inline-block">Phòng:</span> <span className="font-bold">{ticketDetails.ticket.booking?.showtime?.hall?.name}</span></p>
                    <p><span className="text-muted-foreground w-24 inline-block">Giờ chiếu:</span> <span className="font-bold">{new Date(ticketDetails.ticket.booking?.showtime?.startTime).toLocaleString('vi-VN')}</span></p>
                    <p><span className="text-muted-foreground w-24 inline-block">Ghế ngồi:</span> <span className="font-bold text-lg text-primary">{ticketDetails.ticket.seatName}</span></p>
                  </div>
                )}

                <Button className="w-full mt-6" variant="outline" onClick={handleReset}>
                  Quét vé tiếp theo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
