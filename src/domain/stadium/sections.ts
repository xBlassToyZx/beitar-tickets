import type { SectionDefinition, SectionShape } from "./types";

/**
 * Teddy Stadium sections, matching the section layout used by the club's ticketing map.
 * Capacities are the real seat counts per section. Gates are placeholders.
 * Geometry is in a 480×400 SVG space; the pitch sits at x 152–328, y 120–246.
 */

const rect = (x: number, y: number, w: number, h: number): SectionShape => ({
  kind: "rect",
  x,
  y,
  w,
  h,
});
const poly = (points: string, labelX: number, labelY: number): SectionShape => ({
  kind: "polygon",
  points,
  labelX,
  labelY,
});

const north = (id: string, capacity: number, shape: SectionShape): SectionDefinition => ({
  id,
  label: id,
  name: `גוש ${id}`,
  stand: "N",
  category: "N",
  capacity,
  gate: "14",
  onSale: true,
  shape,
});

const east = (id: string, capacity: number, x: number): SectionDefinition => ({
  id,
  label: id,
  name: `גוש ${id}`,
  stand: "E",
  category: "E",
  capacity,
  gate: "19",
  onSale: true,
  shape: rect(x, 50, 45, 68),
});

const south = (id: string, capacity: number, shape: SectionShape): SectionDefinition => ({
  id,
  label: id,
  name: `גוש ${id}`,
  stand: "S",
  category: "S",
  capacity,
  gate: "1",
  onSale: true,
  shape,
});

const west = (
  number: string,
  tier: "lower" | "upper",
  category: SectionDefinition["category"],
  capacity: number,
  shape: SectionShape,
  extra: Partial<SectionDefinition> = {},
): SectionDefinition => ({
  id: `${number}${tier === "lower" ? "L" : "U"}`,
  label: number,
  name: `גוש ${number} ${tier === "lower" ? "תחתון" : "עליון"}`,
  stand: "W",
  category,
  capacity,
  gate: category === "W1" || category === "W2" ? "6" : "7",
  onSale: true,
  shape,
  ...extra,
});

const box = (n: number, capacity: number, x: number, w: number): SectionDefinition => ({
  id: `BX${n}`,
  label: "בוקס",
  name: `בוקס ${n}`,
  stand: "W",
  category: "BX",
  capacity,
  gate: "7",
  onSale: true,
  shape: rect(x, 328, w, 14),
  labelSize: 7,
  compact: true,
});

export const SECTIONS: readonly SectionDefinition[] = [
  // North stand (צפוני). Corners 16/17 and 11/12 are split along the bowl.
  north("17", 1_020, poly("42,44 150,44 150,68 102,96 42,84", 98, 66)),
  north("16", 1_272, poly("42,84 102,96 150,68 150,144 42,144", 96, 124)),
  north("15", 1_091, rect(50, 144, 100, 26)),
  north("14", 1_033, rect(50, 170, 100, 26)),
  north("13", 1_064, rect(50, 196, 100, 26)),
  north("12", 1_051, poly("42,222 150,222 150,248 108,286 98,276 42,298", 90, 252)),
  north("11", 1_244, poly("42,298 98,276 108,286 150,248 150,348 42,348", 104, 322)),

  // East stand (מזרחי).
  east("18", 1_956, 150),
  east("19", 1_911, 195),
  east("20", 1_801, 240),
  east("21", 1_905, 285),

  // South stand (דרומי). Corner 22/23 is split diagonally from the pitch corner.
  south("22", 1_076, poly("330,48 438,48 330,120", 364, 76)),
  south("23", 1_362, poly("438,48 438,120 330,120", 404, 104)),
  south("1", 2_833, rect(330, 120, 100, 64)),
  south("2", 1_916, rect(330, 184, 100, 64)),

  // Away fans corner.
  {
    id: "3",
    label: "3",
    name: "גוש 3",
    stand: "A",
    category: "AW",
    capacity: 2_562,
    gate: "3",
    onSale: false,
    shape: rect(330, 248, 100, 94),
  },

  // West stand (מערבי), row next to the pitch.
  west("9", "lower", "W1", 537, rect(166.5, 248, 28, 36)),
  west("8", "lower", "WS", 455, rect(194.5, 248, 30, 36)),
  west("7", "lower", "WG", 385, rect(224.5, 248, 28.5, 36)),
  west("6", "lower", "WS", 455, rect(253, 248, 30.5, 36)),
  west("5", "lower", "W1", 551, rect(283.5, 248, 28, 36)),

  // West stand, back row. 9 and 5 wrap up the sides in an L shape.
  west(
    "9",
    "upper",
    "W2",
    1_331,
    poly("150,248 166.5,248 166.5,284 195,284 195,327 150,327", 174, 305),
  ),
  west("8", "upper", "W1", 513, rect(195, 284, 29.5, 43)),
  west("7", "upper", "WK", 444, rect(224.5, 284, 35.5, 43)),
  west("6", "upper", "W1", 160, rect(260, 284, 23, 21.5), { compact: true, labelSize: 10 }),
  {
    id: "6P",
    label: "עיתונאים",
    name: "עיתונאים",
    stand: "W",
    category: "WP",
    capacity: 96,
    gate: "7",
    onSale: false,
    shape: rect(260, 305.5, 23, 21.5),
    labelSize: 4.6,
    compact: true,
  },
  west(
    "5",
    "upper",
    "W2",
    1_267,
    poly("311.5,248 330,248 330,327 283,327 283,284 311.5,284", 304, 305),
  ),

  // Boxes between the west stand and the bowl, numbered left to right.
  box(1, 31, 166.5, 20),
  box(2, 13, 186.5, 21.5),
  box(3, 19, 208, 21),
  box(4, 14, 229, 20.5),
  box(5, 32, 249.5, 24),
  box(6, 18, 273.5, 19.5),
  box(7, 16, 293, 22),
];

/** Section numbers printed around the outside of the bowl, as on the club map. */
export const OUTER_LABELS: readonly { text: string; x: number; y: number }[] = [
  { text: "17", x: 80, y: 20 },
  { text: "18", x: 172, y: 21 },
  { text: "19", x: 217, y: 21 },
  { text: "20", x: 262, y: 21 },
  { text: "21", x: 307, y: 21 },
  { text: "22", x: 386, y: 25 },
  { text: "23", x: 466, y: 100 },
  { text: "1", x: 466, y: 152 },
  { text: "2", x: 466, y: 216 },
  { text: "3", x: 460, y: 334 },
  { text: "16", x: 17, y: 96 },
  { text: "15", x: 14, y: 140 },
  { text: "14", x: 14, y: 174 },
  { text: "13", x: 14, y: 208 },
  { text: "12", x: 16, y: 262 },
  { text: "11", x: 24, y: 348 },
  { text: "10", x: 120, y: 384 },
  { text: "9", x: 170, y: 384 },
  { text: "8", x: 205, y: 384 },
  { text: "7", x: 240, y: 384 },
  { text: "6", x: 275, y: 384 },
  { text: "5", x: 310, y: 384 },
  { text: "4", x: 372, y: 384 },
];

const byId = new Map(SECTIONS.map((s) => [s.id, s]));

export function getSection(id: string): SectionDefinition | undefined {
  return byId.get(id);
}

export const STADIUM_CAPACITY = SECTIONS.reduce((sum, s) => sum + s.capacity, 0);
