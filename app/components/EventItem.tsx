import { IconCalendarPlus, IconMapPin, IconArrowUpRight } from "@tabler/icons-react";
import type { SiteEvent } from "@/lib/content";
import { dayOfMonth, googleCalendarUrl, monthShort, timeRange, weekday, longDate } from "@/lib/format";

export default function EventItem({ event, past = false }: { event: SiteEvent; past?: boolean }) {
  if (past) {
    return (
      <li className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:gap-4">
        <span className="w-36 shrink-0 text-sm text-muted">{longDate(event.start)}</span>
        <span className="text-fg">
          {event.link ? (
            <a href={event.link} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
              {event.title}
            </a>
          ) : (
            event.title
          )}
        </span>
      </li>
    );
  }

  return (
    <li className="flex gap-4 rounded-2xl border border-line bg-surface p-4 sm:gap-6 sm:p-6">
      <div className="flex w-14 shrink-0 flex-col items-center self-start rounded-xl border border-line py-2 sm:w-16">
        <span className="text-xs font-medium uppercase tracking-widest text-accent">{monthShort(event.start)}</span>
        <span className="text-2xl font-semibold tabular-nums sm:text-3xl">{dayOfMonth(event.start)}</span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold leading-snug sm:text-xl">{event.title}</h3>
        <p className="mt-1 text-sm text-muted">
          {weekday(event.start)} · {timeRange(event)}
        </p>
        {event.location && (
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <IconMapPin size={15} className="shrink-0" />
            {event.location}
          </p>
        )}
        {event.description && <p className="mt-3 whitespace-pre-line leading-relaxed">{event.description}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          {event.link && (
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-fg transition hover:opacity-90"
            >
              RSVP / details <IconArrowUpRight size={15} />
            </a>
          )}
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-line px-4 py-1.5 text-sm text-muted transition hover:border-fg/40 hover:text-fg"
          >
            <IconCalendarPlus size={15} /> Add to calendar
          </a>
        </div>
      </div>
    </li>
  );
}
