import { calculateRealEstateYield } from './realEstateYield';
import { describe, it, expect } from 'vitest'

describe('calculateRealEstateYield', () => {
  it('should calculate the yield correctly', () => {
    const price = 200000;
    const annualIncome = 20000;
    const realEstateYield = calculateRealEstateYield(price, annualIncome);
    expect(realEstateYield).toBe(10);
  });
});