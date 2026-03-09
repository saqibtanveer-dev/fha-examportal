import { describe, it, expect } from 'vitest';
import { formatCurrency, formatMonth } from '../components/fee-status-badge';

describe('formatCurrency', () => {
  it('formats positive amounts in PKR', () => {
    const result = formatCurrency(5000);
    expect(result).toContain('5,000');
    expect(result).toContain('Rs');
  });

  it('formats zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('rounds decimals (no fraction digits)', () => {
    const result = formatCurrency(1234.56);
    // minimumFractionDigits: 0, maximumFractionDigits: 0
    expect(result).toContain('1,235');
  });

  it('formats large amounts with commas', () => {
    const result = formatCurrency(1500000);
    expect(result).toContain('1,500,000');
  });
});

describe('formatMonth', () => {
  it('formats YYYY-MM to readable month-year', () => {
    const result = formatMonth('2025-01');
    expect(result).toContain('January');
    expect(result).toContain('2025');
  });

  it('handles December correctly', () => {
    const result = formatMonth('2024-12');
    expect(result).toContain('December');
    expect(result).toContain('2024');
  });

  it('handles June correctly', () => {
    const result = formatMonth('2025-06');
    expect(result).toContain('June');
    expect(result).toContain('2025');
  });
});
