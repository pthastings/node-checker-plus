const { getConfig, checkSite } = require('../lib/checker');
const { getDevices } = require('../lib/tailscale');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const config = getConfig();
    const sites = config.sites || [];

    // Check if any sites need Tailscale API
    const hasTailscaleSites = sites.some(s => s.type === 'tailscale');
    let tailscaleDevices = null;

    if (hasTailscaleSites) {
      tailscaleDevices = await getDevices();
    }

    // Check all sites in parallel
    const results = await Promise.all(
      sites.map(site => checkSite(site, tailscaleDevices))
    );

    return res.status(200).json({
      checkedAt: new Date().toISOString(),
      sites: results
    });
  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({
      error: 'Failed to check site status',
      message: error.message
    });
  }
};
