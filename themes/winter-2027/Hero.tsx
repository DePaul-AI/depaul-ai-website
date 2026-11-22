/* Winter 2027 hero art. See themes/README.md for how hero art works. */
import type { CSSProperties } from "react";

/**
 * Liquid-metal tone against the white page.
 *   "steel"    dark blue-steel (default)
 *   "graphite" neutral grey
 * Swap TONE to change it; nothing else needs to move.
 */
const TONE: "steel" | "graphite" = "steel";

const METAL = {
  steel: {
    tint: "0.30 0 0 0 0.02  0 0.38 0 0 0.04  0 0 0.64 0 0.09  0 0 0 1 0",
    rim: "#8ea2ff",
  },
  graphite: {
    tint: "0.46 0 0 0 0.01  0 0.47 0 0 0.01  0 0 0.52 0 0.02  0 0 0 1 0",
    rim: "#ffffff",
  },
}[TONE];

/*
 * Tendril geometry. Tapered spikes and S-curls, baked as paths so server and
 * client render identical markup. The whole group is filled flat white; the
 * SVG filter below turns the silhouette into chrome (blur -> threshold ->
 * height map -> lighting -> banding), then the warp filter keeps it moving.
 */
type Burst = { cx: number; cy: number; r: number; d: string[] };

const MAIN: Burst = { cx: 1150, cy: 390, r: 48, d: [
    "M1155,416 1177,409 1200,402 1222,396 1245,391 1268,387 1290,383 1314,381 1337,381 1360,383 1384,386 1408,392 1431,401 1455,412 1477,427 1499,444 1500,443 1479,425 1457,409 1434,396 1411,385 1387,376 1363,370 1339,365 1314,361 1290,359 1265,358 1241,358 1217,359 1193,361 1169,362 1145,364Z",
    "M1140,415 1164,421 1187,428 1210,435 1231,444 1252,455 1272,468 1290,484 1307,503 1321,526 1331,552 1338,581 1340,614 1335,649 1323,687 1303,725 1305,726 1325,687 1338,650 1345,614 1346,580 1342,549 1333,520 1321,494 1306,471 1289,450 1269,432 1248,416 1227,401 1204,388 1182,376 1160,365Z",
    "M1128,403 1140,418 1153,434 1167,449 1183,463 1200,476 1220,486 1242,493 1266,495 1292,493 1319,485 1347,470 1373,448 1397,418 1417,380 1430,333 1429,333 1415,379 1394,416 1369,444 1343,464 1316,475 1290,480 1268,479 1248,474 1231,465 1216,454 1205,441 1195,427 1186,411 1179,395 1172,377Z",
    "M1127,389 1128,406 1129,423 1130,440 1129,456 1127,472 1123,489 1117,504 1109,520 1098,534 1083,548 1066,559 1046,568 1022,574 995,576 965,573 965,574 995,578 1022,577 1047,573 1069,565 1089,555 1106,543 1120,529 1133,513 1143,497 1151,480 1157,462 1162,444 1167,426 1170,409 1173,391Z",
    "M1122,379 1119,396 1115,411 1111,426 1105,440 1097,453 1087,465 1073,475 1057,483 1037,487 1014,486 989,480 962,466 936,445 913,414 895,375 893,376 911,416 934,447 959,471 985,488 1012,498 1037,502 1061,501 1083,496 1102,487 1119,476 1134,462 1147,447 1158,432 1168,416 1178,401Z",
    "M1142,367 1121,376 1100,387 1078,399 1058,412 1038,429 1021,449 1007,471 997,498 992,527 992,560 999,595 1015,631 1040,667 1075,702 1121,732 1122,731 1076,700 1043,665 1020,628 1006,592 1002,559 1004,529 1012,503 1024,481 1039,463 1055,449 1074,438 1094,430 1114,423 1136,418 1158,413Z",
    "M1150,365 1133,367 1116,369 1099,370 1083,369 1067,366 1051,361 1035,352 1021,340 1008,323 999,302 993,277 993,248 999,216 1014,182 1038,148 1037,147 1012,181 996,215 988,247 986,278 989,305 997,329 1009,350 1023,367 1039,381 1057,391 1075,399 1094,405 1113,409 1132,412 1150,415Z",
    "M1160,360 1135,355 1110,350 1083,346 1057,344 1029,345 1002,349 974,357 947,369 922,386 898,408 877,436 860,470 848,509 842,555 845,605 846,605 845,555 852,510 866,472 885,441 907,417 931,399 956,387 981,380 1005,378 1029,379 1052,384 1074,391 1096,399 1118,409 1140,420Z",
    "M1173,376 1159,359 1144,341 1130,323 1115,306 1099,289 1082,273 1065,258 1046,244 1026,231 1005,219 983,210 959,202 934,197 908,194 880,194 880,196 908,197 934,201 958,208 980,217 1000,229 1019,242 1036,257 1051,272 1064,289 1077,307 1088,325 1099,344 1109,364 1118,384 1127,404Z",
    "M1173,386 1168,370 1163,354 1160,338 1157,323 1156,307 1158,291 1161,274 1168,258 1178,243 1192,228 1211,215 1233,205 1260,199 1290,198 1323,203 1324,202 1290,196 1259,196 1232,200 1207,209 1187,221 1170,234 1156,250 1145,267 1137,285 1131,303 1128,322 1126,340 1126,359 1126,377 1127,394Z",
    "M1175,410 1184,394 1193,379 1203,364 1214,352 1226,340 1241,331 1258,324 1277,321 1299,322 1322,329 1347,342 1371,362 1392,390 1409,427 1419,471 1420,471 1411,426 1396,388 1375,358 1352,334 1328,318 1303,307 1278,301 1254,300 1231,304 1210,311 1190,320 1172,332 1156,344 1140,357 1125,370Z",
    "M1161,417 1182,406 1204,394 1225,383 1247,372 1269,362 1291,353 1313,345 1336,337 1360,331 1383,326 1408,323 1432,321 1458,321 1483,322 1509,326 1509,325 1483,320 1458,317 1432,315 1407,314 1382,315 1357,316 1332,319 1308,323 1283,327 1259,332 1235,338 1211,344 1187,350 1163,356 1139,363Z",
  ] };

