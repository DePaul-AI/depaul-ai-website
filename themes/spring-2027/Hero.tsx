/* Spring 2027 hero art. See themes/README.md for how hero art works. */

/** A burst of saturated color, confetti and squiggles. */
export function Decor() {
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
