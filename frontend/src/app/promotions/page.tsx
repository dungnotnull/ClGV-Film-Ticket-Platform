'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Tag, 
  Ticket, 
  Sparkles, 
  Copy, 
  Check, 
  Gift, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Percent, 
  Award,
  Zap,
  ExternalLink,
  Wallet
} from 'lucide-react';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Voucher {
  id: string;
  code: string;
  title: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  expiresAt: string;
  status: string;
  isClaimed?: boolean;
}

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder: number;
  status: string;
}

const DEFAULT_VOUCHERS: Voucher[] = [
  {
    id: 'demo-1',
    code: 'CLGVWELCOME',
    title: 'Giảm 50.000đ cho khách hàng mới',
    discountType: 'FIXED_AMOUNT',
    discountValue: 50000,
    minOrderValue: 120000,
    expiresAt: '2026-12-31T23:59:59.000Z',
    status: 'ACTIVE',
    isClaimed: false,
  },
  {
    id: 'demo-2',
    code: 'MIDNIGHT20',
    title: 'Giảm 20% các suất chiếu sau 21h00',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderValue: 100000,
    maxDiscountAmount: 40000,
    expiresAt: '2026-11-30T23:59:59.000Z',
    status: 'ACTIVE',
    isClaimed: false,
  },
  {
    id: 'demo-3',
    code: 'POPCORNFREE',
    title: 'Giảm 30.000đ khi mua kèm Combo Bắp Nước',
    discountType: 'FIXED_AMOUNT',
    discountValue: 30000,
    minOrderValue: 150000,
    expiresAt: '2026-10-31T23:59:59.000Z',
    status: 'ACTIVE',
    isClaimed: false,
  },
  {
    id: 'demo-4',
    code: 'VIPWEEKEND',
    title: 'Ưu đãi cuối tuần giảm 15% vé IMAX & Gold Class',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minOrderValue: 200000,
    maxDiscountAmount: 60000,
    expiresAt: '2026-12-15T23:59:59.000Z',
    status: 'ACTIVE',
    isClaimed: false,
  },
];

const MEMBER_PERKS = [
  {
    icon: Zap,
    title: 'Thứ Tư Vui Vẻ - Đồng Giá 65.000đ',
    badge: 'MỖI TUẦN',
    desc: 'Áp dụng cho mọi suất chiếu 2D tiêu chuẩn vào mỗi thứ 4 hàng tuần cho thành viên ClGV.',
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
  },
  {
    icon: Award,
    title: 'Đặc Quyền Học Sinh / Sinh Viên U22',
    badge: 'U22 EXCLUSIVE',
    desc: 'Giá vé đồng giá chỉ 55.000đ từ Thứ 2 đến Thứ 6. Tích lũy điểm x2 khi mua combo F&B.',
    color: 'from-[#ff4b72]/20 to-[#ff8fa3]/10 border-[#ff4b72]/30 text-[#ff8fa3]',
  },
  {
    icon: Gift,
    title: 'Quà Tặng Sinh Nhật Thành Viên',
    badge: 'BIRTHDAY GIFT',
    desc: 'Tặng ngay 01 vé 2D miễn phí + 01 phần Bắp nước ngọt ngào trong tháng sinh nhật của bạn.',
    color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400',
  },
];

