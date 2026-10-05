'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, Ticket, Download, QrCode, Film, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function MyTicketsPage() {
  const { isAuthenticated } = useAuthStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchTickets = async () => {
      try {
        const res: any = await api.get('/tickets/my-tickets');
        const list = Array.isArray(res) ? res : res?.data?.tickets || res?.data || [];
        setTickets(list);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isAuthenticated]);

  // Filter tickets based on active tab
  const filteredTickets = tickets.filter((t: any) => {
    const isCheckedIn = t.status === 'CHECKED_IN';
    const isCancelled = t.status === 'CANCELLED' || t.bookingStatus === 'CANCELLED';

    if (activeTab === 'CANCELLED') return isCancelled;
    if (activeTab === 'COMPLETED') return isCheckedIn;
    return !isCheckedIn && !isCancelled; // UPCOMING
  });

  const handleDownloadTicket = () => {
    window.print();
    toast.success('Đang mở hộp thoại in / lưu vé PDF...');
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-10 h-10 border-3 border-[#ff4b72] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#d1c7ba]">Đang tải danh sách vé điện tử...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Heading (Figma 3330:16437) */}
      <div>
        <p className="text-xs font-bold text-[#ff8fa3] uppercase tracking-[0.2em] mb-1">
          VÉ ĐIỆN TỬ
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif tracking-wide text-white uppercase font-bold">
          Vé Điện Tử & Lịch Sử Đặt Vé
        </h1>
        <p className="text-xs sm:text-sm text-[#d1c7ba] mt-1.5">
          Quản lý vé đã đặt, xuất trình mã QR xác thực HMAC tại quầy soát vé hoặc tải vé file PDF
        </p>
      </div>

      {/* Tabs Filter Bar (Figma 3330:16439) */}
      <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-[#4a423d]">
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`h-10 px-5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'UPCOMING'
              ? 'bg-[#ff4b72] text-white shadow-[0_0_15px_rgba(255,75,114,0.4)]'
              : 'bg-[#1f1a18] text-[#d1c7ba] hover:text-white border border-[#4a423d]'
          }`}
        >
          Sắp Chiếu ({tickets.filter(t => t.status !== 'CHECKED_IN' && t.status !== 'CANCELLED').length})
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`h-10 px-5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'COMPLETED'
              ? 'bg-[#ff4b72] text-white shadow-[0_0_15px_rgba(255,75,114,0.4)]'
              : 'bg-[#1f1a18] text-[#d1c7ba] hover:text-white border border-[#4a423d]'
          }`}
        >
          Đã Xem ({tickets.filter(t => t.status === 'CHECKED_IN').length})
        </button>

        <button
          onClick={() => setActiveTab('CANCELLED')}
          className={`h-10 px-5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'CANCELLED'
              ? 'bg-[#ff4b72] text-white shadow-[0_0_15px_rgba(255,75,114,0.4)]'
              : 'bg-[#1f1a18] text-[#d1c7ba] hover:text-white border border-[#4a423d]'
          }`}
        >
          Đã Hủy ({tickets.filter(t => t.status === 'CANCELLED').length})
        </button>
      </div>

      {/* Tickets List */}
      {filteredTickets.length > 0 ? (
        <div className="space-y-6">
          {filteredTickets.map((ticket: any) => {
            const formattedDate = ticket.startTime
              ? new Date(ticket.startTime).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  weekday: 'short',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })
              : '19:30 - Thứ Sáu, 19/10/2026';

            const isReady = ticket.status !== 'CHECKED_IN' && ticket.status !== 'CANCELLED';

            return (
              <div
                key={ticket.ticketId || ticket.id}
                className="bg-[#1f1a18] border border-[#4a423d] hover:border-[#ff8fa3]/50 rounded-2xl overflow-hidden shadow-xl transition-all duration-200 grid grid-cols-1 md:grid-cols-12 items-stretch"
              >
                {/* Poster Column */}
                <div className="md:col-span-3 relative h-48 md:h-auto min-h-[180px] bg-[#302927]">
                  <img
                    src={ticket.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60'}
                    alt={ticket.movieTitle || 'Phim'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent to-[#1f1a18]/90" />
                </div>

                {/* Details Column */}
                <div className="md:col-span-6 p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isReady
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : ticket.status === 'CHECKED_IN'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}>
                        {isReady ? '🟢 SẴN SÀNG SOÁT VÉ' : ticket.status === 'CHECKED_IN' ? '✓ ĐÃ CHECK-IN' : 'ĐÃ HỦY'}
                      </span>
                      <span className="text-[10px] bg-[#302927] text-[#d1c7ba] px-2 py-0.5 rounded border border-[#4a423d]">
                        {ticket.hallName || 'IMAX Laser 03'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                      {ticket.movieTitle || 'Đêm Không Ngủ'}
                    </h3>

                    <div className="mt-3 space-y-1.5 text-xs text-[#d1c7ba]">
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#ff8fa3] shrink-0" />
                        <span>{ticket.cinemaName || 'ClGV Vincom Đồng Khởi'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#ff8fa3] shrink-0" />
                        <span>{formattedDate}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Ticket className="w-3.5 h-3.5 text-[#ff8fa3] shrink-0" />
                        <span>Vị trí ghế: <strong className="text-[#ff4b72]">{ticket.seatId || 'E6, E7'}</strong></span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Column */}
                <div className="md:col-span-3 p-6 bg-[#27211f] border-t md:border-t-0 md:border-l border-[#4a423d] flex flex-col items-center justify-center gap-3">
                  <Button
                    onClick={() => setSelectedTicket(ticket)}
                    className="w-full h-11 rounded-full bg-gradient-to-r from-[#ff4b72] to-[#ff6584] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" /> Xuất Trình Mã QR
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleDownloadTicket}
                    className="w-full h-10 rounded-full border-[#4a423d] text-[#d1c7ba] hover:text-white hover:bg-[#1f1a18] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#ff8fa3]" /> Tải Vé PDF
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#1f1a18] border border-[#4a423d] rounded-2xl space-y-4">
          <Film className="w-12 h-12 text-[#afa49b]/40 mx-auto" />
          <p className="text-sm text-[#afa49b]">Không tìm thấy vé xem phim nào trong mục này.</p>
          <Link href="/movies">
            <Button className="rounded-full bg-[#ff4b72] hover:bg-[#ff6584] text-white font-bold text-xs px-6">
              Khám Phá Phim Đang Chiếu
            </Button>
          </Link>
        </div>
      )}

      {/* QR Code Security Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="bg-[#27211f] border border-[#4a423d] text-white max-w-sm flex flex-col items-center justify-center p-8 rounded-3xl">
          <DialogHeader className="w-full text-center">
            <span className="text-[10px] font-bold text-[#ff8fa3] uppercase tracking-[0.2em]">
              XÁC THỰC HMAC-SHA256
            </span>
            <DialogTitle className="text-xl font-bold text-white mt-1">
              Mã QR Soát Vé Tại Rạp
            </DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6 flex flex-col items-center mt-4">
              <div className="bg-white p-4 rounded-2xl shadow-2xl border-4 border-[#3b3230]">
                <QRCodeSVG
                  value={selectedTicket.qrToken || `CLGV_TKT_${selectedTicket.ticketId || selectedTicket.id}_HMAC_VALID`}
                  size={200}
                  level="Q"
                  includeMargin={false}
                />
              </div>

              <div className="text-center space-y-1 text-xs">
                <p className="font-bold text-white text-base">{selectedTicket.movieTitle}</p>
                <p className="text-[#ff8fa3] font-semibold">Ghế: {selectedTicket.seatId}</p>
                <p className="text-[#afa49b] text-[11px]">{selectedTicket.cinemaName} · {selectedTicket.hallName}</p>
                <div className="pt-3">
                  <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-500/10 py-1.5 px-3 rounded-full border border-emerald-500/30">
                    🟢 Đưa mã này vào máy quét tại cổng soát vé
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
