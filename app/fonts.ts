import {
  Abril_Fatface,
  Anton,
  Bricolage_Grotesque,
  Geist,
  Geist_Mono,
  Newsreader,
  Old_Standard_TT,
  Special_Elite,
  Unbounded,
} from "next/font/google";

/**
 * Every theme picks its fonts in themes/<quarter>/styles.css using these CSS
 * variables. Browsers only download the fonts the active theme uses.
 */
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], preload: false });
const abril = Abril_Fatface({ variable: "--font-abril", weight: "400", subsets: ["latin"], preload: false });
const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"], preload: false });
const oldStandard = Old_Standard_TT({ variable: "--font-old-standard", weight: ["400", "700"], subsets: ["latin"], preload: false });
const specialElite = Special_Elite({ variable: "--font-special-elite", weight: "400", subsets: ["latin"], preload: false });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], preload: false });
const unbounded = Unbounded({ variable: "--font-unbounded", subsets: ["latin"], preload: false });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], preload: false });

export const fontVariables = [geist, geistMono, abril, anton, oldStandard, specialElite, newsreader, unbounded, bricolage]
  .map((f) => f.variable)
  .join(" ");
