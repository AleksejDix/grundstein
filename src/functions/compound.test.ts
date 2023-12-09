import { compound } from "./compound";
import { describe, it, expect } from "vitest";

describe("compound", () => {
  it("compound K = 2000 z = 5.5% y = 10", () => {
    const output = compound({ k: 100, z: 0.05, y: 1 });
    expect(output).toBe(105);
  });
});
