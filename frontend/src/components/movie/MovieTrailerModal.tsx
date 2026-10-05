"use client";

import { useState } from 'react';
import { Play, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface MovieTrailerModalProps {
  trailerUrl: string;
  movieTitle: string;
}

export function MovieTrailerModal({ trailerUrl, movieTitle }: MovieTrailerModalProps) {
  const [open, setOpen] = useState(false);

  // Convert watch?v= or youtu.be to embed URL
  let embedUrl = trailerUrl;
  if (embedUrl.includes('watch?v=')) {
    embedUrl = embedUrl.replace('watch?v=', 'embed/');
  } else if (embedUrl.includes('youtu.be/')) {
    embedUrl = embedUrl.replace('youtu.be/', 'www.youtube.com/embed/');
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <button
          type="button"
          className="h-12 px-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-sm flex items-center gap-2 transition-all hover:border-white/30 cursor-pointer"
        />
      }>
        <Play className="w-4 h-4 text-[#ff8fa3] fill-[#ff8fa3]" />
        <span>Xem Trailer</span>
      </DialogTrigger>

      <DialogContent className="max-w-4xl p-0 bg-black border-[#4a423d] overflow-hidden rounded-2xl">
        <DialogHeader className="p-4 bg-[#27211f] border-b border-[#4a423d] flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-bold text-white uppercase tracking-wide truncate max-w-[85%]">
            Trailer: {movieTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="relative aspect-video w-full bg-black">
          {open && (
            <iframe
              src={embedUrl}
              title={`Trailer ${movieTitle}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-none"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
