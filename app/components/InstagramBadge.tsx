import React from "react";
import { IconBrandInstagram } from "@tabler/icons-react";

type InstagramBadgeProps = {
  username: string;
};

function InstagramBadge({ username }: InstagramBadgeProps) {
  return (
    <div>
      <a
        href={`https://www.instagram.com/${username}/`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm text-white/70 transition hover:border-white/40 hover:text-white"
      >
        <IconBrandInstagram size={16} />
        Instagram
      </a>
    </div>
  );
}

export default InstagramBadge;
