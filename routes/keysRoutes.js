/**
 * routes/keysRoutes.js
 * ====================
 * Route definitions for API key generation and revocation.
 */

const express = require('express');
const router = express.Router();
const config = require('../config');
const keysController = require('../controllers/keysController');

function requireMaster(req, res, next) {
  if (req.adminSession) return next();

  const masterKey = config.MASTER_API_KEY;
  const provided = req.headers['x-api-key'] || req.query.api_key || req.body?.master_key;

  if (provided !== masterKey) {
    return res.status(403).json({
      success: false,
      error: 'Master API key required for this operation',
    });
  }
  next();
}

router.post('/generate', requireMaster, keysController.generateApiKey);
router.get('/list', requireMaster, keysController.listApiKeys);
router.post('/revoke', requireMaster, keysController.revokeApiKey);

module.exports = router;
