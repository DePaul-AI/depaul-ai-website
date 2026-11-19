/* Spring 2026 hero art: watercolor wash (the hero background, see styles.css),
   a strip of torn white paper, a vintage map scrap and a few birds. */

export function Decor() {
  return (
    <>
      <div className="spring-paper-shadow absolute inset-0">
        <div className="spring-tear deckled right-[-10%] top-[58%] h-40 w-[75%] -rotate-[7deg] max-lg:hidden" />
        <div className="spring-map deckled right-[4%] top-[8%] h-52 w-72 rotate-[5deg] max-lg:hidden" />
      </div>
      <svg className="spring-birds left-[44%] top-[12%] w-28 max-md:hidden" viewBox="0 0 120 50" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M8 22q8-9 15 0q7-9 15 0" />
        <path d="M52 10q6-7 12 0q6-7 12 0" />
        <path d="M86 32q5-6 10 0q5-6 10 0" />
      </svg>
      <div className="spring-edge" />
    </>
  );
}

/** "DePaul AI" set in a pink label block, like the flyers' "DePaul AI Recap". */
export function Title({ title }: { title: string }) {
  return (
    <h1 className="hero-title">
      <span className="label-block">{title}</span>
    </h1>
  );
}
