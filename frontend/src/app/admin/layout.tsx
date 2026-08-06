"use client";

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Film, MapPin, Users, Settings, LogOut, CalendarRange, Image as ImageIcon } from 'lucide-react';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!mounted || !user || user.role !== 'ADMIN') return null;

  return (
    <div className={`flex h-[calc(100vh-4rem)] relative overflow-hidden bg-black ${outfit.className}`}>
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
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-colors">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link href="/admin/movies" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-colors">
            <Film className="h-5 w-5" />
            Quản lý Phim
          </Link>
          <Link href="/admin/banners" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-colors">
            <ImageIcon className="h-5 w-5" />
            Quản lý Banners
          </Link>
          <Link href="/admin/cinemas" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-colors">
            <MapPin className="h-5 w-5" />
            Quản lý Rạp
          </Link>
          <Link href="/admin/showtimes" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-colors">
            <CalendarRange className="h-5 w-5" />
            Quản lý Lịch Chiếu
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-colors">
            <Users className="h-5 w-5" />
            Quản lý Users
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-colors">
            <Settings className="h-5 w-5" />
            Cấu hình
          </Link>
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
