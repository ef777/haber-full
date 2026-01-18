'use client';

import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'unoptimized'> {
  src: string;
}

export default function OptimizedImage({ src, ...props }: OptimizedImageProps) {
  // Local uploads should not be optimized (they're served via API route)
  const isLocalUpload = src.includes('/uploads/');

  return (
    <Image
      src={src}
      {...props}
      unoptimized={isLocalUpload}
    />
  );
}
