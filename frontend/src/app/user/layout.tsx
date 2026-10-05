'use client';

import { usePathname, useRouter } from 'next/navigation';
import { User, Ticket, CreditCard, Award, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';

const navItems = [
  { name: 'Hồ sơ', href: '/user', icon: User },
  { name: 'Vé của tôi', href: '/user/tickets', icon: Ticket },
  { name: 'Thẻ ClGV', href: '/user/cgv-card', icon: CreditCard },
  { name: 'Hạng thành viên & Điểm', href: '/user/membership', icon: Award },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!_hasHydrated) return;
    
    if (!isAuthenticated) {
      router.push('/login?redirect=/user');
    }
  }, [isAuthenticated, router, _hasHydrated]);

  if (!isMounted || !_hasHydrated || !isAuthenticated) return null;

  // Extract user initials
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'US';

  const memberYear = (user as any)?.createdAt ? new Date((user as any).createdAt).getFullYear() : 2024;

  return (
    <div className="min-h-screen bg-[#1f1a18] text-white pt-8 pb-24">
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Member Sidebar (Figma 3274:13682) */}
          <aside className="lg:col-span-3">
            <div className="bg-[#27211f] border border-[#4a423d] rounded-3xl p-6 shadow-2xl space-y-6">
              
              {/* Profile Box */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-[#4a423d]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#ff4b72] to-[#ff8fa3] flex items-center justify-center text-white text-xl font-bold shadow-[0_0_20px_rgba(255,75,114,0.4)] mb-3">
                  {initials}
                </div>
                <h3 className="font-bold text-lg text-white tracking-tight">{user?.fullName || 'Khách hàng'}</h3>
                <span className="text-[11px] font-bold text-[#ff8fa3] tracking-widest uppercase mt-0.5">
                  {user?.membershipTier || 'ROSE MEMBER'}
                </span>
                <p className="text-[10px] text-[#afa49b] font-medium tracking-wider mt-2">
                  THÀNH VIÊN TỪ {memberYear}
                </p>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <button
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
                        isActive
                          ? 'bg-[#302927] text-white border border-[#4a423d] shadow-md'
                          : 'text-[#d1c7ba] hover:text-white hover:bg-[#302927]/60'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#ff4b72] rounded-r-full shadow-[0_0_8px_rgba(255,75,114,0.8)]" />
                      )}
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#ff4b72]' : 'text-[#afa49b]'}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <div className="pt-4 border-t border-[#4a423d]">
                <button
                  onClick={() => {
                    logout();
                    router.push('/login');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#afa49b] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>

            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9">
            <div className="bg-[#27211f] border border-[#4a423d] rounded-3xl p-6 sm:p-8 shadow-2xl">
              {children}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
