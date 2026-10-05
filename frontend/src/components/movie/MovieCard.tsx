"use client";

import Link from 'next/link';
import { Ticket, Play, Sparkles } from 'lucide-react';

export interface MovieCardProps {
  movie: {
    id: string;
    title: string;
    posterUrl?: string;
    trailerUrl?: string;
    durationMinutes?: number;
    ageRating?: string;
    formats?: string[];
    genres?: string[];
    releaseDate?: string;
    roomType?: string;
  };
  status?: 'NOW_SHOWING' | 'COMING_SOON';
}

export const MovieCard = ({ movie, status = 'NOW_SHOWING' }: MovieCardProps) => {
  const roomTypeLabel = movie.roomType || (movie.formats?.includes('IMAX') ? 'PHÒNG IMAX LASER' : 'PHÒNG CHIẾU TIÊU CHUẨN');
  const durationText = movie.durationMinutes ? `${movie.durationMinutes} phút` : '120 phút';
  const ageRating = movie.ageRating || 'T16';
  const formatsText = movie.formats && movie.formats.length > 0 ? movie.formats.join('/') : '2D/Digital';
  const metaText = `${ageRating} · ${durationText} · ${formatsText}`;

  return (
    <div className="group relative flex flex-col w-full rounded-2xl bg-[#120f11] border border-white/[0.08] hover:border-[#ff4b72]/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(255,75,114,0.2)] overflow-hidden">
      {/* Poster Area */}
      <div className="relative aspect-[242/260] w-full overflow-hidden bg-[#1e181b]">
        {/* Glow ambient behind poster */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#120f11] via-transparent to-transparent z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#ff4b72]/20 rounded-full blur-2xl group-hover:bg-[#ff4b72]/40 transition-all" />

        {/* Poster Image */}
        <img
          src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60'}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
          {/* Age Classification Badge */}
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md border border-white/20 text-[#ffd5de]">
            {ageRating}
          </span>

          {/* Original / Tech Badge */}
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider bg-[#ff4b72]/90 text-white shadow-sm">
            <Sparkles className="w-2.5 h-2.5" />
            {movie.formats?.includes('IMAX') ? 'IMAX LASER' : 'CLGV PICKS'}
          </span>
        </div>

        {/* Overlay Action on Hover */}
        <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Link
            href={`/movies/${movie.id}`}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 border border-white/30 flex items-center justify-center text-white transition-all hover:scale-110"
            title="Chi tiết phim"
          >
            <Play className="w-4 h-4 ml-0.5 text-white" />
          </Link>
        </div>
      </div>

      {/* Info & Booking Area */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1">
          {/* Room Type Kicker */}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#ff8fa3]">
            {roomTypeLabel}
          </p>

          {/* Movie Title */}
          <Link href={`/movies/${movie.id}`}>
            <h3 className="font-sans font-bold text-[15px] sm:text-[16px] text-[#faf8f5] line-clamp-1 hover:text-[#ff6584] transition-colors">
              {movie.title}
            </h3>
          </Link>

          {/* Meta text */}
          <p className="text-[11px] text-[#8c8178] line-clamp-1">
            {metaText}
          </p>
        </div>

        {/* CTA Button */}
        <Link
          href={`/movies/${movie.id}`}
          className="w-full h-[38px] rounded-full bg-white/5 hover:bg-[#ff4b72] border border-white/10 hover:border-[#ff4b72] text-[#faf8f5] hover:text-white text-[13px] font-semibold flex items-center justify-center gap-2 transition-all shadow-sm group/btn"
        >
          <Ticket className="w-3.5 h-3.5 text-[#ff8fa3] group-hover/btn:text-white transition-colors" />
          <span>{status === 'COMING_SOON' ? 'Thông Tin Chi Tiết' : 'Đặt Vé'}</span>
        </Link>
      </div>
    </div>
  );
};
