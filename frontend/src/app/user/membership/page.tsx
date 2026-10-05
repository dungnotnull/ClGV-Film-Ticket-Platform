'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Award, Gift, History, Sparkles, CheckCircle2, ChevronRight, Crown, Star } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIERS = [
  {
    name: 'ROSE MEMBER',
    badgeColor: 'text-[#ff8fa3] bg-[#ff4b72]/10 border-[#ff4b72]/30',
    minPoints: '0',
    benefits: ['Tích điểm 5% mọi đơn hàng', 'Ưu đãi sinh nhật', 'Đặt vé trực tuyến 24/7'],
    current: true,
  },
  {
    name: 'SILVER',
    badgeColor: 'text-zinc-300 bg-zinc-500/10 border-zinc-500/30',
    minPoints: '1.000',
    benefits: ['Tích điểm 7% mọi đơn hàng', 'Tặng 01 vé 2D sinh nhật', 'Giảm 10% bắp nước'],
    current: false,
  },
  {
    name: 'GOLD VIP',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    minPoints: '2.000',
    benefits: ['Tích điểm 10% mọi đơn hàng', 'Tặng 02 vé 2D + Combo', 'Lối đi ưu tiên tại rạp'],
    current: false,
  },
  {
    name: 'DIAMOND VVIP',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    minPoints: '4.000',
    benefits: ['Tích điểm 12% mọi đơn hàng', 'Phòng chờ VIP Lounge', 'Vé xem Premiere ra mắt phim'],
    current: false,
  },
];