const SMALL: Burst = { cx: 150, cy: 730, r: 29, d: [
    "M149,750 161,749 173,748 184,748 196,748 207,750 219,752 230,756 240,762 250,770 260,780 268,792 274,807 278,824 279,843 276,864 277,864 281,843 281,824 278,806 273,790 267,775 258,763 248,752 238,743 226,735 214,729 202,724 189,720 176,716 164,713 151,710Z",
    "M136,738 145,749 154,760 163,771 174,781 187,790 200,797 216,802 232,804 250,803 269,798 288,789 307,775 325,755 340,730 351,699 349,699 338,729 322,754 305,772 286,785 267,792 249,795 233,794 219,790 207,784 197,776 189,766 181,756 175,745 169,734 164,722Z",
    "M138,724 134,735 130,745 125,755 119,764 113,773 105,781 95,788 84,793 72,797 57,797 42,795 25,789 8,779 -9,765 -24,745 -25,746 -10,766 6,781 23,793 40,800 57,803 72,804 87,802 100,798 112,792 123,784 132,775 141,766 148,756 155,746 162,736Z",
    "M142,715 135,720 128,726 121,731 113,736 106,741 98,746 91,751 83,755 75,759 67,763 59,766 50,770 41,772 33,774 24,776 24,778 33,776 42,775 51,773 60,772 69,770 78,768 87,765 96,763 105,761 114,758 122,756 131,753 140,750 149,748 158,745Z",
    "M153,711 144,711 135,711 125,712 116,713 106,714 97,716 87,719 78,723 69,727 60,733 52,739 45,747 38,756 32,767 27,778 28,779 34,768 40,758 48,750 56,744 64,740 73,737 82,735 90,734 98,735 107,736 115,738 122,740 130,743 138,746 147,749Z",
    "M164,729 162,721 160,713 159,705 158,697 158,689 158,681 160,674 163,666 167,658 173,651 181,645 190,639 201,635 214,632 229,632 229,631 214,630 201,632 189,636 178,641 169,647 162,653 155,661 150,669 146,678 143,687 141,696 139,705 138,714 137,722 136,731Z",
    "M164,743 169,735 173,727 177,719 181,709 183,700 184,689 183,679 180,668 175,657 168,647 158,638 145,630 129,624 110,622 89,623 89,624 110,624 128,627 143,634 154,643 162,652 166,662 168,671 168,679 166,687 163,693 159,699 154,703 149,708 142,712 136,717Z",
  ] };

