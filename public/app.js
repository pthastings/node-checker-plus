const API_BASE = '/api';
let autoRefreshInterval = null;

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

function renderSites(data) {
  const container = document.getElementById('sites-container');
  const lastUpdated = document.getElementById('last-updated');

  lastUpdated.textContent = `Last updated: ${formatTime(data.checkedAt)}`;

  if (data.sites.length === 0) {
    container.innerHTML = '<div class="loading">No sites configured</div>';
    return;
  }

  container.innerHTML = data.sites.map(site => `
    <div class="site-card">
      <div class="status-indicator ${site.status}"></div>
      <div class="site-info">
        <div class="site-name">${escapeHtml(site.name)}</div>
        <div class="site-url">${escapeHtml(site.url)}</div>
      </div>
      <div class="site-status">
        <div class="status-text ${site.status}">${site.status}</div>
        ${site.responseTime !== null
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

async function init() {
  await refreshStatus();

  // Auto-refresh every 30 seconds
  autoRefreshInterval = setInterval(refreshStatus, 30000);
}

// Start the app
init();
