/**
 * API client for Musei Vaticani ticket availability
 */

import fetch from 'node-fetch';
import { convertDateFormat } from './config.js';

export interface TimeSlot {
  time: string;
  availability: string;
  [key: string]: unknown;
}

export interface ApiResponse {
  timetable: TimeSlot[];
}

export interface AvailabilityResult {
  date: string;
  available: boolean;
  availableSlots: TimeSlot[];
}

const API_BASE_URL = 'https://tickets.museivaticani.va/api/visit/timeavail';

/**
 * Check if a time slot is available (not sold out)
 */
export function isSlotAvailable(slot: TimeSlot): boolean {
  return slot.availability !== 'SOLD_OUT';
}

/**
 * Fetch ticket availability for a specific date
 */
export async function fetchAvailability(
  date: string,
  visitTypeId: number,
  visitorNum: number,
  lang: string,
  visitLang: string,
  retryCount: number = 0
): Promise<AvailabilityResult> {
  const formattedDate = convertDateFormat(date);
  const url = `${API_BASE_URL}?lang=${lang}&visitLang=${visitLang}&visitTypeId=${visitTypeId}&visitorNum=${visitorNum}&visitDate=${encodeURIComponent(formattedDate)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Vatican-Ticket-Monitor/1.0)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        throw new Error(`HTTP ${response.status}: Rate limited or forbidden`);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as ApiResponse;
    
    if (!data.timetable || !Array.isArray(data.timetable)) {
      throw new Error('Invalid API response format: missing timetable array');
    }

    const availableSlots = data.timetable.filter(isSlotAvailable);
    
    return {
      date,
      available: availableSlots.length > 0,
      availableSlots,
    };
  } catch (error) {
    if (error instanceof Error && 
        (error.message.includes('403') || 
         error.message.includes('429') || 
         error.message.includes('timeout'))) {
      
      // Exponential backoff: 2^retryCount * 5 seconds, max 5 retries
      const maxRetries = 5;
      if (retryCount < maxRetries) {
        const delayMs = Math.pow(2, retryCount) * 5000;
        console.warn(`Retry ${retryCount + 1}/${maxRetries} for ${date} after ${delayMs}ms: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return fetchAvailability(date, visitTypeId, visitorNum, lang, visitLang, retryCount + 1);
      }
    }
    
    throw error;
  }
}
