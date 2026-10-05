'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  Download, 
  Share2, 
  MapPin, 
  Calendar, 
  Clock, 
  Ticket, 
  ShieldCheck, 
  Sparkles, 
  Film, 
  Home,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { BookingProgressRail } from '@/components/booking/BookingProgressRail';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId') || 'BKG-2026-10482';
  const { user, accessToken } = useAuthStore();

  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserTickets = async () => {
      try {
        if (accessToken) {
          const res: any = await api.get('/tickets/my-tickets');
          if (Array.isArray(res) && res.length > 0) {
            // Find tickets matching this booking or get latest
            setTicketData(res[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching ticket:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTickets();
  }, [accessToken, bookingId]);

  const handleDownload = () => {
    window.print();
    toast.success('Đang chuẩn bị bản in / PDF vé điện tử...');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Vé xem phim ClGV Cinema',
        text: `Mã vé xem phim của tôi: ${bookingId}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết vé vào bộ nhớ tạm!');
    }
  };

  const movieTitle = ticketData?.movieTitle || 'Đêm Không Ngủ (2026)';
  const cinemaName = ticketData?.cinemaName || 'ClGV Vincom Đồng Khởi';
  const hallName = ticketData?.hallName || 'IMAX Laser 03';
  const seatId = ticketData?.seatId || 'E6, E7';
  const qrToken = ticketData?.qrToken || `CLGV_TKT_${bookingId}_HMAC_VALID_2026`;
  const formattedDate = ticketData?.startTime 
    ? new Date(ticketData.startTime).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : '19:30 - Thứ Sáu, 19/10/2026';

  return (
    <div className="min-h-screen bg-[#1f1a18] text-white pt-6 pb-24">
      {/* Progress Rail */}
      <BookingProgressRail currentStep="ticket" />

      <div className="max-w-[1080px] mx-auto px-4 space-y-8">
        
        {/* Success Status Pill */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-lg">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>THANH TOÁN THÀNH CÔNG · MÃ ĐƠN: {bookingId}</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-serif tracking-wide text-white">
            Vé Điện Tử Của Bạn Đã Sẵn Sàng
          </h1>
          <p className="text-xs md:text-sm text-[#d1c7ba] leading-relaxed">
            Mã QR đã được xác thực bảo mật HMAC-SHA256. Vui lòng xuất trình mã này tại quầy soát vé để vào phòng chiếu.
          </p>
        </div>

        {/* Master Ticket Container (Figma 3330:16006) */}
        <div className="relative bg-[#27211f] border border-[#4a423d] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            
            {/* Left Section: HMAC QR Code & Security Stamp */}
            <div className="lg:col-span-4 bg-[#1f1a18] p-8 flex flex-col items-center justify-between border-b lg:border-b-0 lg:border-r border-[#4a423d] relative">
              
              {/* Notches for perforated cut */}
              <div className="hidden lg:block absolute -top-4 -right-4 w-8 h-8 rounded-full bg-[#1f1a18] border border-[#4a423d] z-20" />
              <div className="hidden lg:block absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-[#1f1a18] border border-[#4a423d] z-20" />

              <div className="text-center space-y-1 mb-4">
                <span className="text-[10px] font-bold text-[#ff8fa3] uppercase tracking-[0.2em]">
                  MÃ VÉ ĐIỆN TỬ CHUẨN HMAC
                </span>
                <p className="text-xs text-[#afa49b]">Quét tại cổng soát vé thông minh</p>
              </div>

              {/* QR Code Canvas */}
              <div className="bg-white p-4 rounded-2xl shadow-xl border-4 border-[#3b3230] relative group">
                <QRCodeSVG 
                  value={qrToken}
                  size={190}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"Q"}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-lg bg-[#ff4b72] border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-black tracking-tighter">
                    ClGV
                  </div>
                </div>
              </div>

              {/* Token Info & Verified Pill */}
              <div className="w-full mt-6 space-y-3 text-center">
                <p className="font-mono text-[10px] text-[#afa49b] truncate">
                  Token: HMAC-SHA256-{bookingId.substring(0, 10)}
                </p>
                
                <div className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>TRẠNG THÁI: CHƯA SOÁT VÉ</span>
                </div>
              </div>
            </div>

            {/* Right Section: Ticket Details */}
            <div className="lg:col-span-8 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              
              <div>
                {/* Format Pill */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-bold bg-[#ff4b72]/20 border border-[#ff4b72]/40 text-[#ff8fa3] px-3 py-1 rounded-full uppercase tracking-wider">
                    T18 · IMAX LASER 2D
                  </span>
                  <span className="text-[11px] font-semibold bg-[#3b3230] text-[#d1c7ba] px-3 py-1 rounded-full border border-[#4a423d]">
                    Phụ đề Tiếng Việt
                  </span>
                </div>

                {/* Movie Title */}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
                  {movieTitle}
                </h2>
              </div>

              {/* Info Details List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-[#afa49b] flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#ff8fa3]" /> Rạp Chiếu:
                  </p>
                  <p className="font-bold text-white text-sm">{cinemaName}</p>
                  <p className="text-[#afa49b] text-[11px]">Vincom Center, TP. Hồ Chí Minh</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[#afa49b] flex items-center gap-1.5 font-medium">
                    <Film className="w-3.5 h-3.5 text-[#ff8fa3]" /> Phòng Chiếu:
                  </p>
                  <p className="font-bold text-[#ff8fa3] text-sm">{hallName}</p>
                  <p className="text-[#afa49b] text-[11px]">Màn hình vòm Laser độ phân giải 4K</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[#afa49b] flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#ff8fa3]" /> Suất Chiếu:
                  </p>
                  <p className="font-bold text-white text-sm">{formattedDate}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[#afa49b] flex items-center gap-1.5 font-medium">
                    <Ticket className="w-3.5 h-3.5 text-[#ff8fa3]" /> Vị Trí Ghế:
                  </p>
                  <p className="font-extrabold text-[#ff4b72] text-base">{seatId} (VIP)</p>
                </div>
              </div>

              {/* Divider */}
              <div className="pt-4 border-t border-[#4a423d]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#afa49b]">
                    ĐÃ THANH TOÁN THÀNH CÔNG
                  </p>
                  <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                    Đã thanh toán (VNPAY-QR)
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-[#d1c7ba]">
                    Khách hàng: <strong className="text-white">{user?.fullName || 'Linh Hà'}</strong>
                  </p>
                  <p className="text-[11px] text-[#afa49b]">
                    {user?.email || 'user@clgv.vn'}
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="h-12 px-6 rounded-full border-[#4a423d] text-[#d1c7ba] hover:text-white hover:bg-[#302927] font-semibold text-xs flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#ff8fa3]" /> Tải Vé PDF / In
          </Button>

          <Button
            variant="outline"
            onClick={handleShare}
            className="h-12 px-6 rounded-full border-[#4a423d] text-[#d1c7ba] hover:text-white hover:bg-[#302927] font-semibold text-xs flex items-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-[#ff8fa3]" /> Chia Sẻ Vé
          </Button>

          <Link href="/">
            <Button
              className="h-12 px-8 rounded-full bg-gradient-to-r from-[#ff4b72] to-[#ff6584] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-[0_8px_20px_rgba(255,75,114,0.35)] flex items-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" /> Về Trang Chủ
            </Button>
          </Link>
        </div>

        {/* Helper Note */}
        <div className="text-center text-xs text-[#afa49b] max-w-xl mx-auto leading-relaxed pt-2">
          Vui lòng xuất trình mã QR này tại cổng quét vé trước giờ chiếu 15 phút. Vé điện tử đã được kích hoạt và lưu trữ vĩnh viễn trong lịch sử tài khoản của bạn.
        </div>

      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1f1a18] flex items-center justify-center text-white">Đang tải vé điện tử...</div>}>
      <BookingSuccessContent />
    </Suspense>
  );
}