export default function PromotionsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'ALL' | 'VOUCHERS' | 'PERKS'>('ALL');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const [customCode, setCustomCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vouchersRes, bannersRes] = await Promise.allSettled([
        api.get('/vouchers/available'),
        api.get('/banners'),
      ]);

      if (vouchersRes.status === 'fulfilled' && vouchersRes.value.data) {
        const rawVouchers = vouchersRes.value.data;
        const list = Array.isArray(rawVouchers) ? rawVouchers : (rawVouchers.data || []);
        if (list.length > 0) {
          setVouchers(list);
        } else {
          setVouchers(DEFAULT_VOUCHERS);
        }
      } else {
        setVouchers(DEFAULT_VOUCHERS);
      }

      if (bannersRes.status === 'fulfilled' && bannersRes.value.data) {
        const rawBanners = bannersRes.value.data;
        const list = Array.isArray(rawBanners) ? rawBanners : (rawBanners.data || []);
        setBanners(list);
      }
    } catch {
      setVouchers(DEFAULT_VOUCHERS);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã ${code} vào bộ nhớ tạm!`);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const handleClaimVoucher = async (voucher: Voucher) => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để lưu mã ưu đãi vào ví của bạn');
      router.push(`/login?redirect=/promotions`);
      return;
    }

    if (voucher.isClaimed) {
      toast.info('Mã ưu đãi này đã có sẵn trong ví của bạn');
      return;
    }

    setClaimingId(voucher.id);
    try {
      const res = await api.post('/vouchers/claim', { code: voucher.code });
      if (res.status === 200 || res.status === 201) {
        toast.success(`Đã lưu thành công mã ${voucher.code} vào ví!`);
        setVouchers((prev) =>
          prev.map((v) => (v.id === voucher.id ? { ...v, isClaimed: true } : v))
        );
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error?.message || 'Không thể lưu mã vào ví';
      toast.error(message);
    } finally {
      setClaimingId(null);
    }
  };

  const handleClaimCustomCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCode.trim()) return;

    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để lưu mã ưu đãi');
      router.push(`/login?redirect=/promotions`);
      return;
    }

    setIsSubmittingCustom(true);
    try {
      const cleanCode = customCode.trim().toUpperCase();
      const res = await api.post('/vouchers/claim', { code: cleanCode });
      if (res.status === 200 || res.status === 201) {
        toast.success(`Đã lưu mã ${cleanCode} vào ví cá nhân thành công!`);
        setCustomCode('');
        fetchData();
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error?.message || 'Mã ưu đãi không hợp lệ hoặc đã hết hạn';
      toast.error(message);
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#14100e] text-[#faf8f5] pb-24">
      {/* ─── 1. HERO HEADER ─── */}
      <section className="relative pt-16 pb-14 px-4 text-center overflow-hidden border-b border-[#2d2623]">
        {/* Glow ambient background spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[280px] bg-[#ff4b72]/15 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-[1060px] mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#ff8fa3]" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#faf8f5]">
              CLGV REWARDS & PRIVILEGES
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-[#faf8f5] font-normal tracking-wide">
            Ưu Đãi & Đặc Quyền Điện Ảnh
          </h1>

          <p className="font-sans text-xs sm:text-sm text-[#d1c7ba] max-w-xl mx-auto leading-relaxed">
            Khám phá các mã giảm giá vé, combo bắp nước độc quyền và chương trình thành viên hấp dẫn chỉ có tại cụm rạp ClGV Cinema.
          </p>

          {/* Quick claim custom voucher input */}
          <form 
            onSubmit={handleClaimCustomCode}
            className="max-w-md mx-auto pt-3 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#afa49b]" />
              <Input
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="Nhập mã ưu đãi của bạn..."
                className="pl-10 h-10 bg-[#1f1a18] border-[#4a423d] text-white text-xs sm:text-sm placeholder:text-[#8c827a] rounded-xl focus-visible:ring-1 focus-visible:ring-[#ff4b72]"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmittingCustom || !customCode.trim()}
              className="h-10 px-4 bg-gradient-to-r from-[#ff4b72] to-[#e61e4d] hover:brightness-110 text-white font-medium text-xs sm:text-sm rounded-xl shrink-0 transition-all shadow-[0_4px_16px_rgba(255,75,114,0.35)]"
            >
              {isSubmittingCustom ? 'Đang lưu...' : 'Lưu Vào Ví'}
            </Button>
          </form>
        </div>
      </section>

      {/* ─── 2. MAIN CONTAINER ─── */}
      <div className="max-w-[1180px] mx-auto px-4 pt-10 space-y-12">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#2d2623] pb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'ALL'
                  ? 'bg-[#ff4b72] text-white shadow-[0_4px_12px_rgba(255,75,114,0.3)]'
                  : 'bg-[#1f1a18] text-[#d1c7ba] hover:text-white border border-[#38302c]'
              }`}
            >
              Tất Cả Ưu Đãi
            </button>
            <button
              onClick={() => setActiveTab('VOUCHERS')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'VOUCHERS'
                  ? 'bg-[#ff4b72] text-white shadow-[0_4px_12px_rgba(255,75,114,0.3)]'
                  : 'bg-[#1f1a18] text-[#d1c7ba] hover:text-white border border-[#38302c]'
              }`}
            >
              Mã Giảm Giá Vé
            </button>
            <button
              onClick={() => setActiveTab('PERKS')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'PERKS'
                  ? 'bg-[#ff4b72] text-white shadow-[0_4px_12px_rgba(255,75,114,0.3)]'
                  : 'bg-[#1f1a18] text-[#d1c7ba] hover:text-white border border-[#38302c]'
              }`}
            >
              Đặc Quyền Hội Viên
            </button>
          </div>

          {/* Quick link to user wallet */}
          {isAuthenticated && (
            <Link
              href="/user"
              className="inline-flex items-center gap-1.5 text-xs text-[#ff8fa3] hover:underline font-medium"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Xem ví của bạn</span>
            </Link>
          )}
        </div>

        {/* ─── 3. FEATURED EVENT BANNERS (IF AVAILABLE) ─── */}
        {banners.length > 0 && activeTab !== 'PERKS' && (
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-serif font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff4b72]" />
              Sự Kiện Điện Ảnh Nổi Bật
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.slice(0, 2).map((banner) => (
                <div
                  key={banner.id}
                  className="relative group rounded-2xl overflow-hidden border border-[#3d3430] bg-[#1a1513] shadow-xl hover:border-[#ff4b72]/40 transition-all"
                >
                  <div className="relative aspect-[21/9] w-full bg-[#27211f]">
                    {banner.imageUrl ? (
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#8c827a]">
                        ClGV Special Event
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff8fa3] px-2 py-0.5 rounded bg-black/60 border border-white/10">
                          SỰ KIỆN HOT
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-white mt-1 drop-shadow-md">
                          {banner.title}
                        </h3>
                      </div>
                      <Link
                        href={banner.linkUrl || '/booking/showtimes'}
                        className="p-2 rounded-xl bg-white/10 hover:bg-[#ff4b72] backdrop-blur-md border border-white/20 text-white transition-all"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── 4. VOUCHER CARDS GRID ─── */}
        {(activeTab === 'ALL' || activeTab === 'VOUCHERS') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-serif font-semibold text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#ff4b72]" />
                Mã Giảm Giá Sẵn Sàng Áp Dụng
              </h2>
              <span className="text-xs text-[#afa49b]">
                {vouchers.length} mã khả dụng
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vouchers.map((voucher) => {
                const isClaimed = voucher.isClaimed;
                const isCopied = copiedCode === voucher.code;
                const isClaiming = claimingId === voucher.id;

                return (
                  <div
                    key={voucher.id}
                    className="relative bg-gradient-to-r from-[#221c19] to-[#1c1715] border border-[#3d3430] hover:border-[#ff4b72]/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all group overflow-hidden"
                  >
                    {/* Voucher notch circle decorators for ticket look */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#14100e] border-r border-[#3d3430]" />
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#14100e] border-l border-[#3d3430]" />

                    <div>
                      {/* Header info */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ff4b72]/10 border border-[#ff4b72]/30 text-[#ff8fa3] text-[10px] font-bold tracking-wider uppercase">
                            <Tag className="w-2.5 h-2.5" />
                            {voucher.discountType === 'PERCENTAGE'
                              ? `GIẢM ${voucher.discountValue}%`
                              : `GIẢM ${voucher.discountValue.toLocaleString('vi-VN')}Đ`}
                          </div>
                          <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-[#ff8fa3] transition-colors">
                            {voucher.title}
                          </h3>
                        </div>

                        {/* Status badge */}
                        {isClaimed && (
                          <span className="shrink-0 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            Đã Lưu Ví
                          </span>
                        )}
                      </div>

                      {/* Terms */}
                      <div className="text-xs text-[#afa49b] space-y-1 mb-4">
                        <p className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#8c827a]" />
                          Đơn tối thiểu: <span className="text-[#d1c7ba] font-medium">{voucher.minOrderValue.toLocaleString('vi-VN')}đ</span>
                          {voucher.maxDiscountAmount && (
                            <> · Tối đa: <span className="text-[#d1c7ba] font-medium">{voucher.maxDiscountAmount.toLocaleString('vi-VN')}đ</span></>
                          )}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#8c827a]" />
                          Hạn dùng: <span className="text-[#d1c7ba] font-medium">
                            {voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-3 border-t border-[#332b27] flex items-center justify-between gap-3">
                      {/* Voucher Code Tag */}
                      <button
                        type="button"
                        onClick={() => handleCopyCode(voucher.code)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-dashed border-[#ff4b72]/40 hover:border-[#ff4b72] text-[#faf8f5] transition-all group/btn"
                        title="Bấm để sao chép mã"
                      >
                        <span className="font-mono font-bold text-xs tracking-wider text-[#ff8fa3]">
                          {voucher.code}
                        </span>
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#afa49b] group-hover/btn:text-white" />
                        )}
                      </button>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleClaimVoucher(voucher)}
                          disabled={isClaimed || isClaiming}
                          className="h-8 px-3 text-xs font-semibold rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#faf8f5] border border-white/10"
                        >
                          {isClaiming ? 'Đang lưu...' : isClaimed ? 'Đã trong ví' : 'Lưu Vào Ví'}
                        </Button>

                        <Link
                          href="/booking/showtimes"
                          className="inline-flex items-center gap-1 h-8 px-3 text-xs font-bold rounded-xl bg-[#ff4b72] hover:bg-[#e61e4d] text-white shadow-sm transition-all"
                        >
                          <span>Dùng ngay</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── 5. MEMBER PERKS & SPECIAL POLICIES ─── */}
        {(activeTab === 'ALL' || activeTab === 'PERKS') && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-serif font-semibold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-[#ff4b72]" />
                Đặc Quyền Thành Viên ClGV Cinema
              </h2>
              <Link
                href="/user/membership"
                className="text-xs text-[#ff8fa3] hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>Xem quyền lợi 4 hạng thẻ</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MEMBER_PERKS.map((perk, idx) => {
                const IconComponent = perk.icon;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl p-5 border bg-gradient-to-b ${perk.color} flex flex-col justify-between shadow-lg`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 border border-white/10">
                          {perk.badge}
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-sm sm:text-base leading-snug">
                        {perk.title}
                      </h3>

                      <p className="text-xs text-[#d1c7ba] leading-relaxed">
                        {perk.desc}
                      </p>
                    </div>

                    <div className="pt-4 mt-2">
                      <Link
                        href="/movies"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-[#ff8fa3] transition-colors"
                      >
                        <span>Đặt vé trải nghiệm</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── 6. FOOTER CTA / MEMBERSHIP REGISTRATION CALLOUT ─── */}
        <div className="rounded-3xl border border-[#4a423d] bg-gradient-to-r from-[#241c19] via-[#1f1a18] to-[#271d22] p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[11px] font-bold text-[#ff8fa3] tracking-widest uppercase">
              THÀNH VIÊN CLGV
            </span>
            <h3 className="text-xl sm:text-2xl font-serif text-white font-semibold">
              Chưa có tài khoản thành viên ClGV?
            </h3>
            <p className="text-xs sm:text-sm text-[#d1c7ba] max-w-xl">
              Đăng ký ngay hôm nay để nhận 1.000 điểm thưởng đầu tiên, tích điểm 5-12% trên từng giao dịch vé & combo, và nhận vé 2D miễn phí ngày sinh nhật!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <Link
                href="/user/membership"
                className="h-11 px-6 rounded-full bg-[#ff4b72] hover:bg-[#e61e4d] text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,75,114,0.4)] flex items-center justify-center transition-all"
              >
                Hạng Thành Viên Của Bạn
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="h-11 px-6 rounded-full bg-[#ff4b72] hover:bg-[#e61e4d] text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,75,114,0.4)] flex items-center justify-center transition-all"
                >
                  Đăng Ký Miễn Phí
                </Link>
                <Link
                  href="/login"
                  className="h-11 px-6 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-xs uppercase tracking-wider border border-white/10 flex items-center justify-center transition-all"
                >
                  Đăng Nhập
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
