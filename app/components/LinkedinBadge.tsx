import React from "react";
import { IconBrandLinkedin } from "@tabler/icons-react";

type LinkedInBadgeProps = {
  username: string;
};

function LinkedinBadge({ username }: LinkedInBadgeProps) {
  return (
    <div>
      <a
        href={`https://linkedin.com/company/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm text-white/70 transition hover:border-white/40 hover:text-white"
      >
        <IconBrandLinkedin size={16} />
        LinkedIn
      </a>
    </div>
  );
}

export default LinkedinBadge;
