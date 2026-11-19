/* Fall 2026 hero art. See themes/README.md for how hero art works. */

/**
 * Torn-paper collage: autumn foliage (the hero background, see styles.css),
 * a sweep of black construction paper, a torn magazine page and cobalt scraps.
 */
export function Decor() {
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

/** The site title cut out as ransom-note letters from white and cobalt paper. */
export function Title({ title }: { title: string }) {
  let n = 0;
  return (
    <h1 className="hero-title" aria-label={title}>
      {title.split(" ").map((word, w) => (
        <span key={w} aria-hidden className="ransom-word">
          {[...word].map((ch) => (
            <span key={n} className={`ransom ransom-${n++ % 6}`}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
