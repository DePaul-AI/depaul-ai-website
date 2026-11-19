/* Winter 2027 hero art. See themes/README.md for how hero art works. */

/** Morphing chrome blobs over a fading cyber grid, with HUD readouts. */
export function Decor() {
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
