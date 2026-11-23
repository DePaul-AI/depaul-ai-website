import Image from "next/image";
import { IconArrowUpRight } from "@tabler/icons-react";
import type { Post } from "@/lib/content";
import { shortDate } from "@/lib/format";

/**
 * An update. `list` is the compact form in the homepage sidebar; `card` is
 * the boxed form used in the grid on /updates.
 */
export default function PostItem({ post, variant = "list" }: { post: Post; variant?: "list" | "card" }) {
  const card = variant === "card";
  const title = post.link ? (
    <a href={post.link} target="_blank" rel="noopener noreferrer" className="group inline-flex items-start gap-1 hover:text-accent">
      {post.title}
      <IconArrowUpRight size={18} className="mt-1 shrink-0 text-muted group-hover:text-accent" />
    </a>
  ) : (
    post.title
  );

  const content = (
    <>
      {post.image && (
        <a href={post.link ?? post.image} target="_blank" rel="noopener noreferrer" className="media mb-3 block aspect-video w-full">
          <Image
            src={post.image}
            alt=""
            fill
            sizes={card ? "(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw" : "(min-width: 1024px) 320px, 100vw"}
            className="object-cover"
          />
        </a>
      )}
      <time dateTime={post.date} className="text-sm text-muted">
        {shortDate(post.date)}
      </time>
      <h3 className="mt-1 font-display text-lg leading-snug font-semibold">{title}</h3>
      {post.body && <p className="mt-2 leading-relaxed whitespace-pre-line text-fg/85">{post.body}</p>}
    </>
  );

  if (card) {
    return (
      <li className="flex">
        <article className="card post post-card flex w-full flex-col p-4 sm:p-5">{content}</article>
      </li>
    );
  }
  return <li className="post py-5">{content}</li>;
}
