import Link from "next/link";
import type { Metadata } from "next";
import { IconArrowLeft } from "@tabler/icons-react";
import { sortedPosts } from "@/lib/content";
import { getContent } from "@/lib/content/live";
import PostItem from "../components/PostItem";
import { Banner, SectionTitle, SiteFooter, SiteHeader } from "../components/SiteChrome";

// Same refresh rules as the homepage: Slack changes appear immediately.
export const revalidate = 900;

export const metadata: Metadata = {
  title: "Updates · DePaul AI",
  description: "Every DePaul AI update, newest first.",
};

/** Every update, newest first, as a grid of cards. */
export default async function UpdatesPage() {
  const { site, posts } = await getContent();
  const all = sortedPosts(posts);

  return (
    <>
      <Banner site={site} />
      <SiteHeader site={site} />

      <main className="mx-auto max-w-5xl px-4 pt-10 pb-24 sm:px-6 sm:pt-14">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
          <IconArrowLeft size={15} /> Back to home
        </Link>

        <div className="mt-6 flex flex-wrap items-baseline gap-x-4">
          <SectionTitle as="h1">All updates</SectionTitle>
          <p className="mb-6 text-sm text-muted">
            {all.length} update{all.length === 1 ? "" : "s"}, newest first
          </p>
        </div>

        {all.length ? (
          <ul className="updates-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {all.map((p) => (
              <PostItem key={p.id} post={p} variant="card" />
            ))}
          </ul>
        ) : (
          <p className="text-muted">No updates yet.</p>
        )}
      </main>

      <SiteFooter site={site} />
    </>
  );
}
