"use client";

import { useState } from "react";

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/532867/pexels-photo-532867.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1400";

type SafeImageProps = {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  fallbackSrc?: string;
};

export function SafeImage({
  src,
  alt,
  className = "absolute inset-0 h-full w-full object-cover",
  loading = "lazy",
  fallbackSrc = FALLBACK_IMAGE,
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
      className={className}
    />
  );
}
