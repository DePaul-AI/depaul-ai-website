import Image from "next/image";
import { IconArrowUpRight } from "@tabler/icons-react";
import type { Post } from "@/lib/content";
import { shortDate } from "@/lib/format";

export default function PostItem({ post }: { post: Post }) {
  const title = post.link ? (
    <a href={post.link} target="_blank" rel="noopener noreferrer" className="group inline-flex items-start gap-1 hover:text-accent">
      {post.title}
      <IconArrowUpRight size={18} className="mt-1 shrink-0 text-muted group-hover:text-accent" />
    </a>
  ) : (
    post.title
  );

  return (
    <li className="post py-5">
      {post.image && (
        <a href={post.link ?? post.image} target="_blank" rel="noopener noreferrer" className="media mb-3 block aspect-video w-full">
          <Image src={post.image} alt="" fill sizes="(min-width: 1024px) 320px, 100vw" className="object-cover" />
        </a>
      )}
      <time dateTime={post.date} className="text-sm text-muted">
        {shortDate(post.date)}
      </time>
      <h3 className="mt-1 font-display text-lg leading-snug font-semibold">{title}</h3>
      {post.body && <p className="mt-2 leading-relaxed whitespace-pre-line text-fg/85">{post.body}</p>}
    </li>
  );
}
