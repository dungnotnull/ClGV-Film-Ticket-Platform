"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button, buttonVariants } from '@/components/ui/button';
import { Film, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center mx-auto px-4">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Film className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold font-heading text-primary">
            ClGV
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/movies" className="transition-colors hover:text-primary">
            Phim
          </Link>
          <Link
            href="/cinemas"
            className="transition-colors hover:text-primary"
          >
            Rạp CGV
          </Link>
          <Link
            href="/promotions"
            className="transition-colors hover:text-primary"
          >
            Khuyến Mãi
          </Link>
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'rounded-full' })}>
                <User className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {user.fullName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer">
                    Trang Quản Trị
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => router.push('/user')} className="cursor-pointer">
                  Hồ sơ của tôi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/user/tickets')} className="cursor-pointer">
                  Vé của tôi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: 'ghost' })}>
                Đăng nhập
              </Link>
              <Link href="/register" className={buttonVariants()}>
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
