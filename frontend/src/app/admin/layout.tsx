"use client";

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Film, 
  MapPin, 
  Users, 
  Settings, 
  LogOut, 
  CalendarRange, 
  Image as ImageIcon, 
  Building2, 
  Popcorn, 
  Ticket, 
  QrCode,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

const mainNavLinks = [
  { href: '/admin', icon: LayoutDashboard, label: 'Bảng Điều Khiển' },
  { href: '/admin/movies', icon: Film, label: 'Quản Lý Phim' },
  { href: '/admin/showtimes', icon: CalendarRange, label: 'Lịch Chiếu & Phòng' },
  { href: '/admin/cinemas', icon: MapPin, label: 'Cụm Rạp' },
  { href: '/admin/banners', icon: ImageIcon, label: 'Banners Khuyến Mãi' },
  { href: '/admin/users', icon: Users, label: 'Khách Hàng & Users' },
];

const secondaryNavLinks = [
  { href: '/admin/tickets/scan', icon: QrCode, label: 'Soát Vé (Scan QR)' },
  { href: '/admin/combos', icon: Popcorn, label: 'Bắp Nước' },
  { href: '/admin/vouchers', icon: Ticket, label: 'Mã Giảm Giá' },
  { href: '/admin/cities', icon: Building2, label: 'Tỉnh / Thành Phố' },
  { href: '/admin/settings', icon: Settings, label: 'Cấu Hình Hệ Thống' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!_hasHydrated) return;
    
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin');
    } else if (user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [isAuthenticated, user, router, _hasHydrated]);

  if (!mounted || !_hasHydrated || !user || user.role !== 'ADMIN') return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#1f1a18] text-white">
      
      {/* Sidebar */}
      <aside className="w-68 bg-[#27211f] border-r border-[#4a423d] flex flex-col hidden md:flex shrink-0 z-20 shadow-2xl">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-[#4a423d]">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="text-xl font-black text-[#ff4b72] tracking-wider uppercase flex items-center gap-1.5">
              <span>ClGV</span>
              <span className="text-white text-base font-bold">Admin</span>
            </Link>
            <span className="text-[10px] font-bold bg-[#ff4b72]/20 border border-[#ff4b72]/40 text-[#ff8fa3] px-2 py-0.5 rounded-full uppercase tracking-wider">
              CMS v2.0
            </span>
          </div>
          <p className="text-[11px] text-[#afa49b] mt-1">Hệ thống điều hành rạp phim</p>
        </div>
        
        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-[#4a423d]">
          <p className="text-[10px] font-bold text-[#afa49b] uppercase tracking-wider px-3 mb-2">
            NGHIỆP VỤ CHÍNH
          </p>
          {mainNavLinks.map((link) => {
            const isActive = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all relative ${
                  isActive 
                    ? 'bg-[#302927] text-white border border-[#4a423d] shadow-sm' 
                    : 'text-[#d1c7ba] hover:bg-[#302927]/60 hover:text-white'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#ff4b72] rounded-r-full shadow-[0_0_8px_rgba(255,75,114,0.8)]" />
                )}
                <link.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#ff4b72]' : 'text-[#afa49b]'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-[#4a423d]/60">
            <p className="text-[10px] font-bold text-[#afa49b] uppercase tracking-wider px-3 mb-2">
              QUẢN LÝ TIỆN ÍCH
            </p>
          </div>
          
          {secondaryNavLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all relative ${
                  isActive 
                    ? 'bg-[#302927] text-white border border-[#4a423d] shadow-sm' 
                    : 'text-[#d1c7ba] hover:bg-[#302927]/60 hover:text-white'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#ff4b72] rounded-r-full shadow-[0_0_8px_rgba(255,75,114,0.8)]" />
                )}
                <link.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#ff4b72]' : 'text-[#afa49b]'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#4a423d] bg-[#1f1a18]">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-[#ff4b72] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.fullName ? user.fullName[0].toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Quản trị viên'}</p>
              <p className="text-[10px] text-emerald-400 font-mono">ROLE_ADMIN</p>
            </div>
          </div>
          <button 
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-red-400 hover:text-white hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Đăng xuất Admin</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
        {/* Subtle Ambient Background Spotlight */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-[#ff4b72]/5 blur-[140px] pointer-events-none rounded-full" />
        <div className="relative z-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