const CURLS: string[] = [
  "M842,-38 846,-29 855,-18 866,-7 877,6 885,19 890,31 893,45 894,62 894,79 891,96 887,111 882,122 874,130 864,137 851,142 837,145 824,146 813,146 804,143 796,138 787,131 778,122 768,113 758,104 749,96 739,86 728,76 717,66 705,58 692,53 678,54 667,60 657,67 650,77 646,87 643,99 645,111 649,124 654,137 660,150 667,162 674,171 681,179 689,185 697,189 705,192 713,194 720,194 728,192 733,186 736,181 737,175 738,170 736,167 735,166 730,167 727,171 724,174 722,177 720,178 719,178 716,178 710,177 704,174 697,171 692,167 687,161 681,153 676,142 671,130 667,118 665,108 665,101 667,96 671,91 675,87 680,84 684,83 686,83 690,85 697,91 707,99 717,109 728,119 740,128 750,135 760,143 771,151 783,159 797,165 811,167 826,166 841,163 857,159 872,152 885,143 896,131 903,117 907,99 910,80 910,61 909,43 906,26 898,11 888,-3 875,-16 863,-26 852,-34 843,-39Z",
  "M633,659 642,662 654,663 669,663 684,664 697,667 708,671 719,678 731,688 742,699 751,712 759,724 762,734 763,744 760,755 755,767 749,778 741,787 734,794 727,797 718,800 708,801 697,801 685,802 673,803 661,804 648,804 635,805 622,806 609,808 597,814 589,824 585,835 584,846 586,856 590,866 596,875 605,882 616,887 628,892 641,896 652,900 663,901 672,902 681,900 690,897 697,894 703,890 708,885 711,879 710,872 708,866 706,862 703,859 699,857 698,858 696,861 696,866 697,870 697,874 697,875 696,876 694,878 689,880 684,883 678,885 671,886 664,886 656,884 645,881 634,877 624,872 616,866 611,862 610,857 609,852 609,846 610,841 612,838 614,837 617,836 625,835 637,835 650,834 664,833 676,831 688,829 699,827 712,825 724,822 737,817 747,809 756,799 764,787 771,774 776,760 778,745 777,731 772,717 764,703 753,689 741,677 728,666 715,658 701,653 685,651 669,651 654,652 642,654 633,657Z",
  "M1303,863 1313,867 1328,870 1345,873 1365,874 1384,873 1401,868 1417,859 1434,847 1449,833 1463,817 1474,801 1481,785 1483,768 1481,751 1476,733 1468,717 1460,702 1450,690 1438,680 1424,673 1409,668 1394,665 1380,662 1367,659 1352,656 1336,654 1320,652 1306,650 1296,648 1292,647 1290,645 1288,641 1287,635 1287,628 1288,621 1291,616 1297,611 1307,605 1320,600 1334,595 1347,592 1357,591 1365,591 1373,593 1380,596 1386,599 1391,603 1394,605 1395,606 1395,609 1395,613 1394,618 1393,623 1395,627 1397,628 1401,627 1404,623 1408,618 1410,611 1411,603 1408,595 1402,590 1396,585 1387,580 1378,576 1367,574 1356,573 1343,575 1329,578 1314,582 1299,587 1286,593 1275,600 1267,610 1262,621 1259,634 1259,647 1263,660 1272,672 1285,680 1300,683 1316,686 1332,687 1347,689 1361,691 1375,693 1390,694 1403,696 1416,698 1426,701 1434,706 1443,715 1451,727 1458,740 1463,755 1465,768 1464,780 1459,793 1449,807 1437,820 1423,833 1408,844 1395,852 1381,857 1364,859 1346,859 1329,859 1314,858 1303,861Z",
];

/* Pixel scatter: deterministic (seeded) so there is no hydration mismatch. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PIXEL_COLORS = ["#2a33c9", "#2a33c9", "#9fb0ff", "#111111", "#00a8ff"];
const PIXEL_SIZES = [8, 12, 16, 24, 36];

const PIXELS = (() => {
  const r = rng(27);
  return Array.from({ length: 64 }, () => {
    // Mostly a cluster on the right; the rest hug the bottom edge, clear of the copy.
    const right = r() < 0.82;
    const x = right ? 0.55 + r() * 0.42 : r();
    const y = right ? (r() < 0.6 ? 0.45 + r() * 0.5 : r()) : 0.9 + r() * 0.08;
    return {
      left: `${(x * 100).toFixed(2)}%`,
      top: `${(y * 100).toFixed(2)}%`,
      size: PIXEL_SIZES[Math.floor(r() * PIXEL_SIZES.length)],
      color: PIXEL_COLORS[Math.floor(r() * PIXEL_COLORS.length)],
      delay: `${(r() * 6).toFixed(2)}s`,
      dur: `${(2 + r() * 4).toFixed(2)}s`,
    };
  });
})();

function BurstPaths({ b }: { b: Burst }) {
  return (
    <>
      <circle cx={b.cx} cy={b.cy} r={b.r} />
      {b.d.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </>
  );
}

/**
 * The site title. data-text feeds the glitch slices (::after) in styles.css,
 * so they always match the title.
 */
