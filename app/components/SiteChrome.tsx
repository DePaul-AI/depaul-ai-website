import Link from "next/link";
import { IconSpeakerphone } from "@tabler/icons-react";
import type { Site } from "@/lib/content";
import Logo from "./Logo";
import Socials from "./Socials";

/** Announcement banner, header and footer shared by every page. */

export function Banner({ site }: { site: Site }) {
  if (!site.announcement) return null;
  return (
    <div className="banner">
      <IconSpeakerphone size={16} className="mr-1.5 inline -translate-y-px" />
      {site.announcement.link ? (
        <a href={site.announcement.link} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          {site.announcement.text}
        </a>
      ) : (
        site.announcement.text
      )}
    </div>
  );
}

export function SiteHeader({ site }: { site: Site }) {
  return (
    <header className="site-header">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="brand-name flex items-center gap-2.5">
          <Logo site={site} className="relative size-8 overflow-hidden rounded-lg" sizes="32px" />
          {site.hero.title}
        </Link>
        <nav className="flex items-center gap-1 text-sm sm:gap-4">
          <Link href="/#events" className="hidden text-muted hover:text-fg sm:inline">Events</Link>
          <Link href="/updates" className="hidden text-muted hover:text-fg sm:inline">Updates</Link>
          <Link href="/#links" className="hidden text-muted hover:text-fg sm:inline">Links</Link>
          <Socials socials={site.socials} />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ site }: { site: Site }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:px-6">
        <p>DePaul AI · a student organization at DePaul University, Chicago</p>
        <Socials socials={site.socials} />
      </div>
    </footer>
  );
}

export function SectionTitle({ children, as: Tag = "h2" }: { children: React.ReactNode; as?: "h1" | "h2" }) {
  return <Tag className="section-title">{children}</Tag>;
}
