import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  srcSet2x?: string;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  srcSet2x,
  className,
  priority = false,
}: OptimizedImageProps) {
  const srcSet = srcSet2x ? `${src} 1x, ${srcSet2x} 2x` : undefined;

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      srcSet={srcSet}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn(className)}
    />
  );
}
