"use client";

import { Check } from 'lucide-react';

export interface BookingProgressRailProps {
  currentStep: 'movie' | 'showtime' | 'seat' | 'fb' | 'checkout' | 'ticket';
}

const STEPS = [
  { key: 'movie', label: 'Phim', stepNum: 1 },
  { key: 'showtime', label: 'Suất', stepNum: 2 },
  { key: 'seat', label: 'Ghế', stepNum: 3 },
  { key: 'fb', label: 'Bắp nước', stepNum: 4 },
  { key: 'checkout', label: 'Thanh toán', stepNum: 5 },
  { key: 'ticket', label: 'Vé', stepNum: 6 },
];

const STEP_TITLES: Record<string, string> = {
  movie: 'BƯỚC 1 / 6 · CHỌN PHIM ĐIỆN ẢNH',
  showtime: 'BƯỚC 2 / 6 · CHỌN SUẤT CHIẾU VÀ RẠP',
  seat: 'BƯỚC 3 / 6 · CHỌN GHẾ PHÒNG CHIẾU REALTIME',
  fb: 'BƯỚC 4 / 6 · CHỌN COMBO BẮP NƯỚC & VOUCHER',
  checkout: 'BƯỚC 5 / 6 · XÁC NHẬN VÀ THANH TOÁN',
  ticket: 'BƯỚC 6 / 6 · VÉ ĐIỆN TỬ & MÃ QR HMAC',
};

export function BookingProgressRail({ currentStep }: BookingProgressRailProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full max-w-[1060px] mx-auto px-4 mb-8 space-y-3">
      {/* Step Subtitle Kicker */}
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#ff8fa3]">
        {STEP_TITLES[currentStep] || ''}
      </p>

      {/* Ticket Rail Container (Figma Ticket Rail) */}
      <div className="w-full h-16 rounded-2xl bg-[#27211f] border border-[#4a423d] px-4 sm:px-8 flex items-center justify-between shadow-lg overflow-x-auto scrollbar-none">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Dot / Number Badge */}
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-[#ff4b72] text-white shadow-[0_0_12px_rgba(255,75,114,0.6)] scale-110'
                    : isCompleted
                    ? 'bg-[#ff8fa3]/20 border border-[#ff8fa3]/40 text-[#ff8fa3]'
                    : 'bg-[#3b3230] text-[#afa49b]'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.stepNum}
              </div>

              {/* Step Label */}
              <span
                className={`text-xs sm:text-[13px] font-medium ${
                  isCurrent
                    ? 'text-white font-bold'
                    : isCompleted
                    ? 'text-[#d1c7ba]'
                    : 'text-[#afa49b]/70'
                }`}
              >
                {step.label}
              </span>

              {/* Connecting Line (except for last item) */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`w-6 sm:w-12 h-[3px] rounded-full mx-1 sm:mx-2 ${
                    idx < currentIndex ? 'bg-[#ff4b72]' : 'bg-[#4a423d]'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
