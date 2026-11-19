"use client";

import { useState } from "react";

/**
 * Switches the events section between upcoming and past events. Both lists
 * are rendered on the server and passed in; this only toggles which shows.
 */
export default function EventsTabs({
  upcoming,
  past,
  pastCount,
}: {
  upcoming: React.ReactNode;
  past: React.ReactNode;
  pastCount: number;
}) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const tabClass = (active: boolean) =>
    `section-title cursor-pointer transition ${active ? "" : "opacity-45 hover:opacity-80"}`;

  return (
    <>
      <div role="tablist" className="flex flex-wrap items-baseline gap-x-4">
        <button role="tab" aria-selected={tab === "upcoming"} className={tabClass(tab === "upcoming")} onClick={() => setTab("upcoming")}>
          Upcoming events
        </button>
        {pastCount > 0 && (
          <button role="tab" aria-selected={tab === "past"} className={tabClass(tab === "past")} onClick={() => setTab("past")}>
            Past events
          </button>
        )}
      </div>
      <div role="tabpanel">{tab === "upcoming" ? upcoming : past}</div>
    </>
  );
}
