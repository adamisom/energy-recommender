import { analyzeUsage } from '@/lib/scoring/usage-analysis';

describe('analyzeUsage', () => {
  test('should analyze flat usage pattern', () => {
    const flatUsage = [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000];
    const result = analyzeUsage(flatUsage);

    expect(result.totalAnnualKwh).toBe(12000);
    expect(result.averageMonthlyKwh).toBe(1000);
    expect(result.medianMonthlyKwh).toBe(1000);
    expect(result.pattern).toBe('flat');
  });

  test('should detect summer peak pattern', () => {
    // High usage in June (5), July (6), August (7)
    const summerPeak = [800, 750, 750, 800, 900, 1500, 1600, 1550, 950, 800, 750, 800];
    const result = analyzeUsage(summerPeak);

    expect(result.pattern).toBe('summer_peak');
    expect(result.peakMonth).toBe(6); // July
  });

  test('should detect winter peak pattern', () => {
    // High usage in December (11), January (0), February (1)
    const winterPeak = [1500, 1450, 900, 750, 700, 700, 700, 700, 750, 800, 900, 1550];
    const result = analyzeUsage(winterPeak);

    expect(result.pattern).toBe('winter_peak');
    expect([11, 0, 1]).toContain(result.peakMonth);
  });

  test('should throw error for less than 12 months', () => {
    const invalidUsage = [1000, 1000, 1000];
    expect(() => analyzeUsage(invalidUsage)).toThrow('exactly 12 months');
  });

  test('should throw error for negative values', () => {
    const invalidUsage = [1000, -100, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000];
    expect(() => analyzeUsage(invalidUsage)).toThrow('must be positive');
  });

  test('should throw error for zero values', () => {
    const invalidUsage = [1000, 0, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000];
    expect(() => analyzeUsage(invalidUsage)).toThrow('must be positive');
  });

  test('should calculate median correctly', () => {
    const usage = [500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600];
    const result = analyzeUsage(usage);
    
    expect(result.medianMonthlyKwh).toBe(1050); // Average of 1000 and 1100
  });
});

