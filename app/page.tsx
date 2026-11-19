import { IconArrowUpRight, IconSpeakerphone } from "@tabler/icons-react";
import { activeCountdown, site, sortedPosts, splitEvents } from "@/lib/content";
import { currentYear, longDate, time } from "@/lib/format";
import { THEMES } from "@/lib/themes";
import Countdown from "./components/Countdown";
import Logo from "./components/Logo";
import Decor from "./themes/Decor";
import HeroTitle from "./themes/HeroTitle";
import EventItem from "./components/EventItem";
import PostItem from "./components/PostItem";
import Socials from "./components/Socials";

// Content only changes on deploy, but "upcoming" vs "past" depends on the
// clock — regenerate the page every 15 minutes so it stays accurate.
export const revalidate = 900;

export default function Home() {
  const { upcoming, past } = splitEvents();
  const countdown = activeCountdown();
  const posts = sortedPosts().slice(0, 10);
  const theme = THEMES[site.theme];

  return (
    <>
      {site.announcement && (
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
      )}

      <header className="site-header">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5 font-display font-semibold">
            <Logo className="relative size-8 overflow-hidden rounded-lg" sizes="32px" />
            {site.hero.title}
          </a>
          <nav className="flex items-center gap-1 text-sm sm:gap-4">
            <a href="#events" className="hidden text-muted hover:text-fg sm:inline">Events</a>
            <a href="#updates" className="hidden text-muted hover:text-fg sm:inline">Updates</a>
            <a href="#links" className="hidden text-muted hover:text-fg sm:inline">Links</a>
            <Socials socials={site.socials} />
          </nav>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="hero relative overflow-hidden">
          <Decor theme={site.theme} />
          <div className="relative mx-auto flex max-w-5xl flex-col gap-10 px-4 pt-16 pb-24 sm:px-6 sm:pt-24 sm:pb-32 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-start gap-8">
              <p className="hero-eyebrow">
                {theme.season} {site.theme !== "midnight" && currentYear()}
              </p>
              <div>
                <HeroTitle theme={site.theme} title={site.hero.title} />
                <p className="hero-tagline mt-5 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">{site.hero.tagline}</p>
              </div>

              {countdown ? (
                <div className="countdown-box">
                  <p className="text-sm tracking-[0.2em] text-muted uppercase">Counting down to</p>
                  <p className="mt-1 font-display text-xl font-semibold sm:text-2xl">{countdown.label}</p>
                  <p className="text-sm text-muted">
                    {longDate(countdown.target)} · {time(countdown.target)}
                  </p>
                  <div className="mt-6">
                    <Countdown target={countdown.target} />
                  </div>
                  {countdown.link && (
                    <a href={countdown.link} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6">
                      Learn more <IconArrowUpRight size={16} />
                    </a>
                  )}
                </div>
              ) : (
                <a href="#updates" className="btn-primary">
                  See what we&apos;re up to
                </a>
              )}
            </div>

            <Logo className="hero-logo order-first lg:order-none" sizes="(min-width: 1024px) 288px, 160px" priority />
          </div>
        </section>

        <div className="mx-auto grid max-w-5xl gap-16 px-4 pb-24 sm:px-6 lg:grid-cols-[1fr_20rem] lg:gap-12">
          {/* Events */}
          <section id="events" className="min-w-0">
            <SectionTitle>Upcoming events</SectionTitle>
            {upcoming.length ? (
              <ul className="flex flex-col gap-4">
                {upcoming.map((e) => (
                  <EventItem key={e.id} event={e} />
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl border border-dashed border-line p-6 text-muted">
                Nothing on the calendar right now — new events are announced here and on our socials first.
              </p>
            )}

            {past.length > 0 && (
              <details className="group mt-8">
                <summary className="cursor-pointer text-sm text-muted hover:text-fg">
                  Past events ({past.length})
                </summary>
                <ul className="mt-2 divide-y divide-line">
                  {past.map((e) => (
                    <EventItem key={e.id} event={e} past />
                  ))}
                </ul>
              </details>
            )}
          </section>

          <div className="flex flex-col gap-16">
            {/* Links */}
            {site.links.length > 0 && (
              <section id="links">
                <SectionTitle>Links</SectionTitle>
                <ul className="flex flex-col gap-2">
                  {site.links.map((l) => (
                    <li key={l.id}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card link-card flex items-center justify-between px-4 py-3 transition hover:text-accent"
                      >
                        {l.label}
                        <IconArrowUpRight size={18} className="shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Updates */}
            <section id="updates">
              <SectionTitle>Updates</SectionTitle>
              {posts.length ? (
                <ul className="-mt-5 divide-y divide-line">
                  {posts.map((p) => (
                    <PostItem key={p.id} post={p} />
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No updates yet.</p>
              )}
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:px-6">
          <p>DePaul AI · a student organization at DePaul University, Chicago</p>
          <Socials socials={site.socials} />
        </div>
      </footer>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="section-title">{children}</h2>;
}
