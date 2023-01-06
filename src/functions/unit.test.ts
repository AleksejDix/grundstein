import { percentToDecimal, decimalToPercent } from './unit';
import { describe, it, expect } from 'vitest'

describe('conver percent and decimals', () => {
  it('should convert percent to decimal', () => {
    const priceDecimal = 3;
    const realEstateYield = percentToDecimal(priceDecimal);
    expect(realEstateYield).toBe(0.03);
  });

  it('should convert percent 0 to decimal 0', () => {
    const priceDecimal = 0;
    const realEstateYield = percentToDecimal(priceDecimal);
    expect(realEstateYield).toBe(0);
  });

  it('should convert decimal to percent', () => {
    const priceDecimal = 0.3;
    const realEstateYield = decimalToPercent(priceDecimal);
    expect(realEstateYield).toBe(30);
  });

  it('should convert decimal 0  to percent 0', () => {
    const priceDecimal = 0;
    const realEstateYield = decimalToPercent(priceDecimal);
    expect(realEstateYield).toBe(0);
  });
});