import Link from 'next/link';
import { Film, ShieldCheck, Phone, Mail, Award, Clock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-[#4a423d]/40 bg-[#161211] text-[#afa49b] pt-16 pb-12 mt-auto relative z-10">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand & Mission */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ff4b72]/20 border border-[#ff4b72]/40 flex items-center justify-center">
              <Film className="w-4 h-4 text-[#ff6584]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#faf8f5]">
              ClGV <span className="text-[#ff6584] font-normal text-sm">Cinema</span>
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-[#d1c7ba]/80">
            Hệ thống rạp chiếu phim chuẩn quốc tế với phòng chiếu IMAX Laser, 4DX sống động và âm thanh vòm Dolby Atmos đỉnh cao.
          </p>
          <div className="flex items-center gap-3 pt-2 text-xs text-[#afa49b]">
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
              <Award className="w-3.5 h-3.5 text-[#ff8fa3]" /> IMAX Certified
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> BCT Verified
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-heading uppercase tracking-wider text-sm font-semibold text-[#faf8f5] mb-4">
            Khám phá
          </h4>
          <ul className="space-y-2.5 text-[13px]">
            <li>
              <Link href="/movies?status=NOW_SHOWING" className="hover:text-[#ff8fa3] transition-colors">
                Phim đang chiếu
              </Link>
            </li>
            <li>
              <Link href="/movies?status=COMING_SOON" className="hover:text-[#ff8fa3] transition-colors">
                Phim sắp chiếu
              </Link>
            </li>
            <li>
              <Link href="/booking/showtimes" className="hover:text-[#ff8fa3] transition-colors">
                Lịch chiếu hôm nay
              </Link>
            </li>
            <li>
              <Link href="/cinemas" className="hover:text-[#ff8fa3] transition-colors">
                Hệ thống cụm rạp
              </Link>
            </li>
            <li>
              <Link href="/user/profile" className="hover:text-[#ff8fa3] transition-colors">
                Đặc quyền hội viên
              </Link>
            </li>
          </ul>
        </div>

        {/* Policy & Terms */}
        <div>
          <h4 className="font-heading uppercase tracking-wider text-sm font-semibold text-[#faf8f5] mb-4">
            Chính sách
          </h4>
          <ul className="space-y-2.5 text-[13px]">
            <li>
              <Link href="/terms" className="hover:text-[#ff8fa3] transition-colors">
                Điều khoản chung
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-[#ff8fa3] transition-colors">
                Chính sách bảo mật
              </Link>
            </li>
            <li>
              <Link href="/payment-policy" className="hover:text-[#ff8fa3] transition-colors">
                Chính sách thanh toán & hoàn vé
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-[#ff8fa3] transition-colors">
                Câu hỏi thường gặp (FAQ)
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & Hotline */}
        <div>
          <h4 className="font-heading uppercase tracking-wider text-sm font-semibold text-[#faf8f5] mb-4">
            Chăm sóc khách hàng
          </h4>
          <div className="space-y-3 text-[13px]">
            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-[#ff6584] mt-0.5" />
              <div>
                <span className="font-semibold text-white">1900 6017</span>
                <p className="text-xs text-[#afa49b]">8:00 - 22:00 (Tất cả các ngày)</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#ff6584]" />
              <span className="text-[#d1c7ba]">hotro@clgv.vn</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#ff6584]" />
              <span className="text-xs text-[#afa49b]">Mở cửa theo suất chiếu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1200px] mx-auto px-6 mt-12 pt-6 border-t border-[#4a423d]/30 flex flex-col sm:flex-row items-center justify-between text-xs text-[#afa49b]/70 gap-4">
        <p>© 2026 ClGV Film Ticket Platform. Bản quyền thuộc về ClGV Cinema Group.</p>
        <p className="flex items-center gap-4">
          <span>Phiên bản 2.5 (Figma Midnight Rose)</span>
          <span>·</span>
          <span>Bảo mật chuẩn HMAC-SHA256</span>
        </p>
      </div>
    </footer>
  );
};
