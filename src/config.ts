/**
 * Configuration types and defaults for the Vatican Museums ticket monitor
 */

export interface Config {
  /** Dates to monitor in YYYY-MM-DD format */
  dates: string[];
  /** Visit type ID from the API */
  visitTypeId: number;
  /** Number of visitors */
  visitorNum: number;
  /** Language code (e.g., 'it', 'en') */
  lang: string;
  /** Visit language (optional) */
  visitLang: string;
  /** Poll interval in seconds */
  pollIntervalSeconds: number;
  /** Telegram bot token (optional) */
  telegramBotToken?: string;
  /** Telegram chat ID (optional) */
  telegramChatId?: string;
}

export const DEFAULT_CONFIG: Partial<Config> = {
  visitTypeId: 1705055877,
  visitorNum: 2,
  lang: 'it',
  visitLang: '',
  pollIntervalSeconds: 300, // 5 minutes
};

/**
 * Convert date from YYYY-MM-DD to DD/MM/YYYY format
 */
export function convertDateFormat(date: string): string {
  // Validate format strictly
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD`);
  }
  
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Validate date format YYYY-MM-DD
 */
export function isValidDateFormat(date: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) {
    return false;
  }
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
}

/**
 * Load configuration from file and environment variables
 */
export async function loadConfig(configPath: string = './config.json'): Promise<Config> {
  let fileConfig: Partial<Config> = {};
  
  try {
    const fs = await import('fs');
    const configContent = await fs.promises.readFile(configPath, 'utf-8');
    fileConfig = JSON.parse(configContent);
  } catch (error) {
    console.warn(`Warning: Could not load config file from ${configPath}. Using defaults.`);
  }

  const config: Config = {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    dates: fileConfig.dates || [],
    visitTypeId: fileConfig.visitTypeId || DEFAULT_CONFIG.visitTypeId!,
    visitorNum: fileConfig.visitorNum || DEFAULT_CONFIG.visitorNum!,
    lang: fileConfig.lang || DEFAULT_CONFIG.lang!,
    visitLang: fileConfig.visitLang || DEFAULT_CONFIG.visitLang!,
    pollIntervalSeconds: fileConfig.pollIntervalSeconds || DEFAULT_CONFIG.pollIntervalSeconds!,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || fileConfig.telegramBotToken,
    telegramChatId: process.env.TELEGRAM_CHAT_ID || fileConfig.telegramChatId,
  };

  // Validate dates
  for (const date of config.dates) {
    if (!isValidDateFormat(date)) {
      throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD`);
    }
  }

  if (config.dates.length === 0) {
    throw new Error('No dates to monitor. Please provide dates in config.json');
  }

  return config;
}
