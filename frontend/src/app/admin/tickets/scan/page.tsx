'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { QrCode, ShieldCheck, ShieldAlert, Loader2, RefreshCw, Film, MapPin, Calendar, Ticket } from 'lucide-react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

export default function TicketScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    try {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 240, height: 240 }, 
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] 
        },
        false
      );

      scannerRef.current.render(onScanSuccess, onScanFailure);
    } catch (e) {
      console.warn("Camera scanner init skipped or not supported:", e);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear html5QrcodeScanner:", error);
        });
      }
    };
  }, []);

  const onScanSuccess = (decodedText: string) => {
    if (decodedText !== scanResult && !isVerifying) {
      setScanResult(decodedText);
      verifyTicket(decodedText);
    }
  };

  const onScanFailure = () => {
    // Ignore frame scan failures
  };

  const verifyTicket = async (tokenToVerify: string) => {
    setIsVerifying(true);
    setTicketDetails(null);
    try {
      const res: any = await api.post('/tickets/verify-qr', { qrToken: tokenToVerify });
      
      if (res.verified || res.data?.verified) {
        const data = res.data || res;
        setTicketDetails({ status: 'VALID', ...data });
        toast.success(`Vé HỢP LỆ! Chấp nhận cho khách vào phòng chiếu.`);
      } else {
        setTicketDetails({ status: 'INVALID', message: 'Mã vé không hợp lệ hoặc đã qua sử dụng' });
        toast.error('Vé KHÔNG HỢP LỆ hoặc ĐÃ QUA SỬ DỤNG.');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Lỗi xác thực chữ ký HMAC mã vé';
      setTicketDetails({ status: 'INVALID', message });
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerify = () => {
    if (!manualToken.trim()) return;
    setScanResult(manualToken.trim());
    verifyTicket(manualToken.trim());
  };

  const handleReset = () => {
    setScanResult(null);
    setManualToken('');
    setTicketDetails(null);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <p className="text-xs font-bold text-[#ff8fa3] uppercase tracking-[0.2em] mb-1">
          CỔNG SOÁT VÉ THÔNG MINH
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif tracking-wide text-white uppercase font-bold">
          Soát Vé Turnstile (Mã QR HMAC)
        </h1>
        <p className="text-xs sm:text-sm text-[#d1c7ba] mt-1.5">
          Quét camera hoặc nhập token vé để kiểm tra tính hợp lệ và tự động check-in qua cổng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Camera Viewfinder & Manual Input */}
        <div className="lg:col-span-6 bg-[#27211f] border border-[#4a423d] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-[#4a423d]">
            <QrCode className="w-4 h-4 text-[#ff4b72]" /> Camera Quét Mã QR
          </h2>

          {/* Camera Viewfinder Container */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-[#4a423d] bg-black/60 p-2">
            <div id="qr-reader" className="w-full text-white" />
          </div>

          {/* Manual Input Alternative */}
          <div className="pt-2 border-t border-[#4a423d]/60 space-y-3">
            <label className="text-xs font-semibold text-[#afa49b] uppercase tracking-wider">
              Hoặc nhập mã Token vé thủ công
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Nhập mã token (ví dụ: TKT.ey...)"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="bg-[#1f1a18] border-[#4a423d] text-white h-11 rounded-xl text-xs"
              />
              <Button
                onClick={handleManualVerify}
                disabled={!manualToken.trim() || isVerifying}
                className="h-11 px-5 rounded-xl bg-[#ff4b72] hover:bg-[#ff6584] text-white font-bold text-xs shrink-0 cursor-pointer"
              >
                Kiểm Tra
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Verification Results */}
        <div className="lg:col-span-6 bg-[#27211f] border border-[#4a423d] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#4a423d]">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Kết Quả Soát Vé
            </h2>
            {ticketDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-[#afa49b] hover:text-white flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Quét tiếp
              </Button>
            )}
          </div>

          {!scanResult && !isVerifying && !ticketDetails && (
            <div className="py-20 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#1f1a18] border border-[#4a423d] flex items-center justify-center mx-auto text-[#afa49b]">
                <QrCode className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-white">Sẵn sàng nhận diện mã QR</p>
              <p className="text-xs text-[#afa49b] max-w-xs mx-auto">
                Đưa mã QR vé của khách hàng vào khung camera hoặc nhập chuỗi token bảo mật để xác thực.
              </p>
            </div>
          )}

          {isVerifying && (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-[#ff4b72] mx-auto" />
              <p className="text-sm font-bold text-white">Đang giải mã & xác thực chữ ký HMAC-SHA256...</p>
              <p className="text-xs text-[#afa49b]">Kiểm tra tính toàn vẹn và tình trạng check-in trong database</p>
            </div>
          )}

          {ticketDetails && !isVerifying && (
            <div className={`p-6 rounded-2xl border-2 space-y-5 ${
              ticketDetails.status === 'VALID'
                ? 'bg-emerald-500/10 border-emerald-500/50'
                : 'bg-red-500/10 border-red-500/50'
            }`}>
              
              {/* Status Header */}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  ticketDetails.status === 'VALID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {ticketDetails.status === 'VALID' ? (
                    <ShieldCheck className="w-7 h-7" />
                  ) : (
                    <ShieldAlert className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <h3 className={`text-xl font-black uppercase tracking-tight ${
                    ticketDetails.status === 'VALID' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {ticketDetails.status === 'VALID' ? 'VÉ HỢP LỆ — MỜI VÀO RẠP' : 'VÉ KHÔNG HỢP LỆ'}
                  </h3>
                  <p className="text-xs text-[#d1c7ba] mt-0.5">
                    {ticketDetails.status === 'VALID' 
                      ? 'Đã ghi nhận check-in và đổi trạng thái vé sang CHECKED_IN'
                      : ticketDetails.message || 'Mã vé không tồn tại hoặc đã được check-in trước đó'}
                  </p>
                </div>
              </div>

              {/* Verified Ticket Metadata */}
              {ticketDetails.status === 'VALID' && (
                <div className="pt-4 border-t border-emerald-500/30 space-y-2.5 text-xs text-[#d1c7ba]">
                  <div className="flex justify-between items-center py-1 border-b border-emerald-500/20">
                    <span className="text-[#afa49b]">Phim:</span>
                    <strong className="text-white text-sm">{ticketDetails.movieTitle || 'Đêm Không Ngủ'}</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-emerald-500/20">
                    <span className="text-[#afa49b]">Rạp & Phòng:</span>
                    <strong className="text-white">{ticketDetails.cinemaName} · {ticketDetails.hallName}</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-emerald-500/20">
                    <span className="text-[#afa49b]">Ghế ngồi:</span>
                    <strong className="text-[#ff4b72] text-base">{ticketDetails.seatId}</strong>
                  </div>
                  {ticketDetails.combos && ticketDetails.combos.length > 0 && (
                    <div className="flex justify-between items-center py-1 border-b border-emerald-500/20">
                      <span className="text-[#afa49b]">Bắp nước kèm:</span>
                      <strong className="text-white">
                        {ticketDetails.combos.map((c: any) => `${c.quantity}x ${c.name}`).join(', ')}
                      </strong>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleReset}
                className="w-full h-11 rounded-full bg-gradient-to-r from-[#ff4b72] to-[#ff6584] hover:opacity-95 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Quét Vé Tiếp Theo
              </Button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
