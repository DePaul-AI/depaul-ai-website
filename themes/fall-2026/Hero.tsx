/* Fall 2026 hero art. See themes/README.md for how hero art works. */

/**
 * Clipping on a grid: autumn foliage (the hero background, see styles.css)
 * with one torn cream sheet holding the copy, a magazine scrap behind the
 * polaroid logo, a terracotta cut-paper circle and a hand-drawn arrow.
 */
export function Decor() {
  return (
    <>
      <svg className="fall-sheet" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden>
        <path d={SHEET} fill="#f6efe1" />
      </svg>
      <svg
        className="fall-arrow top-[11%] left-[60%] w-32 max-lg:hidden"
        viewBox="0 0 130 40"
        aria-hidden
      >
        <path d="M4 26 C 30 18, 70 30, 118 16" />
        <path d="M104 8 L119 16 L106 27" />
      </svg>
      <div className="fall-dot bottom-[12%] right-[30%] h-28 w-28 max-lg:hidden" aria-hidden />
      <div className="fall-shadow absolute top-[12%] right-[-1.5rem] w-80 rotate-[3deg] max-lg:hidden" aria-hidden>
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
      <div className="fall-tear-rim" />
      <div className="fall-tear" />
    </>
  );
}

/** A torn edge that sweeps from the top-middle down to the bottom-left. */
const SHEET = (() => {
  let seed = 9;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pts: string[] = ["0 0"];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Cubic curve from (980, 0) to (560, 1000), bowing to the right.
    const x = (1 - t) ** 3 * 980 + 3 * (1 - t) ** 2 * t * 1040 + 3 * (1 - t) * t ** 2 * 520 + t ** 3 * 560;
    const y = t * 1000;
    const jag = (rnd() - 0.5) * 12 + (rnd() < 0.12 ? (rnd() - 0.5) * 24 : 0);
    pts.push(`${(x + jag).toFixed(1)} ${y.toFixed(1)}`);
  }
  pts.push("0 1000");
  return "M" + pts.join("L") + "Z";
})();

/** The site title on a solid maroon label block, like the DAI logo. */
export function Title({ title }: { title: string }) {
  return (
    <h1 className="hero-title">
      <span className="hero-title-block">{title}</span>
    </h1>
  );
}
