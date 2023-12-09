import { discount } from "./discount";
import { describe, it, expect } from "vitest";

describe("discount", () => {
  it("discount K = 2000 z = 5.5% y = 10", () => {
    const output = discount({ k: 105, z: 0.05, y: 1 });
    expect(output).toBe(100);
  });
});
