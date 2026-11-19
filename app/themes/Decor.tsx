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

/**
 * Torn-paper collage: autumn foliage (the hero background, see fall.css),
 * a sweep of black construction paper, a torn magazine page and cobalt scraps.
 */
function Fall() {
  return (
    <>
      <svg className="fall-black" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <path d={BLACK_PAPER} fill="#16130f" />
      </svg>
      <div className="fall-shadow absolute top-[12%] right-[-1.5rem] w-80 rotate-[4deg] max-lg:hidden">
        <div className="fall-magazine torn relative">
          <p>
            <span className="dropcap">W</span>hen the leaves turn, the library fills up. Somewhere on the third
            floor, a group of students is teaching a model to read handwriting, arguing about attention heads, and
            ordering one more pizza than they need.
          </p>
          <p>
            &ldquo;Nobody here started as an expert,&rdquo; one of them says. &ldquo;That&rsquo;s kind of the
            point.&rdquo; By midnight the demo works. Mostly.
          </p>
        </div>
      </div>
      <div className="fall-shadow absolute bottom-[14%] right-[30%] max-lg:hidden">
        <div className="fall-scrap torn h-16 w-28 rotate-[-8deg]" />
      </div>
      <div className="fall-shadow absolute top-[8%] left-[56%] max-md:hidden">
        <div className="fall-scrap torn h-10 w-20 rotate-[12deg]" style={{ background: "#f6efe1" }} />
      </div>
      <div className="fall-tear-rim" />
      <div className="fall-tear" />
    </>
  );
}

/** A torn edge that sweeps from the top-middle down to the bottom-left, like the collage. */
const BLACK_PAPER = (() => {
  let seed = 9;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pts: string[] = ["0 0"];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Cubic curve from (980, 0) to (430, 1000), bowing to the right.
    const x = (1 - t) ** 3 * 980 + 3 * (1 - t) ** 2 * t * 1050 + 3 * (1 - t) * t ** 2 * 380 + t ** 3 * 430;
    const y = t * 1000;
    const jag = (rnd() - 0.5) * 16 + (rnd() < 0.15 ? (rnd() - 0.5) * 30 : 0);
    pts.push(`${(x + jag).toFixed(1)} ${y.toFixed(1)}`);
  }
  pts.push("0 1000");
  return "M" + pts.join("L") + "Z";
})();

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
