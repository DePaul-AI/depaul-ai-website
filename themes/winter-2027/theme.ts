import { defineTheme } from "../types";

// Cobalt print x liquid metal: white page, ink-blue type, glitch slices,
// pixel scatter and blue-steel chrome tendrils. Open Sauce for the wordmark,
// a tall stretched Bodoni on section titles and digits.
export default defineTheme({
  label: "Winter 2027",
  season: "Winter Quarter 2027",
  // DePaul Winter Quarter 2027: first day of classes through finals.
  dates: { start: "2027-01-04", end: "2027-03-20" },
  scheme: "light",
  background: "#f3f4ff",
  logo: "/themes/winter-2027/logo.svg",
});
