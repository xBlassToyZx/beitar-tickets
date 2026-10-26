import { describe, expect, it } from "vitest";
import { formatILS } from "../money";

describe("formatILS", () => {
  it("formats agorot as whole shekels", () => {
    expect(formatILS(13_000)).toMatch(/130/);
    expect(formatILS(13_000)).toMatch(/₪/);
  });
});
