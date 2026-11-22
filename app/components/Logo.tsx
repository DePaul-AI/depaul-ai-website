import Image from "next/image";
import type { Site } from "@/lib/content";
import { logoFor } from "@/themes";

/** The active theme's logo (uploaded via `/dai logo`, or the built-in one). */
export default function Logo({
  site,
  className,
  sizes,
  priority,
}: {
  site: Site;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  const src = logoFor(site.theme, site.logos);
  return (
    <span className={className}>
      <Image
        src={src}
        alt="DePaul AI logo"
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={src.endsWith(".svg") || src.endsWith(".gif")}
        className="object-cover"
      />
    </span>
  );
}
