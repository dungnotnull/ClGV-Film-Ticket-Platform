"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/axios';
import { toast } from 'sonner';
import Link from 'next/link';
import { Film, Sparkles, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, router, redirectUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res: any = await api.post('/auth/login', { email, password });
      
      if (res.success) {
        const { user, accessToken, refreshToken } = res.data;
        setAuth(user, accessToken, refreshToken);
        toast.success(`Chào mừng trở lại, ${user.fullName}!`);
        router.push(redirectUrl);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 md:py-16">
      <div className="w-full max-w-[1180px] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* ─── Left Visual Side (Figma Auth Visual) ─── */}
        <div className="lg:col-span-6 relative flex flex-col justify-center space-y-8 p-4 lg:p-8">
          {/* Ambient Rose Light */}
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-[#ff4b72]/20 rounded-full blur-[90px] pointer-events-none -z-10" />

          {/* Kicker */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff8fa3]">
            <Sparkles className="w-4 h-4 text-[#ff6584]" />
            <span>CLGV MEMBERSHIP</span>
          </div>

          {/* Main Title (Oswald) */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white leading-[1.08]">
            MỖI TẤM VÉ<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-[#ff8fa3]">
              LÀ MỘT KÝ ỨC.
            </span>
          </h1>

          {/* Subcopy */}
          <p className="font-sans text-base text-[#d1c7ba] max-w-lg leading-relaxed">
            Lưu giữ trọn vẹn lịch sử xem phim, tích lũy điểm đổi vé & combo bắp nước, và trở lại đúng vị trí hàng ghế bạn yêu thích nhất.
          </p>

          {/* Benefits List */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center gap-3 text-sm text-[#faf8f5]/90">
              <div className="w-6 h-6 rounded-full bg-[#ff4b72]/20 border border-[#ff4b72]/40 flex items-center justify-center text-xs font-bold text-[#ff8fa3]">
                1
              </div>
              <span>Tích lũy từ 5% - 10% điểm thưởng cho mỗi đơn vé</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#faf8f5]/90">
              <div className="w-6 h-6 rounded-full bg-[#ff4b72]/20 border border-[#ff4b72]/40 flex items-center justify-center text-xs font-bold text-[#ff8fa3]">
                2
              </div>
              <span>Ưu tiên giữ chỗ các suất chiếu sớm IMAX & Special Event</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#faf8f5]/90">
              <div className="w-6 h-6 rounded-full bg-[#ff4b72]/20 border border-[#ff4b72]/40 flex items-center justify-center text-xs font-bold text-[#ff8fa3]">
                3
              </div>
              <span>Nhận mã QR vé điện tử tích hợp HMAC bảo mật chống làm giả</span>
            </div>
          </div>
        </div>

        {/* ─── Right Form Side (Figma Auth Panel) ─── */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-[480px] rounded-[28px] bg-[#27211f] border border-[#4a423d] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            {/* Header */}
            <div className="space-y-2 mb-8">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#faf8f5]">
                Chào mừng trở lại
              </h2>
              <p className="text-sm text-[#d1c7ba]">
                Đăng nhập để tiếp tục hành trình điện ảnh của bạn.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider text-[#d1c7ba]" htmlFor="email">
                  Địa chỉ Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="minhanh@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[52px] px-4 rounded-xl bg-[#302927] border border-[#4a423d] text-[#faf8f5] text-sm placeholder:text-[#afa49b]/50 focus:outline-none focus:border-[#ff4b72] focus:ring-1 focus:ring-[#ff4b72] transition-colors"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#d1c7ba]" htmlFor="password">
                    Mật khẩu
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#ff8fa3] hover:text-white transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[52px] px-4 rounded-xl bg-[#302927] border border-[#4a423d] text-[#faf8f5] text-sm placeholder:text-[#afa49b]/50 focus:outline-none focus:border-[#ff4b72] focus:ring-1 focus:ring-[#ff4b72] transition-colors"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[50px] rounded-xl bg-[#ff4b72] hover:bg-[#ff6584] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(255,75,114,0.3)] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer mt-6"
              >
                {loading ? (
                  <span>Đang xác thực...</span>
                ) : (
                  <>
                    <span>Đăng nhập ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Account Hint */}
              <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-[#afa49b] space-y-1">
                <p className="font-semibold text-[#d1c7ba]">Tài khoản mẫu dùng thử:</p>
                <div className="flex justify-between">
                  <span>Khách hàng: <code className="text-[#ff8fa3]">customer@clgv.vn</code> / <code className="text-[#ff8fa3]">Password123!</code></span>
                </div>
                <div className="flex justify-between">
                  <span>Quản trị viên: <code className="text-[#ff8fa3]">admin@clgv.vn</code> / <code className="text-[#ff8fa3]">Password123!</code></span>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center pt-2 text-sm text-[#afa49b]">
                Chưa có tài khoản?{' '}
                <Link href="/register" className="font-semibold text-[#ff8fa3] hover:text-white transition-colors">
                  Đăng ký thành viên
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
