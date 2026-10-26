import { describe, expect, it } from "vitest";
import { CATEGORIES } from "../stadium/categories";
import { SECTIONS, STADIUM_CAPACITY, getSection } from "../stadium/sections";

describe("stadium sections", () => {
  it("adds up to Teddy's real seat count", () => {
    expect(STADIUM_CAPACITY).toBe(31_434);
  });

  it("has unique ids", () => {
    expect(new Set(SECTIONS.map((s) => s.id)).size).toBe(SECTIONS.length);
  });

  it("uses only known price categories", () => {
    for (const s of SECTIONS) expect(CATEGORIES[s.category]).toBeDefined();
  });

  it("keeps the away corner and press seats off sale", () => {
    expect(getSection("3")?.onSale).toBe(false);
    expect(getSection("6P")?.onSale).toBe(false);
    const closed = SECTIONS.filter((s) => !s.onSale).map((s) => s.id);
    expect(closed.sort()).toEqual(["3", "6P"]);
  });

  it("has seven boxes numbered left to right", () => {
    const boxes = SECTIONS.filter((s) => s.category === "BX");
    expect(boxes.map((b) => b.id)).toEqual(["BX1", "BX2", "BX3", "BX4", "BX5", "BX6", "BX7"]);
    const xs = boxes.map((b) => (b.shape.kind === "rect" ? b.shape.x : 0));
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
  });
});