export default function MembershipPage() {
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [rewardType, setRewardType] = useState('TICKET_2D');
  const [pointsToRedeem, setPointsToRedeem] = useState('50');
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchHistory();
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    try {
      const res: any = await api.get('/membership/history');
      if (res.success || res.data) {
        setHistory(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch membership history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    const cost = parseInt(pointsToRedeem);
    if ((user?.points || 1280) < cost) {
      toast.error('Số điểm tích lũy hiện tại không đủ để đổi quà này');
      return;
    }

    setIsRedeeming(true);
    try {
      const res: any = await api.post('/membership/redeem', {
        rewardType,
        pointsToRedeem: cost
      });
      if (res.success || res.data) {
        toast.success('Đổi quà thành công! Quà tặng đã được lưu vào ví voucher của bạn.');
        const newPoints = Math.max(0, (user?.points || 1280) - cost);
        updateUser({ points: newPoints });
        fetchHistory();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Có lỗi xảy ra khi đổi điểm');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-10 h-10 border-3 border-[#ff4b72] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#d1c7ba]">Đang tải thông tin thành viên...</p>
      </div>
    );
  }

  const currentPoints = user?.points || 1280;

  return (
    <div className="space-y-8">
      {/* Title Section (Figma 3274:13846) */}
      <div>
        <p className="text-xs font-bold text-[#ff8fa3] uppercase tracking-[0.2em] mb-1">
          HẠNG THÀNH VIÊN
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif tracking-wide text-white uppercase font-bold">
          Thành Viên & Điểm Thưởng ClGV
        </h1>
        <p className="text-xs sm:text-sm text-[#d1c7ba] mt-1.5">
          Tích điểm trên từng chi tiêu vé xem phim và đổi lấy quà tặng điện ảnh hấp dẫn.
        </p>
      </div>

      {/* 4-Column Tier Progression Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`p-5 rounded-2xl border transition-all ${
              tier.current
                ? 'bg-[#302927] border-[#ff4b72] shadow-[0_0_20px_rgba(255,75,114,0.25)] ring-1 ring-[#ff4b72]'
                : 'bg-[#1f1a18] border-[#4a423d] opacity-80'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${tier.badgeColor}`}>
                {tier.name}
              </span>
              {tier.current && (
                <span className="text-[10px] font-bold text-[#ff4b72] bg-[#ff4b72]/10 px-2 py-0.5 rounded-full">
                  HẠNG HIỆN TẠI
                </span>
              )}
            </div>

            <p className="text-xs text-[#afa49b]">Yêu cầu: từ <strong className="text-white">{tier.minPoints} pts</strong></p>

            <ul className="mt-4 space-y-2 text-[11px] text-[#d1c7ba]">
              {tier.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ff8fa3] shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Redeem & History 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Redeem Gifts (Đổi Quà) */}
        <div className="lg:col-span-6 bg-[#1f1a18] border border-[#4a423d] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#4a423d]">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#ff4b72]" /> Đổi Quà Thưởng (Redeem)
            </h2>
            <div className="text-right">
              <span className="text-xs text-[#afa49b]">Điểm của bạn:</span>{' '}
              <strong className="text-[#ff4b72] text-sm">{currentPoints.toLocaleString('vi-VN')} pts</strong>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#afa49b] uppercase tracking-wider">
                Chọn loại quà muốn đổi
              </label>
              <Select value={rewardType} onValueChange={(val) => setRewardType(val || 'TICKET_2D')}>
                <SelectTrigger className="bg-[#27211f] border-[#4a423d] text-white h-12 rounded-xl">
                  <SelectValue placeholder="Chọn loại quà" />
                </SelectTrigger>
                <SelectContent className="bg-[#27211f] border-[#4a423d] text-white">
                  <SelectItem value="TICKET_2D">🎟 01 Vé Xem Phim 2D Tiêu Chuẩn (100 pts)</SelectItem>
                  <SelectItem value="POPCORN_COMBO">🍿 01 Combo Bắp & Nước Ngọt Lớn (50 pts)</SelectItem>
                  <SelectItem value="DISCOUNT_VOUCHER_50K">🏷 Voucher Giảm Giá 50.000 ₫ (30 pts)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#afa49b] uppercase tracking-wider">
                Mức điểm sử dụng
              </label>
              <Select value={pointsToRedeem} onValueChange={(val) => setPointsToRedeem(val || '100')}>
                <SelectTrigger className="bg-[#27211f] border-[#4a423d] text-white h-12 rounded-xl">
                  <SelectValue placeholder="Số điểm" />
                </SelectTrigger>
                <SelectContent className="bg-[#27211f] border-[#4a423d] text-white">
                  <SelectItem value="30">30 Điểm (Voucher 50K)</SelectItem>
                  <SelectItem value="50">50 Điểm (Combo Bắp Nước)</SelectItem>
                  <SelectItem value="100">100 Điểm (Vé 2D)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleRedeem}
              disabled={isRedeeming || currentPoints < parseInt(pointsToRedeem)}
              className="w-full h-12 rounded-full bg-gradient-to-r from-[#ff4b72] to-[#ff6584] hover:opacity-95 text-white font-bold text-sm shadow-[0_8px_20px_rgba(255,75,114,0.35)] transition-all cursor-pointer mt-2"
            >
              {isRedeeming ? 'Đang xử lý đổi điểm...' : 'Xác Nhận Đổi Điểm Ngay'}
            </Button>
          </div>
        </div>

        {/* Right Column: Points History */}
        <div className="lg:col-span-6 bg-[#1f1a18] border border-[#4a423d] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#4a423d]">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-[#ff4b72]" /> Lịch Sử Điểm Thưởng
            </h2>
            <span className="text-xs text-[#afa49b]">Gần đây</span>
          </div>

          <div className="space-y-3">
            {history.length > 0 ? (
              history.map((record: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-[#27211f] border border-[#4a423d]/60 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-white">{record.reason || 'Tích điểm đặt vé xem phim'}</p>
                    <p className="text-[10px] text-[#afa49b] mt-0.5">
                      {record.createdAt ? format(new Date(record.createdAt), 'dd/MM/yyyy HH:mm') : 'Gần đây'}
                    </p>
                  </div>

                  <div className={`font-extrabold text-sm ${record.pointsChanged > 0 ? 'text-emerald-400' : 'text-[#ff4b72]'}`}>
                    {record.pointsChanged > 0 ? '+' : ''}{record.pointsChanged || 50} pts
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-2.5">
                <div className="p-3 bg-[#27211f] border border-[#4a423d]/60 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">Tích điểm đặt vé "Đêm Không Ngủ"</p>
                    <p className="text-[10px] text-[#afa49b]">Hôm nay, 14:20</p>
                  </div>
                  <span className="font-bold text-emerald-400 text-sm">+50 pts</span>
                </div>
                <div className="p-3 bg-[#27211f] border border-[#4a423d]/60 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">Thưởng đăng ký hội viên mới</p>
                    <p className="text-[10px] text-[#afa49b]">Tháng trước</p>
                  </div>
                  <span className="font-bold text-emerald-400 text-sm">+200 pts</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
