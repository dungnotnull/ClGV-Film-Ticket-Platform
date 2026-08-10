"use client";

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Film, MapPin, Users, Settings, LogOut, CalendarRange, Image as ImageIcon, Building2, Popcorn, Ticket, QrCode } from 'lucide-react';
import { Oswald } from 'next/font/google';

const oswald = Oswald({ subsets: ['latin', 'vietnamese'] });

const navLinks = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/movies', icon: Film, label: 'Quản lý Phim' },
  { href: '/admin/banners', icon: ImageIcon, label: 'Quản lý Banners' },
  { href: '/admin/cinemas', icon: MapPin, label: 'Quản lý Rạp' },
  { href: '/admin/showtimes', icon: CalendarRange, label: 'Quản lý Lịch Chiếu' },
  { href: '/admin/users', icon: Users, label: 'Quản lý Users' },
  { href: '/admin/settings', icon: Settings, label: 'Cấu hình' },
];

const secondaryLinks = [
  { href: '/admin/cities', icon: Building2, label: 'Thành Phố' },
  { href: '/admin/combos', icon: Popcorn, label: 'Bắp Nước' },
  { href: '/admin/vouchers', icon: Ticket, label: 'Mã Giảm Giá' },
  { href: '/admin/tickets/scan', icon: QrCode, label: 'Soát Vé (Scan QR)' },
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
    if (!_hasHydrated) return; // Wait for hydration
    
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [isAuthenticated, user, router, _hasHydrated]);

  if (!mounted || !_hasHydrated || !user || user.role !== 'ADMIN') return null;

  return (
    <div className={`flex h-[calc(100vh-4rem)] relative overflow-hidden bg-black ${oswald.className}`}>
      {/* Cinematic Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-luminosity"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Gradient overlay to ensure text readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-black/80 via-black/90 to-background pointer-events-none" />
      {/* Ambient Light Effects */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-64 bg-card/60 backdrop-blur-xl border-r border-border/50 flex flex-col hidden md:flex z-10">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-primary tracking-wider uppercase">Quản Trị CGV</h2>
          <p className="text-sm text-muted-foreground mt-1">Hệ thống CMS</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
            return (
              <Link 
                key={link.href}
                href={link.href} 
                onClick={(e) => {
                  if (isActive) e.preventDefault();
                }}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-primary/20 text-primary border-r-2 border-primary' : 'hover:bg-primary/10 hover:text-primary'}`}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-border/50" />
          
          {secondaryLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link 
                key={link.href}
                href={link.href} 
                onClick={(e) => {
                  if (isActive) e.preventDefault();
                }}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-primary/20 text-primary border-r-2 border-primary' : 'hover:bg-primary/10 hover:text-primary'}`}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <button 
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-destructive rounded-md hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Đăng xuất
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 z-10">
        {children}
      </main>
    </div>
  );
}
