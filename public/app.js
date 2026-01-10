const API_BASE = '/api';
let autoRefreshInterval = null;
let lastCheckTime = null;
let timeAgoInterval = null;

async function fetchStatus() {
  const response = await fetch(`${API_BASE}/status`);
  if (!response.ok) {
    throw new Error('Failed to fetch status');
  }
  return response.json();
}

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString();
}

function formatTimeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds} seconds ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  return `${hours} hours ago`;
}

function updateTimeAgoDisplay() {
  if (!lastCheckTime) return;
  const lastUpdated = document.getElementById('last-updated');
  lastUpdated.textContent = `Last checked: ${formatTimeAgo(lastCheckTime)}`;
}

function renderSites(data) {
  const container = document.getElementById('sites-container');

  // Store and display the last check time
  lastCheckTime = new Date(data.checkedAt);
  updateTimeAgoDisplay();

  if (data.sites.length === 0) {
    container.innerHTML = '<div class="loading">No sites configured</div>';
    return;
  }

  container.innerHTML = data.sites.map(site => `
    <div class="site-card">
      <div class="status-indicator ${site.status}"></div>
      <div class="site-info">
        <div class="site-name">${escapeHtml(site.name)}</div>
        <div class="site-url">${escapeHtml(site.url || site.hostname || site.deviceId || '')}</div>
      </div>
      <div class="site-status">
        <div class="status-text ${site.status}">${site.status}</div>
        ${site.responseTime != null
          ? `<div class="response-time">${site.responseTime}ms</div>`
          : site.error
            ? `<div class="error-message">${escapeHtml(site.error)}</div>`
            : ''
        }
      </div>
    </div>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function refreshStatus() {
  const btn = document.getElementById('refresh-btn');
  btn.disabled = true;
  btn.textContent = 'Checking...';

  try {
    const data = await fetchStatus();
    renderSites(data);
  } catch (error) {
    console.error('Failed to refresh status:', error);
    document.getElementById('sites-container').innerHTML =
      '<div class="loading">Failed to load status. Is the server running?</div>';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Refresh';
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.dataset.theme === 'dark';
  html.dataset.theme = isDark ? 'light' : 'dark';
  localStorage.setItem('theme', html.dataset.theme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const btn = document.getElementById('theme-toggle');
  const isDark = document.documentElement.dataset.theme === 'dark';
  btn.textContent = isDark ? '☀️' : '🌙';
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = saved || (prefersDark ? 'dark' : 'light');
  updateThemeIcon();
}

async function init() {
  initTheme();
  await refreshStatus();

  // Auto-refresh every 30 seconds
  autoRefreshInterval = setInterval(refreshStatus, 30000);

  // Update time ago display every second
  timeAgoInterval = setInterval(updateTimeAgoDisplay, 1000);
}

// Start the app
init();
