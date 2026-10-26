import { describe, expect, it } from "vitest";
import { aisleBreaks, buildRows } from "../stadium/rows";

describe("buildRows", () => {
  it.each([1, 13, 96, 160, 455, 1_331, 2_833])("keeps every seat for capacity %i", (capacity) => {
    const rows = buildRows(capacity);
    expect(rows.reduce((a, b) => a + b, 0)).toBe(capacity);
  });

  it("gives rows about twice as many seats as there are rows", () => {
    const rows = buildRows(2_833);
    expect(rows).toHaveLength(38);
    expect(rows[0]).toBe(74);
  });

  it("puts extra seats in the back rows, never the front", () => {
    const rows = buildRows(2_833);
    for (let i = 1; i < rows.length; i++) expect(rows[i]!).toBeGreaterThanOrEqual(rows[i - 1]!);
    expect(Math.max(...rows) - Math.min(...rows)).toBeLessThanOrEqual(1);
  });

  it("rejects invalid capacities", () => {
    expect(() => buildRows(0)).toThrow(RangeError);
    expect(() => buildRows(2.5)).toThrow(RangeError);
  });
});

describe("aisleBreaks", () => {
  it("adds a walkway every 25 seats in wide sections", () => expect(aisleBreaks(75)).toBe(25));
  it("splits narrow sections in half", () => expect(aisleBreaks(16)).toBe(8));
});
