// Present value of perpetual annuity (in arrears)
// Present value of perpetual annuity (in advance)

import {
  calculateStartPaymentValue,
  calculateRegularPaymentValue,
} from "./perpetuity";
import { describe, it, expect } from "vitest";

describe("discount", () => {
  it("dauer rente von 50.000 am ende", () => {
    const output = calculateRegularPaymentValue({ r: 50000, z: 0.05 });
    expect(output).toBe(1000000);
  });

  it("dauer rente von 50.000 am anfang", () => {
    const output = calculateStartPaymentValue({ r: 50000, z: 0.05 });
    expect(output).toBe(1050000);
  });
});
