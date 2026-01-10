# Site Status Dashboard

A lightweight web dashboard for monitoring website and API availability, deployed on Vercel with Tailscale integration.

**Live Demo:** https://node-checker-plus.vercel.app

## Features

- **Tailscale Integration** - Monitor devices via Tailscale Funnel URLs or Tailscale API
- **Dark Mode Toggle** - Switch between light/dark themes with localStorage persistence
- **Live "Time Ago" Display** - Real-time updates showing when last check occurred
- **HTTP Health Checks** - Monitor sites via HTTP requests with response time tracking
- **Tailscale Device Status** - Check if devices are online via Tailscale API
- **Visual Status Indicators** - Color-coded status (green=UP, yellow=SLOW, red=DOWN)
- **Auto-Refresh** - Automatic checks every 30 seconds
- **Serverless** - Runs on Vercel's edge network

## Quick Start

### Deploy to Vercel

1. Fork this repository
2. Import to Vercel: https://vercel.com/new
3. Add environment variables (see Configuration below)
4. Deploy!

### Local Development

```bash
npm install
vercel dev
```

Open http://localhost:3000

## Configuration

Set these environment variables in your Vercel project settings:

| Variable | Description | Required |
|----------|-------------|----------|
| `SITES_CONFIG` | JSON string with sites array | Yes |
| `TAILSCALE_API_KEY` | API key for device status checks | For Tailscale devices |
| `TAILSCALE_TAILNET` | Your tailnet name | For Tailscale devices |
| `DEFAULT_TIMEOUT` | Request timeout in ms (default: 5000) | No |
| `SLOW_THRESHOLD` | Slow response threshold in ms (default: 2000) | No |

### SITES_CONFIG Format

```json
{
  "sites": [
    {
      "id": "webserver",
      "name": "Web Server",
      "type": "http",
      "url": "https://myserver.tail1234.ts.net"
    },
    {
      "id": "nas",
      "name": "NAS",
      "type": "tailscale",
      "deviceId": "nas-hostname"
    }
  ]
}
```

### Site Types

| Type | Use Case | Required Fields |
|------|----------|-----------------|
| `http` | Devices with web UI accessible via Tailscale Funnel | `url` (*.ts.net) |
| `tailscale` | Devices without web UI (online/offline only) | `deviceId` |

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

## Tailscale Setup

### Enable Funnel on Devices

For devices with web UIs, enable Tailscale Funnel:

```bash
# On each device
tailscale funnel 80  # or your web UI port
```

Your device will be accessible at `https://{hostname}.{tailnet}.ts.net`

### Get Tailscale API Key

1. Go to https://login.tailscale.com/admin/settings/keys
2. Generate an API access token
3. Add as `TAILSCALE_API_KEY` environment variable

## Tech Stack

- **Platform:** Vercel Serverless Functions
- **Frontend:** HTML/CSS/JavaScript (vanilla)
- **HTTP Client:** Axios
- **APIs:** Tailscale API v2

## Project Structure

```
├── api/
│   ├── status.js          # GET /api/status
│   ├── status/[siteId].js  # GET /api/status/:id
│   ├── refresh.js          # POST /api/refresh
│   └── config.js           # GET /api/config
├── lib/
│   ├── checker.js          # HTTP health check logic
│   └── tailscale.js        # Tailscale API client
├── public/
│   ├── index.html          # Dashboard UI
│   ├── app.js              # Frontend logic
│   └── styles.css          # Styling with dark mode
└── vercel.json             # Vercel configuration
```

## License

MIT
