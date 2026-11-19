import { defineTheme } from "../types";

// Liquid metal with a cyber edge: blue, silver, white.
export default defineTheme({
  label: "Winter 2027",
  season: "Winter Quarter 2027",
  // TODO: confirm against DePaul's official academic calendar.
  dates: { start: "2027-01-04", end: "2027-03-20" },
  scheme: "dark",
  background: "#05080f",
  logo: "/themes/winter-2027/logo.svg",
});
