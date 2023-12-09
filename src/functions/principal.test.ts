// K = Capital;
// i =
// n = years

import {
  getPrincipal,
  calculateYearlyPayment,
  calculateMonthlyPayment,
} from "./principal";
import { describe, it, expect } from "vitest";

describe("principal", () => {
  it("Yearly K = 1000k z = 13%", () => {
    const output = getPrincipal({ k: 100000, z: 0.03, r: 5000 });
    expect(output).toBe(2000);
  });

  it("calculateYearlyPayment", () => {
    const output = calculateYearlyPayment({ k: 1000, z: 0.04, n: 1 });
    expect(output).toBe(1039.999999999999);
  });

  it("calculateMonthlyPayment", () => {
    const output = calculateMonthlyPayment({ k: 1000, z: 0.04, n: 1 });
    expect(output).toBe(86.66666666666659);
  });
});
