'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ShieldCheck, Award, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function UserProfilePage() {
  const { user, updateUser } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || 'Linh Hà');
  const [email, setEmail] = useState(user?.email || 'linh.ha@example.com');
  const [phone, setPhone] = useState('090 123 4567');
  const [dob, setDob] = useState('18 / 10 / 1998');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate saving profile update
    await new Promise((resolve) => setTimeout(resolve, 600));
    updateUser({ fullName });
    setIsSaving(false);
    toast.success('Cập nhật thông tin hồ sơ thành công!');
  };

  const points = user?.points || 1280;
  const targetPoints = 2000;
  const progressPercent = Math.min(Math.round((points / targetPoints) * 100), 100);

  return (
    <div className="space-y-8">
      {/* Title Section (Figma 3274:13698) */}
      <div>
        <p className="text-xs font-bold text-[#ff8fa3] uppercase tracking-[0.2em] mb-1">
          TÀI KHOẢN
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif tracking-wide text-white uppercase font-bold">
          Hồ sơ của {user?.fullName || 'Linh Hà'}
        </h1>
        <p className="text-xs sm:text-sm text-[#d1c7ba] mt-1.5">
          Quản lý thông tin để nhận vé điện tử và ưu đãi thành viên chính xác.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Profile Form (Figma 3274:13701) */}
        <div className="lg:col-span-7 bg-[#1f1a18] border border-[#4a423d] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-base font-bold text-white uppercase tracking-wider pb-3 border-b border-[#4a423d]">
            Thông Tin Cá Nhân
          </h2>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#afa49b] uppercase tracking-wider">
                Họ và tên
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-[#27211f] border-[#4a423d] text-white h-12 rounded-xl focus:border-[#ff4b72]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#afa49b] uppercase tracking-wider">
                Email
              </label>
              <Input
                type="email"
                value={email}
                disabled
                className="bg-[#27211f]/60 border-[#4a423d] text-[#afa49b] h-12 rounded-xl cursor-not-allowed"
              />
              <p className="text-[11px] text-[#afa49b]">Email gắn liền với tài khoản đăng nhập</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#afa49b] uppercase tracking-wider">
                  Số điện thoại
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-[#27211f] border-[#4a423d] text-white h-12 rounded-xl focus:border-[#ff4b72]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#afa49b] uppercase tracking-wider">
                  Ngày sinh
                </label>
                <Input
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="bg-[#27211f] border-[#4a423d] text-white h-12 rounded-xl focus:border-[#ff4b72]"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSaving}
                className="h-12 px-8 rounded-full bg-gradient-to-r from-[#ff4b72] to-[#ff6584] hover:opacity-95 text-white font-bold text-sm shadow-[0_8px_20px_rgba(255,75,114,0.35)] transition-all cursor-pointer"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Membership Snapshot (Figma 3274:13716) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#302927] to-[#27211f] border border-[#4a423d] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          
          {/* Ambient Corner Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#ff4b72]/15 blur-2xl pointer-events-none rounded-full" />

          <div>
            <span className="text-xs font-bold text-[#ff8fa3] uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{user?.membershipTier || 'ROSE MEMBER'}</span>
            </span>
            <div className="mt-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
                {points.toLocaleString('vi-VN')}
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#afa49b] mt-1">
                ĐIỂM TÍCH LŨY KHẢ DỤNG
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-2.5 bg-[#1f1a18] rounded-full overflow-hidden border border-[#4a423d]/50">
              <div 
                className="h-full bg-gradient-to-r from-[#ff4b72] to-[#ff8fa3] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-[#d1c7ba]">
              Còn <strong className="text-white">{(targetPoints - points).toLocaleString('vi-VN')} điểm</strong> để lên hạng Vàng (Gold)
            </p>
          </div>

          {/* Benefits List */}
          <div className="pt-4 border-t border-[#4a423d] space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#afa49b]">
              ĐẶC QUYỀN HẠNG CỦA BẠN
            </p>
            <ul className="space-y-2 text-xs text-[#d1c7ba]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ff8fa3] shrink-0" />
                <span>Tích điểm 5% cho mọi giao dịch vé và bắp nước</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ff8fa3] shrink-0" />
                <span>Ưu tiên đặt chỗ suất chiếu sớm & Premiere</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ff8fa3] shrink-0" />
                <span>Quà tặng sinh nhật Combo Bắp Nước miễn phí</span>
              </li>
            </ul>
          </div>

          <Link href="/user/membership">
            <Button
              variant="outline"
              className="w-full h-11 rounded-full border-[#4a423d] text-[#d1c7ba] hover:text-white hover:bg-[#1f1a18] text-xs font-semibold flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <span>Xem chi tiết hạng & đổi quà</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>

        </div>

      </div>
    </div>
  );
}
