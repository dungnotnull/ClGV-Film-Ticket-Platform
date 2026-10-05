"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Film, User, LogOut, ChevronDown, MapPin, Menu, X, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedCity, setSelectedCity] = useState('TP. Hồ Chí Minh');
  const [cities, setCities] = useState<string[]>([
    'TP. Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Cần Thơ',
    'Hải Phòng',
  ]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch dynamic cities from backend
    fetch('http://localhost:4000/api/v1/cities')
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setCities(data.data.map((c: any) => c.name));
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { label: 'Phim', href: '/movies' },
    { label: 'Lịch Chiếu', href: '/booking/showtimes' },
    { label: 'Cụm Rạp', href: '/cinemas' },
    { label: 'Ưu Đãi', href: '/promotions' },
    { label: 'Phòng Chiếu', href: '/cinemas#halls' },
  ];

  return (
    <div className="sticky top-4 z-50 w-full px-4 flex justify-center pointer-events-none">
      <header className="pointer-events-auto w-full max-w-[1060px] h-[54px] rounded-full px-4 sm:px-6 flex items-center justify-between bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all">
        {/* Left Side: Brand Logo + Nav Links */}
        <div className="flex items-center gap-6 md:gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-[#ff4b72]/20 border border-[#ff4b72]/40 flex items-center justify-center transition-transform group-hover:scale-105">
              <Film className="w-4 h-4 text-[#ff6584]" />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-white font-sans flex items-center gap-1.5">
              ClGV <span className="text-[#ff6584] font-normal text-sm hidden sm:inline">Cinema</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-white/80">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`transition-colors hover:text-[#ff8fa3] ${
                    isActive ? 'text-[#ff6584] font-semibold' : 'text-white/80'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: City Picker + Auth State */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* City Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden lg:flex items-center gap-1.5 text-[12px] font-medium text-[#d1c7ba] hover:text-white transition-colors bg-transparent border-none outline-none cursor-pointer py-1 px-2 rounded-full hover:bg-white/5">
              <MapPin className="w-3.5 h-3.5 text-[#ff8fa3]" />
              <span>{selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-[#afa49b]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#27211f] border-[#4a423d] text-white">
              {cities.map((city) => (
                <DropdownMenuItem
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`cursor-pointer text-xs ${
                    selectedCity === city ? 'text-[#ff6584] font-semibold bg-white/5' : ''
                  }`}
                >
                  {city}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth section */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 py-1 px-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 transition-all cursor-pointer outline-none">
                <div className="w-6 h-6 rounded-full bg-[#ff4b72]/30 border border-[#ff4b72] flex items-center justify-center text-xs font-bold text-[#faf8f5]">
                  {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-[13px] font-medium text-[#faf8f5] max-w-[100px] truncate hidden sm:inline">
                  {user.fullName}
                </span>
                <ChevronDown className="w-3 h-3 text-[#afa49b]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#27211f] border-[#4a423d] text-[#faf8f5]" align="end">
                <div className="flex flex-col space-y-1 p-3 border-b border-[#4a423d]">
                  <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                  <p className="text-xs text-[#afa49b] truncate">{user.email}</p>
                </div>

                {user.role === 'ADMIN' && (
                  <DropdownMenuItem
                    onClick={() => router.push('/admin')}
                    className="cursor-pointer text-xs hover:bg-[#302927] text-[#ff8fa3]"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Trang Quản Trị</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() => router.push('/user')}
                  className="cursor-pointer text-xs hover:bg-[#302927]"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Hồ sơ thành viên</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push('/user/tickets')}
                  className="cursor-pointer text-xs hover:bg-[#302927]"
                >
                  <Film className="mr-2 h-4 w-4" />
                  <span>Vé của tôi</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => logout()}
                  className="cursor-pointer text-xs hover:bg-[#302927] text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/register"
                className="text-[13px] font-medium text-[#d1c7ba] hover:text-white transition-colors px-2 py-1"
              >
                Đăng ký
              </Link>
              <Link
                href="/login"
                className="h-[34px] px-4 sm:px-5 rounded-full bg-white/10 hover:bg-[#ff4b72] border border-white/20 hover:border-[#ff4b72] text-[13px] font-medium text-white transition-all flex items-center justify-center shadow-sm"
              >
                Đăng nhập
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto absolute top-16 left-4 right-4 bg-[#27211f]/95 backdrop-blur-2xl border border-[#4a423d] rounded-2xl p-5 shadow-2xl md:hidden flex flex-col gap-3">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-white/5 text-sm font-medium text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};
