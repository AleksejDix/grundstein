import { calculateTerm } from "./term";
import { describe, it, expect } from "vitest";

describe.skip("term", () => {
  describe("term by kredit zinz and rate", () => {
    it("term 50000, 1, 500", () => {
      expect(calculateTerm(50000, 0.85, 375)).toBe(141);
    });

    it("term 90000, 1.65, 400", () => {
      expect(calculateTerm(90000, 1.65, 400)).toBe(270);
    });

    it("term 155000, 3.75, 700)", () => {
      expect(calculateTerm(155000, 3.75, 700)).toEqual(378);
    });
  });
});
