/**
 * controllers/keysController.js
 * ==============================
 * Controller for generating, listing and revoking API keys.
 */

const { generateKey, listKeys, revokeKey } = require('../middleware/apiKey');

function generateApiKey(req, res) {
  const { name, description } = req.body || {};
  const newKey = generateKey(name, description);

  res.json({
    success: true,
    message: 'API key generated successfully',
    key: newKey,
  });
}

function listApiKeys(req, res) {
  const keys = listKeys();
  res.json({
    success: true,
    count: keys.length,
    keys,
  });
}

function revokeApiKey(req, res) {
  const { key } = req.body || {};
  if (!key) {
    return res.status(400).json({ success: false, error: 'key field required' });
  }

  const revoked = revokeKey(key);
  res.json({
    success: revoked,
    message: revoked ? 'Key revoked' : 'Key not found',
  });
}

module.exports = {
  generateApiKey,
  listApiKeys,
  revokeApiKey
};
