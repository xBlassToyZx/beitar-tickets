import type { CategoryDefinition, CategoryId, StandId } from "./types";

export const STANDS: Record<StandId, string> = {
  N: "צפוני",
  E: "מזרחי",
  S: "דרומי",
  W: "מערבי",
  A: "קבוצה אורחת",
};

/** Prices are demo values, stored in agorot (1 ₪ = 100 agorot). */
export const CATEGORIES: Record<CategoryId, CategoryDefinition> = {
  N: { id: "N", name: "צפוני", shortName: "צפוני", priceAgorot: 7_000 },
  S: { id: "S", name: "דרומי", shortName: "דרומי", priceAgorot: 7_000 },
  E: { id: "E", name: "מזרחי", shortName: "מזרחי", priceAgorot: 8_000 },
  W2: { id: "W2", name: "מערבי · קט' 2", shortName: "קט' 2", priceAgorot: 10_000 },
  W1: { id: "W1", name: "מערבי · קט' 1", shortName: "קט' 1", priceAgorot: 13_000 },
  WS: { id: "WS", name: "מערבי · כסף", shortName: "כסף", priceAgorot: 19_000 },
  WG: { id: "WG", name: "מערבי · GOLD", shortName: "GOLD", priceAgorot: 28_000 },
  WK: { id: "WK", name: "מערבי · תא זהב", shortName: "תא זהב", priceAgorot: 45_000 },
  BX: { id: "BX", name: "בוקסים", shortName: "בוקס", priceAgorot: 60_000 },
  WP: { id: "WP", name: "עיתונאים", shortName: "עיתונאים", priceAgorot: 0 },
  AW: { id: "AW", name: "קבוצה אורחת", shortName: "אורחים", priceAgorot: 0 },
};

/** West-stand categories show their short name under the section number on the map. */
export const SHOWS_CATEGORY_ON_MAP: ReadonlySet<CategoryId> = new Set([
  "W1",
  "W2",
  "WS",
  "WG",
  "WK",
]);
