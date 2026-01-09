# Site Status Dashboard

A lightweight web dashboard for monitoring website and API availability. Displays operational status based on HTTP response codes and response times.

## Features

- HTTP health checks for configured sites
- Response time tracking in milliseconds
- Visual status indicators (UP/DOWN/SLOW)
- Auto-refresh every 30 seconds
- Manual refresh option
- Simple JSON configuration

## Quick Start

```bash
npm install
npm start
```

Open http://localhost:3000 in your browser.

## Configuration

Edit `sites.json` to configure your sites:

```json
{
  "settings": {
    "checkInterval": 30000,
    "defaultTimeout": 5000,
    "slowThreshold": 2000
  },
  "sites": [
    {
      "id": "my-site",
      "name": "My Website",
      "url": "https://example.com"
    }
  ]
}
```

| Setting | Description | Default |
|---------|-------------|---------|
| `checkInterval` | Auto-refresh interval (ms) | 30000 |
| `defaultTimeout` | Request timeout (ms) | 5000 |
| `slowThreshold` | Threshold for "slow" warning (ms) | 2000 |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Get status of all configured sites |
| `/api/status/:siteId` | GET | Get status of a specific site |
| `/api/refresh` | POST | Trigger immediate status check |
| `/api/config` | GET | Get current configuration settings |

## Status Indicators

| Status | Color | Condition |
|--------|-------|-----------|
| UP | Green | HTTP 2xx/3xx within timeout |
| DOWN | Red | HTTP 4xx/5xx, timeout, or connection error |
| SLOW | Yellow | Response time > slowThreshold |

## Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** HTML/CSS/JavaScript
- **HTTP Client:** Axios
