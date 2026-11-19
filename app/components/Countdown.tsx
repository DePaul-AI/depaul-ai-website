"use client";

import { useSyncExternalStore } from "react";

// A shared one-second clock. The server snapshot is null so the first render
// matches the (possibly cached) HTML, then the real numbers fill in.
function subscribe(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}
const nowSeconds = () => Math.floor(Date.now() / 1000);
const serverSnapshot = () => null;

export default function Countdown({ target }: { target: string }) {
  const now = useSyncExternalStore(subscribe, nowSeconds, serverSnapshot);
  const remaining = now === null ? null : Math.max(0, Math.floor(Date.parse(target) / 1000) - now);

  if (remaining === 0) {
    return <p className="font-mono text-2xl text-accent sm:text-3xl">Happening now</p>;
  }

  const units = [
    { label: "days", value: remaining === null ? null : Math.floor(remaining / 86400) },
    { label: "hours", value: remaining === null ? null : Math.floor(remaining / 3600) % 24 },
    { label: "min", value: remaining === null ? null : Math.floor(remaining / 60) % 60 },
    { label: "sec", value: remaining === null ? null : remaining % 60 },
  ];

  return (
    <div className="flex gap-3 sm:gap-5" role="timer" aria-live="off">
      {units.map((u) => (
        <div key={u.label} className="flex min-w-14 flex-col items-center sm:min-w-20">
          <span className="font-mono text-4xl font-medium tabular-nums text-accent sm:text-6xl">
            {u.value === null ? "--" : String(u.value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
