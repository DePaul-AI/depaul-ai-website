import type { ThemeId } from "@/lib/themes";

/** The big site title. Fall cuts it into ransom-note letters; other themes style it in CSS. */
export default function HeroTitle({ theme, title }: { theme: ThemeId; title: string }) {
  if (theme === "fall") {
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
  return (
    <h1 className="hero-title" data-text={title}>
      {title}
    </h1>
  );
}
