import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BookingCombo {
  comboId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface BookingVoucher {
  code: string;
  discountAmount: number;
}

interface BookingState {
  movieId: string | null;
  cinemaId: string | null;
  showtimeId: string | null;
  selectedSeats: { id: string; price: number; name: string }[];
  reservationId: string | null;
  expiresAt: string | null;
  combos: BookingCombo[];
  appliedVoucher: BookingVoucher | null;
  
  // Actions
  setShowtime: (movieId: string, cinemaId: string, showtimeId: string) => void;
  toggleSeat: (seat: { id: string; price: number; name: string }) => void;
  setReservation: (reservationId: string, expiresAt: string) => void;
  addCombo: (combo: BookingCombo) => void;
  removeCombo: (comboId: string) => void;
  applyVoucher: (voucher: BookingVoucher | null) => void;
  resetBooking: () => void;
  
  // Computed
  getTotalAmount: () => number;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      movieId: null,
      cinemaId: null,
      showtimeId: null,
      selectedSeats: [],
      reservationId: null,
      expiresAt: null,
      combos: [],
      appliedVoucher: null,

      setShowtime: (movieId, cinemaId, showtimeId) =>
        set({ movieId, cinemaId, showtimeId, selectedSeats: [], combos: [], appliedVoucher: null, reservationId: null, expiresAt: null }),
        
      toggleSeat: (seat) =>
        set((state) => {
          const exists = state.selectedSeats.find((s) => s.id === seat.id);
          if (exists) {
            return { selectedSeats: state.selectedSeats.filter((s) => s.id !== seat.id) };
          } else {
            return { selectedSeats: [...state.selectedSeats, seat] };
          }
        }),
        
      setReservation: (reservationId, expiresAt) => set({ reservationId, expiresAt }),
      
      addCombo: (combo) =>
        set((state) => {
          const exists = state.combos.find((c) => c.comboId === combo.comboId);
          if (exists) {
            return {
              combos: state.combos.map((c) =>
                c.comboId === combo.comboId ? { ...c, quantity: combo.quantity } : c
              ),
            };
          }
          return { combos: [...state.combos, combo] };
        }),
        
      removeCombo: (comboId) =>
        set((state) => ({
          combos: state.combos.filter((c) => c.comboId !== comboId),
        })),
        
      applyVoucher: (voucher) => set({ appliedVoucher: voucher }),
      
      resetBooking: () =>
        set({
          movieId: null,
          cinemaId: null,
          showtimeId: null,
          selectedSeats: [],
          reservationId: null,
          expiresAt: null,
          combos: [],
          appliedVoucher: null,
        }),
        
      getTotalAmount: () => {
        const state = get();
        const seatsTotal = state.selectedSeats.reduce((acc, seat) => acc + seat.price, 0);
        const combosTotal = state.combos.reduce((acc, combo) => acc + combo.price * combo.quantity, 0);
        const discount = state.appliedVoucher ? state.appliedVoucher.discountAmount : 0;
        return Math.max(0, seatsTotal + combosTotal - discount);
      },
    }),
    {
      name: 'clgv-booking-storage',
    }
  )
);
