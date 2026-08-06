'use client';

import { useRouter } from 'next/navigation';
import { Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';

export function BookTicketButton({ movieId }: { movieId: string }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleBookTicket = () => {
    // Luôn cho phép người dùng xem lịch chiếu và chọn ghế, chỉ yêu cầu đăng nhập ở bước thanh toán
    const showtimeSection = document.getElementById('showtimes-section');
    if (showtimeSection) {
      showtimeSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(`/booking/showtimes?movieId=${movieId}`);
    }
  };

  return (
    <Button 
      size="lg" 
      className="text-lg font-bold px-8 shadow-lg shadow-primary/30 uppercase mt-4 w-full md:w-auto"
      onClick={handleBookTicket}
    >
      <Ticket className="w-5 h-5 mr-2" />
      Mua Vé Ngay
    </Button>
  );
}
