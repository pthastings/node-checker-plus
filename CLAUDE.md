# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run start:local` - Start local Express server (uses `sites.json`)
- `npm run deploy` - Deploy to Vercel production
- `vercel --prod` - Alternative deploy command
- `vercel env ls` - List Vercel environment variables
- `vercel env pull` - Pull env vars to local `.env` file

## Architecture

Site status monitoring dashboard with **dual deployment modes**:

### Vercel Serverless (Production)
- `api/` - Serverless functions auto-mapped to `/api/*`
  - `status.js` - GET /api/status (all sites)
  - `status/[siteId].js` - GET /api/status/:id (single site)
  - `refresh.js` - POST /api/refresh
  - `config.js` - GET /api/config
  - `auth.js` - POST /api/auth
- `lib/checker.js` - HTTP check logic, reads `SITES_CONFIG` env var
- `lib/tailscale.js` - Tailscale API client

### Local Express (Development)
- `server/index.js` - Express server entry point
- `server/routes/status.js` - API route handlers
- `server/services/checker.js` - Checking logic, reads `sites.json`

### Frontend
- `public/` - Static files (index.html, app.js, styles.css)
- Vanilla JS with auto-refresh every 30 seconds

## Configuration

### Vercel Environment Variables

| Variable | Description |
|----------|-------------|
| `SITES_CONFIG` | JSON string with sites array (required) |
| `TAILSCALE_API_KEY` | API key from Tailscale admin console |
| `TAILSCALE_TAILNET` | Tailnet name (use `-` for default) |
| `DEFAULT_TIMEOUT` | Request timeout ms (default: 5000) |
| `SLOW_THRESHOLD` | Slow threshold ms (default: 2000) |

### SITES_CONFIG Format

```json
{"sites":[{"id":"my-site","name":"My Site","type":"http","url":"https://example.com"},{"id":"my-device","name":"My Device","type":"tailscale","deviceId":"device-name.tail1234.ts.net"}]}
```

## Critical: Tailscale Device IDs

**The `deviceId` must match the FULL device name from Tailscale API**, including the tailnet suffix.

- **Correct:** `cambridge-node.tail3ef52.ts.net`
- **Wrong:** `cambridge-node`

The checker matches deviceId against: `device.id`, `device.nodeKey`, `device.name`, or `device.hostname` (see `lib/checker.js:78-83`).

To find correct device names:
```bash
curl -s -u "YOUR_API_KEY:" "https://api.tailscale.com/api/v2/tailnet/-/devices" | jq '.devices[].name'
```

## Site Types

| Type | Check Method | Required Fields |
|------|--------------|-----------------|
| `http` | HTTP GET request | `url` |
| `tailscale` | Tailscale API device lookup | `deviceId` (full name with tailnet suffix) |

HTTP checks work from Vercel for public URLs. Tailscale MagicDNS URLs (`*.ts.net`) are NOT reachable from Vercel - use `type: "tailscale"` for those devices instead.
