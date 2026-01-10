const axios = require('axios');

const DEFAULT_TIMEOUT = parseInt(process.env.DEFAULT_TIMEOUT) || 5000;
const SLOW_THRESHOLD = parseInt(process.env.SLOW_THRESHOLD) || 2000;

function getConfig() {
  const configStr = process.env.SITES_CONFIG;
  if (!configStr) {
    throw new Error('SITES_CONFIG environment variable is not set');
  }
  return JSON.parse(configStr);
}

async function checkHttpSite(site) {
  const timeout = site.timeout || DEFAULT_TIMEOUT;
  const startTime = Date.now();

  try {
    const response = await axios.get(site.url, {
      timeout,
      validateStatus: () => true,
      headers: {
        'User-Agent': 'SiteStatusChecker/2.0'
      }
    });

    const responseTime = Date.now() - startTime;
    const isUp = response.status >= 200 && response.status < 400;
    const isSlow = responseTime > SLOW_THRESHOLD;

    return {
      id: site.id,
      name: site.name,
      url: site.url,
      type: 'http',
      status: isUp ? (isSlow ? 'slow' : 'up') : 'down',
      statusCode: response.status,
      responseTime,
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      id: site.id,
      name: site.name,
      url: site.url,
      type: 'http',
      status: 'down',
      statusCode: null,
      responseTime: null,
      error: error.code || error.message,
      checkedAt: new Date().toISOString()
    };
  }
}

async function checkSite(site, tailscaleDevices = null) {
  if (site.type === 'tailscale') {
    return checkTailscaleSite(site, tailscaleDevices);
  }
  return checkHttpSite(site);
}

function checkTailscaleSite(site, tailscaleDevices) {
  if (!tailscaleDevices) {
    return {
      id: site.id,
      name: site.name,
      type: 'tailscale',
      deviceId: site.deviceId,
      status: 'down',
      error: 'Tailscale API not available',
      checkedAt: new Date().toISOString()
    };
  }

  const device = tailscaleDevices.find(d =>
    d.id === site.deviceId ||
    d.nodeKey === site.deviceId ||
    d.name === site.deviceId ||
    d.hostname === site.deviceId
  );

  if (!device) {
    return {
      id: site.id,
      name: site.name,
      type: 'tailscale',
      deviceId: site.deviceId,
      status: 'down',
      error: 'Device not found in Tailscale',
      checkedAt: new Date().toISOString()
    };
  }

  const isOnline = device.connectedToControl === true;

  return {
    id: site.id,
    name: site.name,
    type: 'tailscale',
    deviceId: site.deviceId,
    hostname: device.hostname,
    status: isOnline ? 'up' : 'down',
    lastSeen: device.lastSeen,
    checkedAt: new Date().toISOString()
  };
}

module.exports = {
  getConfig,
  checkSite,
  checkHttpSite,
  checkTailscaleSite,
  DEFAULT_TIMEOUT,
  SLOW_THRESHOLD
};
