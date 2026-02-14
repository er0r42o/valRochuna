/**
 * Notification methods for ticket availability alerts
 */

import fetch from 'node-fetch';
import type { AvailabilityResult } from './api.js';

export interface Notifier {
  notify(result: AvailabilityResult): Promise<void>;
}

/**
 * Console/stdout notifier - default notification method
 */
export class ConsoleNotifier implements Notifier {
  async notify(result: AvailabilityResult): Promise<void> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🎫 AVAILABLE: ${result.date}`);
    console.log(`   Found ${result.availableSlots.length} available slot(s):`);
    for (const slot of result.availableSlots) {
      console.log(`   - ${slot.time} (${slot.availability})`);
    }
  }
}

/**
 * Telegram notifier - sends messages via Telegram Bot API
 */
export class TelegramNotifier implements Notifier {
  constructor(
    private botToken: string,
    private chatId: string
  ) {}

  async notify(result: AvailabilityResult): Promise<void> {
    const message = this.formatMessage(result);
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
      // Fall back to console
      console.log(message);
    }
  }

  private formatMessage(result: AvailabilityResult): string {
    let message = `🎫 *Vatican Museums Tickets Available*\n\n`;
    message += `📅 Date: *${result.date}*\n`;
    message += `✅ Available slots: ${result.availableSlots.length}\n\n`;
    
    for (const slot of result.availableSlots) {
      message += `• ${slot.time} (${slot.availability})\n`;
    }
    
    return message;
  }
}

/**
 * Multi-notifier - sends notifications to multiple notifiers
 */
export class MultiNotifier implements Notifier {
  constructor(private notifiers: Notifier[]) {}

  async notify(result: AvailabilityResult): Promise<void> {
    await Promise.all(
      this.notifiers.map(notifier => notifier.notify(result))
    );
  }
}

/**
 * Create appropriate notifier based on configuration
 */
export function createNotifier(
  telegramBotToken?: string,
  telegramChatId?: string
): Notifier {
  const notifiers: Notifier[] = [new ConsoleNotifier()];

  if (telegramBotToken && telegramChatId) {
    notifiers.push(new TelegramNotifier(telegramBotToken, telegramChatId));
  }

  if (notifiers.length === 1) {
    return notifiers[0];
  }

  return new MultiNotifier(notifiers);
}