export function Title({ title }: { title: string }) {
  return (
    <h1 className="hero-title" data-text={title}>
      {title}
    </h1>
  );
}

/** Liquid chrome tendrils, a pixel scatter and a scan tear on a white page. */
export function Decor() {
  return (
    <>
      <svg
        className="winter-metal"
        viewBox="0 0 1440 806"
        preserveAspectRatio="xMaxYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id="winter-chrome"
            filterUnits="userSpaceOnUse"
            x="-240"
            y="-240"
            width="1920"
            height="1286"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
            <feColorMatrix
              in="b"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -12"
              result="goo"
            />
            <feGaussianBlur in="goo" stdDeviation="10" result="h" />
            <feDiffuseLighting in="h" surfaceScale="18" diffuseConstant="1.2" lightingColor="#ffffff" result="dif">
              <feDistantLight azimuth="235" elevation="36" />
            </feDiffuseLighting>
            <feGaussianBlur in="dif" stdDeviation="1" result="difs" />
            <feComponentTransfer in="difs" result="band">
              <feFuncR type="table" tableValues="0 0.8 0.15 1 0.3 0.9 0.12 1" />
              <feFuncG type="table" tableValues="0 0.8 0.15 1 0.3 0.9 0.12 1" />
              <feFuncB type="table" tableValues="0 0.8 0.15 1 0.3 0.9 0.12 1" />
            </feComponentTransfer>
            <feComposite in="band" in2="goo" operator="in" result="bandIn" />
            <feColorMatrix in="bandIn" type="matrix" values={METAL.tint} result="tinted" />
            <feSpecularLighting in="h" surfaceScale="18" specularConstant="1.9" specularExponent="38" lightingColor="#ffffff" result="s1r">
              <fePointLight x="300" y="-40" z="300" />
            </feSpecularLighting>
            <feSpecularLighting in="h" surfaceScale="18" specularConstant="1.1" specularExponent="22" lightingColor={METAL.rim} result="s2r">
              <fePointLight x="1400" y="700" z="200" />
            </feSpecularLighting>
            <feGaussianBlur in="s1r" stdDeviation="1.4" result="s1" />
            <feGaussianBlur in="s2r" stdDeviation="1.4" result="s2" />
            <feComposite in="s1" in2="goo" operator="in" result="s1i" />
            <feComposite in="s2" in2="goo" operator="in" result="s2i" />
            <feComposite in="tinted" in2="s1i" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="a" />
            <feComposite in="a" in2="s2i" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>

          {/* Slow organic wobble. The still twin is swapped in for reduced motion. */}
          <filter id="winter-warp" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.004 0.012" numOctaves="2" seed="4" result="n">
              <animate
                attributeName="baseFrequency"
                dur="14s"
                values="0.004 0.012;0.011 0.005;0.004 0.012"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="n" scale="52" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="winter-warp-still" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.007 0.009" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="52" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        <g filter="url(#winter-chrome)">
          <g className="winter-warp" filter="url(#winter-warp)" fill="#fff">
            <g className="winter-drift" style={{ transformOrigin: "1150px 390px" }}>
              <BurstPaths b={MAIN} />
            </g>
            <g className="winter-drift winter-drift-b" style={{ transformOrigin: "150px 730px" }}>
              <BurstPaths b={SMALL} />
            </g>
            <g className="winter-drift winter-drift-c">
              {CURLS.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
          </g>
        </g>
      </svg>

      <div className="winter-pixels" aria-hidden="true">
        {PIXELS.map((p, i) => (
          <i
            key={i}
            className="winter-px"
            style={
              {
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                background: p.color,
                animationDelay: p.delay,
                animationDuration: p.dur,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="winter-tear" />

      <div className="winter-hud left-4 top-4 sm:left-6">DAI.EXE // WNTR.27</div>
      <div className="winter-hud right-4 bottom-6 text-right sm:right-6 max-sm:hidden">
        41.8781° N · 87.6298° W<br />
        NODE: DEPAUL-AI / WNTR
      </div>
    </>
  );
}
