/**
 * Formats a number into a compact string representation (e.g., 1.5K, 2.3M).
 */
export function formatCompactNumber(number: number): string {
  if (number === undefined || number === null) return '0';

  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(number);
}
