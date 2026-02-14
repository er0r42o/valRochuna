/**
 * Main monitoring logic with deduplication
 */

import type { Config } from './config.js';
import { fetchAvailability } from './api.js';
import type { Notifier } from './notifier.js';

export class TicketMonitor {
  private availabilityState: Map<string, boolean> = new Map();

  constructor(
    private config: Config,
    private notifier: Notifier
  ) {
    // Initialize all dates as unavailable
    for (const date of config.dates) {
      this.availabilityState.set(date, false);
    }
  }

  /**
   * Check availability for a single date
   */
  async checkDate(date: string): Promise<void> {
    try {
      const result = await fetchAvailability(
        date,
        this.config.visitTypeId,
        this.config.visitorNum,
        this.config.lang,
        this.config.visitLang
      );

      const wasAvailable = this.availabilityState.get(date) || false;
      const isAvailable = result.available;

      // Dedupe: only notify on transition from unavailable to available
      if (isAvailable && !wasAvailable) {
        console.log(`Transition detected for ${date}: unavailable → available`);
        await this.notifier.notify(result);
        this.availabilityState.set(date, true);
      } else if (!isAvailable && wasAvailable) {
        console.log(`Transition detected for ${date}: available → unavailable`);
        this.availabilityState.set(date, false);
      } else if (isAvailable) {
        console.log(`${date}: Still available (${result.availableSlots.length} slots)`);
      } else {
        console.log(`${date}: No availability`);
      }
    } catch (error) {
      console.error(`Error checking ${date}:`, error instanceof Error ? error.message : error);
    }
  }

  /**
   * Check all configured dates
   */
  async checkAll(): Promise<void> {
    console.log(`\n--- Checking ${this.config.dates.length} date(s) at ${new Date().toISOString()} ---`);
    
    for (const date of this.config.dates) {
      await this.checkDate(date);
      // Small delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  /**
   * Start continuous monitoring
   */
  async start(): Promise<void> {
    console.log('🚀 Vatican Museums Ticket Monitor started');
    console.log(`📅 Monitoring dates: ${this.config.dates.join(', ')}`);
    console.log(`⏱️  Poll interval: ${this.config.pollIntervalSeconds} seconds`);
    console.log(`🔔 Notifications: ${this.config.telegramBotToken ? 'Console + Telegram' : 'Console only'}`);
    console.log('');

    // Initial check
    await this.checkAll();

    // Set up polling
    const intervalMs = this.config.pollIntervalSeconds * 1000;
    setInterval(async () => {
      try {
        await this.checkAll();
      } catch (error) {
        console.error('Error during monitoring cycle:', error);
      }
    }, intervalMs);

    console.log(`\n✅ Monitoring active. Press Ctrl+C to stop.\n`);
  }
}
