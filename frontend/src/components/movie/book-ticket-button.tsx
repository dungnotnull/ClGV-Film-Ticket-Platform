'use client';

import { useRouter } from 'next/navigation';
import { Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';

export function BookTicketButton({ movieId, closestShowtimeId }: { movieId: string; closestShowtimeId?: string | null }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleBookTicket = () => {
    if (closestShowtimeId) {
      // Jump directly to the closest showtime's seat selection
      router.push(`/booking/seats?showtimeId=${closestShowtimeId}`);
      return;
    }

    // Fallback: scroll to showtimes or redirect to list
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
