const { getConfig, checkSite } = require('../../lib/checker');
const { getDevices } = require('../../lib/tailscale');

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

  const { siteId } = req.query;

  if (!siteId) {
    return res.status(400).json({ error: 'Site ID is required' });
  }

  try {
    const config = getConfig();
    const site = config.sites.find(s => s.id === siteId);

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Get Tailscale devices if needed
    let tailscaleDevices = null;
    if (site.type === 'tailscale') {
      tailscaleDevices = await getDevices();
    }

    const result = await checkSite(site, tailscaleDevices);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({
      error: 'Failed to check site status',
      message: error.message
    });
  }
};
