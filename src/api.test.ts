/**
 * Tests for API utilities
 */

import { describe, it, expect } from 'vitest';
import { isSlotAvailable } from '../src/api.js';
import type { TimeSlot } from '../src/api.js';

describe('isSlotAvailable', () => {
  it('should return true for available slots', () => {
    const slot1: TimeSlot = { time: '09:00', availability: 'AVAILABLE' };
    expect(isSlotAvailable(slot1)).toBe(true);

    const slot2: TimeSlot = { time: '10:00', availability: 'LIMITED' };
    expect(isSlotAvailable(slot2)).toBe(true);

    const slot3: TimeSlot = { time: '11:00', availability: 'FEW_LEFT' };
    expect(isSlotAvailable(slot3)).toBe(true);
  });

  it('should return false for sold out slots', () => {
    const slot: TimeSlot = { time: '09:00', availability: 'SOLD_OUT' };
    expect(isSlotAvailable(slot)).toBe(false);
  });

  it('should handle case sensitivity', () => {
    const slot1: TimeSlot = { time: '09:00', availability: 'sold_out' };
    expect(isSlotAvailable(slot1)).toBe(true); // Not exactly "SOLD_OUT"

    const slot2: TimeSlot = { time: '10:00', availability: 'SOLD_OUT' };
    expect(isSlotAvailable(slot2)).toBe(false);
  });
});
