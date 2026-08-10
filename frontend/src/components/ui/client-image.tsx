"use client";

import { ImgHTMLAttributes, useState } from "react";

interface ClientImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc: string;
}

export function ClientImage({ src, fallbackSrc, alt, className, ...props }: ClientImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      {...props}
      src={imgSrc || fallbackSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
