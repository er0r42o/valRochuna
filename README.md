# A Little Valentine

---

# Vatican Museums Ticket Monitor

An alert-only monitoring tool for Musei Vaticani ticket availability. This tool checks the Vatican Museums API for ticket availability and sends notifications when tickets become available.

## ⚠️ Important Notes

- **Respect Terms of Service**: This tool is for personal use only. Do not abuse the Vatican Museums API.
- **Rate Limiting**: The tool implements exponential backoff for rate limiting (HTTP 403/429) and timeouts. Use reasonable poll intervals (recommended: 5+ minutes).
- **No Bypassing**: This tool does NOT implement any anti-bot bypassing, CAPTCHA solving, or evasion techniques.
- **Availability Not Guaranteed**: The API may change or become unavailable at any time.

## Features

- ✅ Monitors multiple dates simultaneously
- 🔔 Notifications via stdout (console) and optionally Telegram
- 🎯 Deduplication: Only notifies on state transitions (unavailable → available)
- 🔄 Safe polling with exponential backoff on errors
- ⚙️ Configurable visit types, visitor numbers, languages, and poll intervals
- 🧪 Includes tests for core logic

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/er0r42o/valRochuna.git
cd valRochuna
```

2. Install dependencies:
```bash
npm install
```

## Configuration

### 1. Create Configuration File

Copy the example configuration:
```bash
cp config.example.json config.json
```

Edit `config.json` with your preferences:

```json
{
  "dates": [
    "2024-03-15",
    "2024-03-16"
  ],
  "visitTypeId": 1705055877,
  "visitorNum": 2,
  "lang": "it",
  "visitLang": "",
  "pollIntervalSeconds": 300
}
```

**Configuration Options:**

- `dates` (required): Array of dates to monitor in `YYYY-MM-DD` format
- `visitTypeId` (optional): Visit type ID from the API (default: 1705055877)
- `visitorNum` (optional): Number of visitors (default: 2)
- `lang` (optional): Language code (default: "it")
- `visitLang` (optional): Visit language (default: "")
- `pollIntervalSeconds` (optional): Poll interval in seconds (default: 300 = 5 minutes)

### 2. Optional: Configure Telegram Notifications

If you want to receive Telegram notifications in addition to console output:

1. Create a Telegram bot via [@BotFather](https://t.me/botfather) and get your bot token
2. Get your chat ID (you can use [@userinfobot](https://t.me/userinfobot))
3. Set environment variables:

```bash
export TELEGRAM_BOT_TOKEN="your-bot-token"
export TELEGRAM_CHAT_ID="your-chat-id"
```

Or create a `.env` file (not tracked in git):
```
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

## Usage

### Running Locally

Run the monitor using `tsx` (TypeScript executor):

```bash
npm start
```

The monitor will:
1. Load configuration from `config.json`
2. Check all configured dates immediately
3. Continue checking at the specified interval
4. Notify when tickets transition from unavailable to available

### Example Output

```
Loading configuration...
Creating notifier...
Initializing monitor...
🚀 Vatican Museums Ticket Monitor started
📅 Monitoring dates: 2024-03-15, 2024-03-16
⏱️  Poll interval: 300 seconds
🔔 Notifications: Console only

--- Checking 2 date(s) at 2024-02-14T20:00:00.000Z ---
2024-03-15: No availability
2024-03-16: No availability

✅ Monitoring active. Press Ctrl+C to stop.
```

When tickets become available:
```
--- Checking 2 date(s) at 2024-02-14T20:05:00.000Z ---
Transition detected for 2024-03-15: unavailable → available
[2024-02-14T20:05:00.123Z] 🎫 AVAILABLE: 2024-03-15
   Found 3 available slot(s):
   - 09:00 (AVAILABLE)
   - 10:30 (LIMITED)
   - 14:00 (AVAILABLE)
```

### Stopping the Monitor

Press `Ctrl+C` to gracefully stop the monitor.

## Development

### Building

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Running Tests

```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Linting

```bash
npm run lint
```

## API Endpoint

The monitor uses the Vatican Museums ticket availability API:

```
GET https://tickets.museivaticani.va/api/visit/timeavail
```

**Query Parameters:**
- `lang`: Language code (e.g., "it", "en")
- `visitLang`: Visit language (optional)
- `visitTypeId`: Visit type identifier
- `visitorNum`: Number of visitors
- `visitDate`: Date in DD/MM/YYYY format

**Response Format:**
```json
{
  "timetable": [
    {
      "time": "09:00",
      "availability": "AVAILABLE"
    },
    {
      "time": "10:00",
      "availability": "SOLD_OUT"
    }
  ]
}
```

## Project Structure

```
valRochuna/
├── src/
│   ├── index.ts         # Entry point
│   ├── config.ts        # Configuration loading and utilities
│   ├── api.ts           # API client with retry logic
│   ├── notifier.ts      # Notification implementations
│   ├── monitor.ts       # Main monitoring logic with deduplication
│   ├── config.test.ts   # Tests for config utilities
│   └── api.test.ts      # Tests for API utilities
├── config.example.json  # Example configuration
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## Troubleshooting

### "No dates to monitor" Error

Make sure your `config.json` file exists and contains a `dates` array with at least one date.

### HTTP 403 or 429 Errors

The API is rate limiting your requests. The monitor will automatically retry with exponential backoff. Consider:
- Increasing `pollIntervalSeconds` in your config
- Reducing the number of dates being monitored

### Timeout Errors

The API may be temporarily unavailable. The monitor will retry automatically with backoff.

### Telegram Notifications Not Working

1. Verify your bot token and chat ID are correct
2. Make sure your bot has permission to send messages to your chat
3. Check console output for error messages

## License

MIT

## Disclaimer

This tool is provided as-is for educational and personal use. The authors are not responsible for any misuse or violations of the Vatican Museums terms of service. Always respect rate limits and use the tool responsibly.
