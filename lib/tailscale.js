const axios = require('axios');

const TAILSCALE_API_KEY = process.env.TAILSCALE_API_KEY;
const TAILSCALE_TAILNET = process.env.TAILSCALE_TAILNET;
const TAILSCALE_API_BASE = 'https://api.tailscale.com/api/v2';

async function getDevices() {
  if (!TAILSCALE_API_KEY || !TAILSCALE_TAILNET) {
    console.warn('Tailscale API credentials not configured');
    return null;
  }

  try {
    const response = await axios.get(
      `${TAILSCALE_API_BASE}/tailnet/${TAILSCALE_TAILNET}/devices`,
      {
        auth: {
          username: TAILSCALE_API_KEY,
          password: ''
        },
        timeout: 10000
      }
    );

    return response.data.devices || [];
  } catch (error) {
    console.error('Tailscale API error:', error.message);
    return null;
  }
}

async function getDeviceStatus(deviceId) {
  const devices = await getDevices();
  if (!devices) {
    return null;
  }

  return devices.find(d =>
    d.id === deviceId ||
    d.nodeKey === deviceId ||
    d.name === deviceId ||
    d.hostname === deviceId
  ) || null;
}

function isConfigured() {
  return !!(TAILSCALE_API_KEY && TAILSCALE_TAILNET);
}

module.exports = {
  getDevices,
  getDeviceStatus,
  isConfigured
};
