/* Spring 2026 hero art: the soft pastel color field from the Spring 2026 logo. */

const BLOBS = [
  { color: "var(--pastel-blue)", x: "8%", y: "6%", size: "34rem" },
  { color: "var(--pastel-pink)", x: "62%", y: "-8%", size: "30rem" },
  { color: "var(--pastel-green)", x: "34%", y: "42%", size: "32rem" },
  { color: "var(--pastel-yellow)", x: "78%", y: "48%", size: "24rem" },
  { color: "var(--pastel-lilac)", x: "-6%", y: "52%", size: "26rem" },
];

export function Decor() {
  return (
    <>
      {BLOBS.map((b, i) => (
        <span
          key={i}
          className="pastel-blob"
          style={{ background: b.color, left: b.x, top: b.y, width: b.size, height: b.size, animationDelay: `${i * -4}s` }}
        />
      ))}
      <div className="pastel-grain" />
    </>
  );
}
