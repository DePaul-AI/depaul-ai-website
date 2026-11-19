import type { ThemeId } from "@/lib/themes";

/**
 * Decorative layer behind the hero, one per theme. Purely visual, so it's
 * hidden from screen readers. Themes without an entry get the soft glow.
 */
export default function Decor({ theme }: { theme: ThemeId }) {
  const Layer = LAYERS[theme] ?? Glow;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      <Layer />
    </div>
  );
}

const LAYERS: Partial<Record<ThemeId, () => React.ReactNode>> = {
  fall: Fall,
  winter: Winter,
  spring: Spring,
};

function Glow() {
  return <div className="glow" />;
}

/** Newspaper clippings, tape, halftone and an ink stamp. */
function Fall() {
  const lines = (n: number) =>
    Array.from({ length: n }, (_, i) => <span key={i} style={{ width: `${100 - ((i * 37) % 30)}%` }} />);
  return (
    <>
      <div className="fall-clip right-[-2rem] top-10 w-72 rotate-[5deg] max-lg:hidden">
        <p className="fall-masthead">The DePaul Dispatch</p>
        <p className="fall-headline">Students Teach Machines, Machines Return Favor</p>
        <div className="fall-cols">
          <div>{lines(9)}</div>
          <div>{lines(9)}</div>
        </div>
      </div>
      <div className="fall-clip bottom-16 right-[18%] w-48 -rotate-[8deg] max-lg:hidden">
        <p className="fall-headline text-base">EXTRA! EXTRA!</p>
        <div className="fall-cols">
          <div>{lines(5)}</div>
        </div>
      </div>
      <div className="fall-halftone left-[-4rem] top-[45%] size-56" />
      <div className="fall-halftone right-[35%] top-[-3rem] size-40 max-sm:hidden" />
      <div className="fall-tape right-28 top-8 w-28 rotate-[-18deg] max-lg:hidden" />
      <div className="fall-tape bottom-40 right-[24%] w-24 rotate-[12deg] max-lg:hidden" />
      <div className="fall-stamp right-[8%] bottom-10">
        <span>Fall · Quarter</span>
        <strong>DAI</strong>
        <span>Chicago · IL</span>
      </div>
    </>
  );
}

/** Morphing chrome blobs over a fading cyber grid, with HUD readouts. */
function Winter() {
  return (
    <>
      <div className="winter-grid" />
      <div className="winter-blob right-[-9rem] top-[-7rem] size-60 sm:right-[-6rem] sm:top-[-4rem] sm:size-[26rem]" />
      <div className="winter-blob winter-blob-2 bottom-[6%] left-[-6rem] size-64 max-sm:hidden" />
      <div className="winter-blob winter-blob-3 right-[30%] top-[55%] size-24 max-md:hidden" />
      <div className="winter-hud left-4 top-4 sm:left-6">SYS.STATUS // ONLINE</div>
      <div className="winter-hud right-4 bottom-6 text-right sm:right-6 max-sm:hidden">
        41.8781° N · 87.6298° W<br />
        NODE: DEPAUL-AI / WNTR
      </div>
      <div className="winter-scan" />
    </>
  );
}

/** A burst of saturated color, confetti and squiggles. */
function Spring() {
  const pops = ["#ff2d87", "#ffd400", "#00b8ff", "#3ddc84", "#ff8a00", "#8b5cf6"];
  // Fixed positions so server and client render the same thing.
  const confetti = [
    [8, 18, 0], [22, 70, 1], [35, 12, 2], [48, 82, 3], [62, 8, 4], [74, 60, 5], [86, 26, 0], [93, 78, 1],
    [15, 45, 2], [55, 40, 3], [80, 90, 4], [40, 95, 5], [68, 30, 1], [5, 85, 3],
  ];
  return (
    <>
      <div className="spring-burst" />
      <svg className="spring-star right-[6%] top-[12%] size-40 max-sm:hidden" viewBox="0 0 100 100">
        <polygon
          points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35"
          fill="#ffd400"
          stroke="#1d1030"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
      <svg className="spring-squiggle bottom-[18%] right-[30%] w-48 max-md:hidden" viewBox="0 0 200 40">
        <path d="M5 20 Q 25 0 45 20 T 85 20 T 125 20 T 165 20 T 195 20" fill="none" stroke="#00b8ff" strokeWidth="8" strokeLinecap="round" />
      </svg>
      {confetti.map(([x, y, c], i) => (
        <span
          key={i}
          className={`spring-confetti spring-confetti-${i % 3}`}
          style={{ left: `${x}%`, top: `${y}%`, background: pops[c], rotate: `${i * 47}deg` }}
        />
      ))}
    </>
  );
}
