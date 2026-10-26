export type StandId = "N" | "E" | "S" | "W" | "A";

export type CategoryId =
  | "N" // north stand
  | "E" // east stand
  | "S" // south stand
  | "W1" // west, category 1
  | "W2" // west, category 2
  | "WS" // west, silver
  | "WG" // west, GOLD
  | "WK" // west, gold box ("תא זהב")
  | "BX" // west, boxes
  | "WP" // west, press (not for sale)
  | "AW"; // away fans (not for sale)

/** Map geometry lives in a 480×400 SVG coordinate space. */
export type SectionShape =
  | { kind: "rect"; x: number; y: number; w: number; h: number }
  | { kind: "polygon"; points: string; labelX: number; labelY: number };

export interface SectionDefinition {
  id: string;
  /** Text drawn on the map. */
  label: string;
  /** Full name shown in the UI and on tickets. */
  name: string;
  stand: StandId;
  category: CategoryId;
  /** Real seat count for the section. */
  capacity: number;
  gate: string;
  onSale: boolean;
  shape: SectionShape;
  /** Smaller label for very thin sections (boxes). */
  labelSize?: number;
  /** Hide the category line under the label (section too small). */
  compact?: boolean;
}

export interface CategoryDefinition {
  id: CategoryId;
  name: string;
  shortName: string;
  priceAgorot: number;
}
