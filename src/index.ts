/**
 * Entry point for Vatican Museums ticket monitor
 */

import { loadConfig } from './config.js';
import { createNotifier } from './notifier.js';
import { TicketMonitor } from './monitor.js';

async function main() {
  try {
    console.log('Loading configuration...');
    const config = await loadConfig();

    console.log('Creating notifier...');
    const notifier = createNotifier(
      config.telegramBotToken,
      config.telegramChatId
    );

    console.log('Initializing monitor...');
    const monitor = new TicketMonitor(config, notifier);

    await monitor.start();

    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\n\n👋 Shutting down gracefully...');
      process.exit(0);
    });
  } catch (error) {
    console.error('Fatal error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
