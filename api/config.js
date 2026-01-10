const { getConfig, DEFAULT_TIMEOUT, SLOW_THRESHOLD } = require('../lib/checker');
const { isConfigured } = require('../lib/tailscale');

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

    return res.status(200).json({
      settings: {
        checkInterval: 30000,
        defaultTimeout: DEFAULT_TIMEOUT,
        slowThreshold: SLOW_THRESHOLD
      },
      siteCount: sites.length,
      tailscaleConfigured: isConfigured()
    });
  } catch (error) {
    console.error('Config error:', error);
    return res.status(500).json({
      error: 'Failed to get configuration',
      message: error.message
    });
  }
};
