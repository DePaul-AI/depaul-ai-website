import { IconBrandInstagram, IconBrandLinkedin } from "@tabler/icons-react";
import type { Site } from "@/lib/content";

export default function Socials({ socials }: { socials: Site["socials"] }) {
  const items = [
    socials.instagram && {
      href: `https://www.instagram.com/${socials.instagram}/`,
      label: "Instagram",
      Icon: IconBrandInstagram,
    },
    socials.linkedin && {
      href: `https://linkedin.com/company/${socials.linkedin}`,
      label: "LinkedIn",
      Icon: IconBrandLinkedin,
    },
  ].filter((x) => !!x);

  return (
    <div className="flex items-center gap-1">
      {items.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="rounded-full p-2 text-muted transition hover:bg-surface hover:text-fg"
        >
          <Icon size={20} stroke={1.75} />
        </a>
      ))}
    </div>
  );
}
