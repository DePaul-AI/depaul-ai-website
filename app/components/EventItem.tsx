import Image from "next/image";
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
    <li className="card flex flex-col gap-4 p-4 sm:flex-row sm:gap-6 sm:p-6">
      <div className="flex min-w-0 flex-1 gap-4 sm:gap-6">
        <div className="date-tile">
          <span className="text-xs font-medium tracking-widest text-accent uppercase">{monthShort(event.start)}</span>
          <span className="text-2xl font-semibold tabular-nums sm:text-3xl">{dayOfMonth(event.start)}</span>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg leading-snug font-semibold sm:text-xl">{event.title}</h3>
          <p className="mt-1 text-sm text-muted">
            {weekday(event.start)} · {timeRange(event)}
          </p>
          {event.location && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              <IconMapPin size={15} className="shrink-0" />
              {event.location}
            </p>
          )}
          {event.description && <p className="mt-3 leading-relaxed whitespace-pre-line">{event.description}</p>}

          <div className="mt-4 flex flex-wrap gap-2">
            {event.link && (
              <a href={event.link} target="_blank" rel="noopener noreferrer" className="btn-primary">
                RSVP / details <IconArrowUpRight size={15} />
              </a>
            )}
            <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <IconCalendarPlus size={15} /> Add to calendar
            </a>
          </div>
        </div>
      </div>

      {event.image && (
        <a
          href={event.image}
          target="_blank"
          rel="noopener noreferrer"
          className="media aspect-[4/5] w-full shrink-0 self-start sm:w-40"
          aria-label={`Open the flyer for ${event.title}`}
        >
          <Image src={event.image} alt="" fill sizes="(min-width: 640px) 160px, 100vw" className="object-cover" />
        </a>
      )}
    </li>
  );
}
