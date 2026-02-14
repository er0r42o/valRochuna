/**
 * Tests for configuration utilities
 */

import { describe, it, expect } from 'vitest';
import { convertDateFormat, isValidDateFormat } from '../src/config.js';

describe('convertDateFormat', () => {
  it('should convert YYYY-MM-DD to DD/MM/YYYY', () => {
    expect(convertDateFormat('2024-03-15')).toBe('15/03/2024');
    expect(convertDateFormat('2024-01-01')).toBe('01/01/2024');
    expect(convertDateFormat('2024-12-31')).toBe('31/12/2024');
  });

  it('should throw error for invalid format', () => {
    expect(() => convertDateFormat('2024/03/15')).toThrow('Invalid date format');
    expect(() => convertDateFormat('invalid')).toThrow('Invalid date format');
    expect(() => convertDateFormat('2024-3-5')).toThrow('Invalid date format');
  });
});

describe('isValidDateFormat', () => {
  it('should validate correct YYYY-MM-DD format', () => {
    expect(isValidDateFormat('2024-03-15')).toBe(true);
    expect(isValidDateFormat('2024-01-01')).toBe(true);
    expect(isValidDateFormat('2024-12-31')).toBe(true);
  });

  it('should reject invalid formats', () => {
    expect(isValidDateFormat('2024/03/15')).toBe(false);
    expect(isValidDateFormat('15-03-2024')).toBe(false);
    expect(isValidDateFormat('2024-3-15')).toBe(false);
    expect(isValidDateFormat('invalid')).toBe(false);
    expect(isValidDateFormat('2024-13-01')).toBe(false);
    expect(isValidDateFormat('2024-12-32')).toBe(false);
  });
});
