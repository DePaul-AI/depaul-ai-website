import { defineTheme } from "../types";

// Clipping on a grid: modern sans type and brand maroon, with one torn paper
// moment per section. After DAI Spaces "Fall In To Conversation" (torn paper
// taped over an autumn forest) and DAI Refresh "Study Session". Keeps a little
// of the old collage version's distortion: torn, tilted label blocks.
export default defineTheme({
  label: "Fall 2026",
  season: "Fall Quarter 2026",
  // DePaul Autumn Quarter 2026: Discover Chicago immersion week through finals.
  dates: { start: "2026-08-31", end: "2026-11-24" },
  scheme: "light",
  background: "#ebe4d6",
  logo: "/themes/fall-2026/logo.png",
});
