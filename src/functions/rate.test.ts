import { calculateRate } from "./rate";
import { describe, it, expect } from "vitest";

describe("rate", () => {
  it.skip("rate K = 50k p = 1% t = 9%", () => {
    const output = calculateRate(50000, 1, 8);
    expect(output).toBe(375);
  });

  it.skip("rate K = 90k p = 3.75% t = 1.58%", () => {
    const output = calculateRate(90000, 3.75, 1.58);
    expect(output).toBe(399.75);
  });

  it.skip("rate K = 155k p = 3.75% t = 1.58%", () => {
    const output = calculateRate(155000, 3.75, 1.67);
    expect(output).toBe(700.08);
  });
});
