"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { KeyRound, Sparkles, ArrowRight, ArrowLeft, MailCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate reset link sending
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Liên kết đặt lại mật khẩu đã được gửi đến email của bạn!');
    }, 1000);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 md:py-16">
      <div className="w-full max-w-[1180px] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* ─── Left Visual Side (Figma Forgot Password Visual) ─── */}
        <div className="lg:col-span-6 relative flex flex-col justify-center space-y-8 p-4 lg:p-8">
          {/* Ambient Rose Light */}
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-[#ff4b72]/20 rounded-full blur-[90px] pointer-events-none -z-10" />

          {/* Kicker */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff8fa3]">
            <KeyRound className="w-4 h-4 text-[#ff6584]" />
            <span>KHÔI PHỤC TÀI KHOẢN</span>
          </div>

          {/* Main Title (Oswald) */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white leading-[1.08]">
            AN TÂM BẢO MẬT<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-[#ff8fa3]">
              TRẢI NGHIỆM LIỀN MẠCH.
            </span>
          </h1>

          {/* Subcopy */}
          <p className="font-sans text-base text-[#d1c7ba] max-w-lg leading-relaxed">
            Hệ thống xác thực mã hóa an toàn giúp bạn lấy lại quyền truy cập tài khoản nhanh chóng để không bỏ lỡ bất kỳ suất chiếu điện ảnh đỉnh cao nào.
          </p>
        </div>

        {/* ─── Right Form Side (Figma Forgot Password Panel) ─── */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-[480px] rounded-[28px] bg-[#27211f] border border-[#4a423d] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            {submitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center mx-auto text-[#10b981]">
                  <MailCheck className="w-8 h-8" />
                </div>
                <h2 className="font-heading text-2xl font-bold uppercase text-white">
                  Kiểm tra hộp thư của bạn
                </h2>
                <p className="text-sm text-[#d1c7ba] leading-relaxed">
                  Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email{' '}
                  <span className="font-semibold text-white">{email}</span>.
                </p>
                <div className="pt-4">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại trang Đăng nhập</span>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="space-y-2 mb-8">
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#faf8f5]">
                    Quên mật khẩu?
                  </h2>
                  <p className="text-sm text-[#d1c7ba]">
                    Nhập địa chỉ email đăng ký để nhận liên kết khôi phục mật khẩu.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
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

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[50px] rounded-xl bg-[#ff4b72] hover:bg-[#ff6584] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(255,75,114,0.3)] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer mt-6"
                  >
                    {loading ? (
                      <span>Đang xử lý...</span>
                    ) : (
                      <>
                        <span>Gửi liên kết khôi phục</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Back to Login */}
                  <div className="text-center pt-4">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ff8fa3] hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Quay lại Đăng nhập</span>
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
