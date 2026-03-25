import Image from "next/image";
import Link from "next/link";

export function Logo({
  href = "/dashboard",
  size = "default",
}: {
  href?: string;
  size?: "small" | "default" | "large";
}) {
  const heights = { small: 24, default: 32, large: 40 };
  const h = heights[size];

  return (
    <Link href={href} className="flex items-center gap-2">
      <Image
        src="/logo.svg"
        alt="StayHome"
        width={h * 5}
        height={h}
        className="brightness-100"
        priority
      />
    </Link>
  );
}
