import { calculateRate, calculateMonthlyRate } from './rate';
import { describe, it, expect } from 'vitest'

describe('conver percent and decimals', () => {
  it('rate for 50k 1% 8%', () => {
    const output = calculateRate(50000, 1, 8);
    expect(output).toBe(378.47222222222223);
  });

  it.skip('rate for 50k 1% 8%', () => {
    const output = calculateRate(90000, 3.75, 1.6);
    expect(output).toBe(400);
  });

//   it('should convert percent 0 to decimal 0', () => {
//     const output = calculateRate(input);
//     expect(output).toBe(0);
//   });

//   it('should convert decimal to percent', () => {
//     const output = calculateRate(input);
//     expect(output).toBe(30);
//   });

//   it('should convert decimal 0  to percent 0', () => {
//     const output = calculateRate(input);
//     expect(output).toBe(0);
//   });
});

describe('Monatliche rate mit laufweit', () => {

    it('rate for 50k 1% 8%', () => {
      const output = calculateMonthlyRate(50000, 0.087, 400);
      expect(output).toBe(400);
    });
  
  //   it('should convert percent 0 to decimal 0', () => {
  //     const output = calculateRate(input);
  //     expect(output).toBe(0);
  //   });
  
  //   it('should convert decimal to percent', () => {
  //     const output = calculateRate(input);
  //     expect(output).toBe(30);
  //   });
  
  //   it('should convert decimal 0  to percent 0', () => {
  //     const output = calculateRate(input);
  //     expect(output).toBe(0);
  //   });
  });
  