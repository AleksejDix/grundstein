import { calculateTilgung } from './tilgung';
import { describe, it, expect } from 'vitest'


describe('rate', () => {
  it('rate K = 50k p = 1% r = 375', () => {
    const output = calculateTilgung(50000, 1, 375);
    expect(output).toBe(8);
  });

  it('rate K = 90k p = 3.75% r = 400', () => {
    const output = calculateTilgung(90000, 3.75, 400);
    expect(output).toBe(1.58);
  });

  it('rate K = 155k p = 3.75% r = 700', () => {
    const output = calculateTilgung(155000, 3.75, 700);
    expect(output).toBe(1.67);
  });
})