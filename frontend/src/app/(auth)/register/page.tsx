"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/axios';
import { toast } from 'sonner';
import Link from 'next/link';
import { Film, Sparkles, ArrowRight, Gift, CreditCard, Star } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast.error('Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật.');
      return;
    }

    try {
      setLoading(true);
      const res: any = await api.post('/auth/register', formData);
      
      if (res.success) {
        const { user, accessToken, refreshToken } = res.data;
        setAuth(user, accessToken, refreshToken);
        toast.success('Đăng ký tài khoản và cấp thẻ ClGV thành công!');
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 md:py-16">
      <div className="w-full max-w-[1180px] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* ─── Left Visual Side (Figma Register Visual) ─── */}
        <div className="lg:col-span-6 relative flex flex-col justify-center space-y-8 p-4 lg:p-8">
          {/* Ambient Rose Light */}
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-[#ff4b72]/20 rounded-full blur-[90px] pointer-events-none -z-10" />

          {/* Kicker */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff8fa3]">
            <Sparkles className="w-4 h-4 text-[#ff6584]" />
            <span>THÀNH VIÊN CLGV CINEMA</span>
          </div>

          {/* Main Title (Oswald) */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white leading-[1.08]">
            MỞ RA TRẢI NGHIỆM<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-[#ff8fa3]">
              ĐIỆN ẢNH ĐỈNH CAO.
            </span>
          </h1>

          {/* Subcopy */}
          <p className="font-sans text-base text-[#d1c7ba] max-w-lg leading-relaxed">
            Gia nhập câu lạc bộ điện ảnh ClGV, nhận ngay thẻ hội viên điện tử tích điểm và mở khóa hàng loạt ưu đãi độc quyền.
          </p>

          {/* Member Privileges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <Gift className="w-5 h-5 text-[#ff6584] mb-2" />
              <h4 className="text-sm font-semibold text-white">Quà tặng sinh nhật</h4>
              <p className="text-xs text-[#afa49b]">Tặng 01 vé xem phim 2D & combo bắp nước miễn phí</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <CreditCard className="w-5 h-5 text-[#ff8fa3] mb-2" />
              <h4 className="text-sm font-semibold text-white">Thẻ ClGV Member</h4>
              <p className="text-xs text-[#afa49b]">Tích lũy điểm tiêu chuẩn, thăng hạng VIP/VVIP</p>
            </div>
          </div>
        </div>

        {/* ─── Right Form Side (Figma Register Panel) ─── */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-[500px] rounded-[28px] bg-[#27211f] border border-[#4a423d] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            {/* Header */}
            <div className="space-y-2 mb-6">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#faf8f5]">
                Đăng ký tài khoản
              </h2>
              <p className="text-sm text-[#d1c7ba]">
                Điền thông tin để đăng ký tài khoản và nhận ưu đãi ngay hôm nay.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Họ và tên */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider text-[#d1c7ba]" htmlFor="fullName">
                  Họ và tên
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full h-[50px] px-4 rounded-xl bg-[#302927] border border-[#4a423d] text-[#faf8f5] text-sm placeholder:text-[#afa49b]/50 focus:outline-none focus:border-[#ff4b72] focus:ring-1 focus:ring-[#ff4b72] transition-colors"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider text-[#d1c7ba]" htmlFor="email">
                  Địa chỉ Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-[50px] px-4 rounded-xl bg-[#302927] border border-[#4a423d] text-[#faf8f5] text-sm placeholder:text-[#afa49b]/50 focus:outline-none focus:border-[#ff4b72] focus:ring-1 focus:ring-[#ff4b72] transition-colors"
                />
              </div>

              {/* Số điện thoại */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider text-[#d1c7ba]" htmlFor="phone">
                  Số điện thoại
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full h-[50px] px-4 rounded-xl bg-[#302927] border border-[#4a423d] text-[#faf8f5] text-sm placeholder:text-[#afa49b]/50 focus:outline-none focus:border-[#ff4b72] focus:ring-1 focus:ring-[#ff4b72] transition-colors"
                />
              </div>

              {/* Mật khẩu */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider text-[#d1c7ba]" htmlFor="password">
                  Mật khẩu
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-[50px] px-4 rounded-xl bg-[#302927] border border-[#4a423d] text-[#faf8f5] text-sm placeholder:text-[#afa49b]/50 focus:outline-none focus:border-[#ff4b72] focus:ring-1 focus:ring-[#ff4b72] transition-colors"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-1 text-xs text-[#afa49b]">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#4a423d] text-[#ff4b72] focus:ring-[#ff4b72]"
                />
                <label htmlFor="terms" className="cursor-pointer leading-relaxed">
                  Tôi đồng ý với{' '}
                  <Link href="/terms" className="text-[#ff8fa3] hover:underline">
                    Điều khoản sử dụng
                  </Link>{' '}
                  và{' '}
                  <Link href="/privacy" className="text-[#ff8fa3] hover:underline">
                    Chính sách bảo mật
                  </Link>{' '}
                  của ClGV Cinema.
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[50px] rounded-xl bg-[#ff4b72] hover:bg-[#ff6584] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(255,75,114,0.3)] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer mt-4"
              >
                {loading ? (
                  <span>Đang xử lý đăng ký...</span>
                ) : (
                  <>
                    <span>Đăng ký thành viên</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="text-center pt-2 text-sm text-[#afa49b]">
                Đã có tài khoản?{' '}
                <Link href="/login" className="font-semibold text-[#ff8fa3] hover:text-white transition-colors">
                  Đăng nhập tại đây
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
