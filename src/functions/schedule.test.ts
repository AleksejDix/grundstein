import { generateRepaymentSchedule } from './schedule';
import { describe, it, expect } from 'vitest'

describe('schedule', () => {
  it('should convert percent to decimal', () => {
    const output = generateRepaymentSchedule(50000, 1, 8);
    expect(output.length).toBe(132);
  });
});