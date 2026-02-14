const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const configPath = path.join(__dirname, '../../sites.json');

function loadConfig() {
  const data = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(data);
}

async function checkSite(site, defaultTimeout, slowThreshold) {
  const timeout = site.timeout || defaultTimeout;
  const startTime = Date.now();

  try {
    const response = await axios.get(site.url, {
      timeout,
      validateStatus: () => true,
      headers: {
        'User-Agent': 'SiteStatusChecker/1.0'
      },
      httpsAgent
    });

    const responseTime = Date.now() - startTime;
    const isUp = response.status >= 200 && response.status < 400;
    const isSlow = responseTime > slowThreshold;

    return {
      id: site.id,
      name: site.name,
      url: site.url,
      link: site.link || site.url,
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
      link: site.link || site.url,
      status: 'down',
      statusCode: null,
      responseTime: null,
      error: error.code || error.message,
      checkedAt: new Date().toISOString()
    };
  }
}

async function checkAllSites() {
  const config = loadConfig();
  const { defaultTimeout, slowThreshold } = config.settings;

  const results = await Promise.all(
    config.sites.map(site => checkSite(site, defaultTimeout, slowThreshold))
  );

  return {
    checkedAt: new Date().toISOString(),
    sites: results
  };
}

async function checkSiteById(siteId) {
  const config = loadConfig();
  const { defaultTimeout, slowThreshold } = config.settings;
  const site = config.sites.find(s => s.id === siteId);

  if (!site) {
    return null;
  }

  return checkSite(site, defaultTimeout, slowThreshold);
}

module.exports = {
  checkAllSites,
  checkSiteById,
  loadConfig
};
