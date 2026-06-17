import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "src"> {
  src: string;
}

export default function SafeImage({ src, alt, fill, className, ...props }: SafeImageProps) {
  if (src && src.startsWith("data:")) {
    const fillStyle = fill
      ? {
          position: "absolute" as const,
          height: "100%",
          width: "100%",
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
        }
      : {};
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ ...fillStyle, ...props.style }}
        {...(props as any)}
      />
    );
  }
  return <Image src={src} alt={alt} fill={fill} className={className} {...props} />;
}
