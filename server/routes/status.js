const express = require('express');
const router = express.Router();
const { checkAllSites, checkSiteById, loadConfig } = require('../services/checker');

router.get('/status', async (req, res) => {
  try {
    const results = await checkAllSites();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check sites', message: error.message });
  }
});

router.get('/status/:siteId', async (req, res) => {
  try {
    const result = await checkSiteById(req.params.siteId);
    if (!result) {
      return res.status(404).json({ error: 'Site not found' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check site', message: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const results = await checkAllSites();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh', message: error.message });
  }
});

router.get('/config', (req, res) => {
  try {
    const config = loadConfig();
    res.json({ settings: config.settings, siteCount: config.sites.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load config', message: error.message });
  }
});

router.post('/auth', (req, res) => {
  try {
    const config = loadConfig();
    const { password } = req.body;
    const correctPassword = config.settings.password;

    if (!correctPassword) {
      return res.json({ success: true });
    }

    if (password === correctPassword) {
      return res.json({ success: true });
    }

    return res.status(401).json({ success: false, error: 'Invalid password' });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed', message: error.message });
  }
});

module.exports = router;
