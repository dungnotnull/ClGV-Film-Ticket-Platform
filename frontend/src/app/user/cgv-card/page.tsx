'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CreditCard, Wallet, ArrowUpRight, History, ShieldCheck, Sparkles, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function CGVCardPage() {
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [history, setHistory] = useState<any[]>([]);
  const [balance, setBalance] = useState(user?.cgvCardBalance || 520000);
  const [loading, setLoading] = useState(true);
  
  const [topupAmount, setTopupAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchBalanceAndHistory();
  }, [isAuthenticated]);

  const fetchBalanceAndHistory = async () => {
    try {
      const res: any = await api.get('/cgv-card/balance');
      if (res.success || res.data) {
        const bal = res.data?.balance ?? user?.cgvCardBalance ?? 520000;
        setBalance(bal);
        setHistory(res.data?.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch CGV Card info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async () => {
    const amount = parseInt(topupAmount.replace(/,/g, ''));
    if (!amount || amount < 50000) {
      toast.error('Số tiền nạp tối thiểu là 50.000 ₫');
      return;
    }

    setIsProcessing(true);
    try {
      const res: any = await api.post('/cgv-card/topup', {
        amount,
        paymentMethod: 'VNPAY',
      });
      if (res.success || res.data) {
        toast.success(`Nạp thành công ${amount.toLocaleString('vi-VN')} ₫ vào ví ClGV Card!`);
        setTopupAmount('');
        const newBalance = balance + amount;
        setBalance(newBalance);
        updateUser({ cgvCardBalance: newBalance });
        fetchBalanceAndHistory();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Có lỗi xảy ra khi nạp tiền');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickAmount = (amount: number) => {
    setTopupAmount(amount.toString());
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-10 h-10 border-3 border-[#ff4b72] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#d1c7ba]">Đang tải thông tin ví thẻ ClGV...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title Section (Figma 3274:13821) */}
      <div>
        <p className="text-xs font-bold text-[#ff8fa3] uppercase tracking-[0.2em] mb-1">
          VÍ THÀNH VIÊN
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif tracking-wide text-white uppercase font-bold">
          Thẻ ClGV & Số Dư Ví
        </h1>
        <p className="text-xs sm:text-sm text-[#d1c7ba] mt-1.5">
          Thanh toán nhanh, bảo mật 256-bit SSL, tích điểm tức thì mọi giao dịch.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Holographic ClGV Card & Topup */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Luxury ClGV Card (Figma 3274:13824) */}
          <div className="relative w-full aspect-[1.7/1] rounded-[28px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl bg-gradient-to-br from-[#ff4b72] via-[#d6284e] to-[#7f132e] border border-[#ff8fa3]/40">
            {/* Ambient bubble glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-xl pointer-events-none" />

            {/* Card Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="font-sans text-2xl sm:text-3xl font-black text-white tracking-wider">
                  ClGV
                </span>
                <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mt-0.5">
                  CINEMA MEMBERSHIP
                </p>
              </div>
              <span className="text-[11px] font-bold text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 tracking-wider uppercase">
                {user?.membershipTier || 'ROSE MEMBER'}
              </span>
            </div>

            {/* Card Balance */}
            <div className="relative z-10">
              <p className="text-[11px] text-white/80 font-medium uppercase tracking-wider">
                SỐ DƯ KHẢ DỤNG
              </p>
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-0.5">
                {balance.toLocaleString('vi-VN')} ₫
              </p>
            </div>

            {/* Card Footer */}
            <div className="relative z-10 flex items-center justify-between text-white/90 text-xs sm:text-sm font-mono tracking-widest">
              <span>•••• •••• •••• 1026</span>
              <span className="text-[11px] font-sans font-medium uppercase text-white/80">
                {user?.fullName || 'LINH HA'}
              </span>
            </div>
          </div>

          {/* Topup Form */}
          <div className="bg-[#1f1a18] border border-[#4a423d] rounded-2xl p-6 sm:p-8 space-y-5">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#ff4b72]" /> Nạp Tiền Vào Ví Thẻ
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#afa49b] uppercase tracking-wider">
                Nhập số tiền muốn nạp (VND)
              </label>
              <Input
                type="number"
                placeholder="VD: 100000"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                className="bg-[#27211f] border-[#4a423d] text-white h-12 rounded-xl focus:border-[#ff4b72]"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-2.5">
              {[50000, 100000, 200000, 500000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAmount(amt)}
                  className="px-4 py-2 bg-[#27211f] hover:bg-[#ff4b72] hover:text-white border border-[#4a423d] text-xs font-bold text-[#d1c7ba] rounded-full transition-colors cursor-pointer"
                >
                  +{(amt / 1000).toLocaleString('vi-VN')}K
                </button>
              ))}
            </div>

            <Button
              onClick={handleTopup}
              disabled={isProcessing || !topupAmount}
              className="w-full h-12 rounded-full bg-gradient-to-r from-[#ff4b72] to-[#ff6584] hover:opacity-95 text-white font-bold text-sm shadow-[0_8px_20px_rgba(255,75,114,0.35)] transition-all cursor-pointer"
            >
              {isProcessing ? 'Đang xử lý nạp tiền...' : 'Nạp Tiền Ngay Qua VNPAY'}
            </Button>
          </div>

        </div>

        {/* Right Column: Recent Transactions Activity (Figma 3274:13835) */}
        <div className="lg:col-span-5 bg-[#1f1a18] border border-[#4a423d] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#4a423d]">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-[#ff4b72]" /> Giao Dịch Gần Đây
            </h2>
            <span className="text-xs text-[#afa49b]">Tất cả</span>
          </div>

          <div className="space-y-3">
            {history.length > 0 ? (
              history.map((record: any, idx: number) => {
                const isDeposit = record.type === 'TOPUP';
                return (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#27211f] border border-[#4a423d]/60 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isDeposit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#ff4b72]/10 text-[#ff4b72]'
                      }`}>
                        {isDeposit ? <ArrowUpRight className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-white">
                          {record.description || (isDeposit ? 'Nạp tiền vào ví ClGV' : 'Thanh toán vé xem phim')}
                        </p>
                        <p className="text-[10px] text-[#afa49b] mt-0.5">
                          {record.createdAt ? format(new Date(record.createdAt), 'dd/MM/yyyy HH:mm') : 'Gần đây'}
                        </p>
                      </div>
                    </div>

                    <div className={`font-extrabold text-sm ${isDeposit ? 'text-emerald-400' : 'text-white'}`}>
                      {isDeposit ? '+' : '-'}{Number(record.amount).toLocaleString('vi-VN')} ₫
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-[#afa49b] space-y-2">
                <CreditCard className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs">Chưa có phát sinh giao dịch nào.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
