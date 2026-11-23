import Link from "next/link";
import { IconArrowRight, IconArrowUpRight } from "@tabler/icons-react";
import { activeCountdown, sortedPosts, splitEvents } from "@/lib/content";
import { getContent } from "@/lib/content/live";
import { longDate, time } from "@/lib/format";
import { THEMES } from "@/themes";
import { HERO } from "@/themes/hero";
import Countdown from "./components/Countdown";
import Logo from "./components/Logo";
import EventItem from "./components/EventItem";
import EventsTabs from "./components/EventsTabs";
import PostItem from "./components/PostItem";
import { Banner, SectionTitle, SiteFooter, SiteHeader } from "./components/SiteChrome";

// Content changes refresh the page immediately (see lib/content/live.ts).
// "Upcoming" vs "past" also depends on the clock, so the page regenerates
// every 15 minutes regardless.
export const revalidate = 900;

/** How many updates the homepage shows before "View all updates". */
const HOME_POSTS = 3;

export default async function Home() {
  const content = await getContent();
  const { site } = content;
  const { upcoming, past } = splitEvents(content.events);
  const countdown = activeCountdown(content);
  const allPosts = sortedPosts(content.posts);
  // The homepage shows the newest few; the rest live on /updates.
  const posts = allPosts.slice(0, HOME_POSTS);
  const theme = THEMES[site.theme];
  const { Decor, Title } = HERO[site.theme] ?? {};

  return (
    <>
      <Banner site={site} />
      <SiteHeader site={site} />

      <main id="top">
        {/* Hero */}
        <section className="hero relative overflow-hidden">
          {Decor && (
            <div aria-hidden className="hero-decor pointer-events-none absolute inset-0 overflow-hidden select-none">
              <Decor />
            </div>
          )}
          <div className="relative mx-auto flex max-w-5xl flex-col gap-10 px-4 pt-16 pb-24 sm:px-6 sm:pt-24 sm:pb-32 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-start gap-8">
              <p className="hero-eyebrow">
                {theme.season}
              </p>
              <div className="hero-copy">
                {Title ? <Title title={site.hero.title} /> : <h1 className="hero-title">{site.hero.title}</h1>}
                <p className="hero-tagline mt-5 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">{site.hero.tagline}</p>
              </div>

              {countdown ? (
                <div className="countdown-wrap w-full max-w-xl">
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
                </div>
              ) : (
                <a href="#updates" className="btn-primary">
                  See what we&apos;re up to
                </a>
              )}
            </div>

            <Logo site={site} className="hero-logo order-first lg:order-none" sizes="(min-width: 1024px) 288px, 160px" priority />
          </div>
        </section>

        <div className="content-grid mx-auto grid max-w-5xl gap-16 px-4 pb-24 sm:px-6 lg:grid-cols-[1fr_20rem] lg:gap-12">
          {/* Events */}
          <section id="events" className="min-w-0">
            <EventsTabs
              pastCount={past.length}
              upcoming={
                upcoming.length ? (
                  <ul className="flex flex-col gap-4">
                    {upcoming.map((e) => (
                      <EventItem key={e.id} event={e} />
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-2xl border border-dashed border-line p-6 text-muted">
                    Nothing on the calendar right now — new events are announced here and on our socials first.
                  </p>
                )
              }
              past={
                // Each past card is drawn in the theme of the quarter it happened in.
                <ul className="flex flex-col gap-4">
                  {past.map((e) => (
                    <EventItem key={e.id} event={e} past />
                  ))}
                </ul>
              }
            />
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
                <>
                  <ul className="-mt-5 divide-y divide-line">
                    {posts.map((p) => (
                      <PostItem key={p.id} post={p} />
                    ))}
                  </ul>
                  {allPosts.length > HOME_POSTS && (
                    <Link href="/updates" className="btn-ghost mt-4">
                      View all {allPosts.length} updates <IconArrowRight size={15} />
                    </Link>
                  )}
                </>
              ) : (
                <p className="text-muted">No updates yet.</p>
              )}
            </section>
          </div>
        </div>
      </main>

      <SiteFooter site={site} />
    </>
  );
}
