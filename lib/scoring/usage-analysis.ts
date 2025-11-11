import { UsagePattern, UsageAnalysis } from '@/types';

/**
 * Analyzes monthly usage data to determine patterns and statistics
 * @param monthlyUsageKwh Array of 12 monthly usage values
 * @returns UsageAnalysis object with pattern and statistics
 */
export function analyzeUsage(monthlyUsageKwh: number[]): UsageAnalysis {
  if (monthlyUsageKwh.length !== 12) {
    throw new Error('Monthly usage must contain exactly 12 months of data');
  }

  if (monthlyUsageKwh.some(val => val <= 0)) {
    throw new Error('All monthly usage values must be positive');
  }

  const totalAnnualKwh = monthlyUsageKwh.reduce((sum, val) => sum + val, 0);
  const averageMonthlyKwh = totalAnnualKwh / 12;
  
  // Calculate median
  const sorted = [...monthlyUsageKwh].sort((a, b) => a - b);
  const medianMonthlyKwh = (sorted[5] + sorted[6]) / 2;

  // Find peak and low months
  const peakMonth = monthlyUsageKwh.indexOf(Math.max(...monthlyUsageKwh));
  const lowMonth = monthlyUsageKwh.indexOf(Math.min(...monthlyUsageKwh));

  // Determine usage pattern
  const pattern = determinePattern(monthlyUsageKwh, peakMonth);

  return {
    totalAnnualKwh,
    averageMonthlyKwh,
    medianMonthlyKwh,
    peakMonth,
    lowMonth,
    pattern,
  };
}

/**
 * Determines the usage pattern based on monthly data
 */
function determinePattern(monthlyUsageKwh: number[], peakMonth: number): UsagePattern {
  const avgUsage = monthlyUsageKwh.reduce((sum, val) => sum + val, 0) / 12;
  const maxUsage = Math.max(...monthlyUsageKwh);
  const minUsage = Math.min(...monthlyUsageKwh);
  
  const variation = (maxUsage - minUsage) / avgUsage;

  // If variation is low, it's a flat pattern
  if (variation < 0.3) {
    return 'flat';
  }

  // Summer months: June (5), July (6), August (7)
  const summerMonths = [5, 6, 7];
  const isSummerPeak = summerMonths.includes(peakMonth);

  // Winter months: December (11), January (0), February (1)
  const winterMonths = [11, 0, 1];
  const isWinterPeak = winterMonths.includes(peakMonth);

  if (isSummerPeak) {
    return 'summer_peak';
  } else if (isWinterPeak) {
    return 'winter_peak';
  } else {
    return 'variable';
  }
}

/**
 * Get month name from index (0-11)
 */
export function getMonthName(monthIndex: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
}

