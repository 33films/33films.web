import Image from "next/image";

export default function BrandMark({
  className = "",
  size = "nav",
}: {
  className?: string;
  size?: "nav" | "auth" | "footer";
}) {
  const dimensions = {
    nav: { width: 72, height: 56 },
    auth: { width: 80, height: 62 },
    footer: { width: 140, height: 108 },
  }[size];

  return (
    <Image
      src="/images/logo-white.png"
      alt="33FILMS"
      width={dimensions.width}
      height={dimensions.height}
      className={`h-auto w-[3.25rem] md:w-[3.75rem] ${className}`}
      priority={size === "nav"}
    />
  );
}
