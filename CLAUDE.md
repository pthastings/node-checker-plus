# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload (Node 18+)
- `PORT=3001 npm start` - Run on a custom port

## Architecture

This is a Node.js + Express site status monitoring dashboard.

### Backend
- Entry point: `server/index.js` - Express server setup
- Routes: `server/routes/status.js` - API endpoints for status checks
- Services: `server/services/checker.js` - Site checking logic using axios

### Frontend
- Static files served from `public/`
- `public/index.html` - Dashboard HTML
- `public/styles.css` - Styling with status indicators (green/yellow/red)
- `public/app.js` - Frontend logic with auto-refresh every 30 seconds and live "time ago" display

### Configuration
- `sites.json` - Site definitions and settings
  - `settings.checkInterval` - Auto-refresh interval (ms)
  - `settings.defaultTimeout` - Request timeout (ms)
  - `settings.slowThreshold` - Response time threshold for "slow" status (ms)
  - `sites[]` - Array of sites with id, name, url, optional timeout

## API Endpoints

- `GET /api/status` - Get status of all configured sites
- `GET /api/status/:siteId` - Get status of a specific site
- `POST /api/refresh` - Trigger immediate status check
- `GET /api/config` - Get current configuration settings

## Features

- **Dark Mode Toggle**: Click the sun/moon icon to switch themes; persists in localStorage and respects system preference
- **Live "Time Ago" Display**: The "Last checked" timestamp updates every second showing relative time (e.g., "just now", "30 seconds ago", "2 minutes ago")
- **Auto-Refresh**: Status checks run automatically every 30 seconds
- **Manual Refresh**: Click the Refresh button to trigger an immediate status check
- **Visual Status Indicators**: Color-coded status (green=UP, red=DOWN, yellow=SLOW) with glow effects
- **Response Time Tracking**: Displays response time in milliseconds for each site
- **Responsive Design**: Mobile-friendly layout that adapts to smaller screens
