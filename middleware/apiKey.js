/**
 * middleware/apiKey.js
 * ====================
 * API Key authentication middleware.
 * 
 * - Keys are stored in a JSON file (api_keys.json)
 * - Master key from .env can generate new keys
 * - Each key has: name, key, created_at, active, usage_count
 * - Rate limiting: 1000 requests/hour per key
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const KEYS_FILE = path.join(__dirname, '..', 'data', 'api_keys.json');

// In-memory rate limit tracking
const rateLimits = {};
const RATE_LIMIT = 1000; // requests per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

/**
 * Load API keys from file
 */
function loadKeys() {
  if (!fs.existsSync(KEYS_FILE)) {
    const initial = {
      keys: [
        {
          name: 'Default Temple Key',
          key: 'temple-api-' + uuidv4().split('-').slice(0, 3).join(''),
          created_at: new Date().toISOString(),
          active: true,
          usage_count: 0,
          description: 'Auto-generated default API key',
        }
      ]
    };
    fs.writeFileSync(KEYS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    console.log(`🔑 Created default API key: ${initial.keys[0].key}`);
    return initial;
  }
  return JSON.parse(fs.readFileSync(KEYS_FILE, 'utf-8'));
}

/**
 * Save API keys to file
 */
function saveKeys(data) {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Generate a new API key
 */
function generateKey(name, description = '') {
  const data = loadKeys();
  const newKey = {
    name: name || 'Unnamed Key',
    key: 'temple-api-' + uuidv4().replace(/-/g, '').substring(0, 24),
    created_at: new Date().toISOString(),
    active: true,
    usage_count: 0,
    description,
  };
  data.keys.push(newKey);
  saveKeys(data);
  return newKey;
}

/**
 * List all API keys (masked)
 */
function listKeys() {
  const data = loadKeys();
  return data.keys.map(k => ({
    name: k.name,
    key_preview: k.key.substring(0, 12) + '...' + k.key.substring(k.key.length - 4),
    key: k.key,
    created_at: k.created_at,
    active: k.active,
    usage_count: k.usage_count,
    description: k.description,
  }));
}

/**
 * Revoke an API key
 */
function revokeKey(keyValue) {
  const data = loadKeys();
  const found = data.keys.find(k => k.key === keyValue);
  if (found) {
    found.active = false;
    saveKeys(data);
    return true;
  }
  return false;
}

/**
 * Check rate limit for a key
 */
function checkRateLimit(key) {
  const now = Date.now();
  if (!rateLimits[key]) {
    rateLimits[key] = { count: 0, windowStart: now };
  }

  const entry = rateLimits[key];
  if (now - entry.windowStart > RATE_WINDOW) {
    entry.count = 0;
    entry.windowStart = now;
  }

  entry.count++;
  return entry.count <= RATE_LIMIT;
}

/**
 * Express middleware — validates API key from header or query param
 * 
 * Pass API key via:
 *   - Header: X-API-Key: <key>
 *   - Query param: ?api_key=<key>
 * 
 * Frontend routes (serving HTML) skip auth.
 */
function apiKeyAuth(req, res, next) {
  const reqPath = req.path || '';
  const originalUrl = req.originalUrl || '';
  const isPublicRoute = (
    req.method === 'GET' && (
      reqPath.startsWith('/panchangam') ||
      reqPath.startsWith('/admin') ||
      reqPath.startsWith('/keys') ||
      reqPath.startsWith('/upcoming-events') ||
      reqPath.startsWith('/announcements') ||
      reqPath.startsWith('/gallery') ||
      reqPath.startsWith('/contact') ||
      reqPath.startsWith('/donation') ||
      reqPath.startsWith('/timings') ||
      reqPath.startsWith('/pooja') ||
      reqPath.startsWith('/darshan-videos')
    )
  ) || (
    reqPath === '/' ||
    reqPath.startsWith('/frontend') ||
    reqPath.endsWith('.html') ||
    reqPath.endsWith('.css') ||
    reqPath.endsWith('.js') ||
    reqPath.endsWith('.ico') ||
    reqPath === '/api' ||
    reqPath === '/docs' ||
    originalUrl === '/api/docs' ||
    originalUrl === '/api' ||
    originalUrl.startsWith('/api/panchangam') ||
    originalUrl.startsWith('/api/admin') ||
    originalUrl.startsWith('/api/keys') ||
    originalUrl.startsWith('/api/upcoming-events') ||
    originalUrl.startsWith('/api/announcements') ||
    originalUrl.startsWith('/api/gallery') ||
    originalUrl.startsWith('/api/contact') ||
    originalUrl.startsWith('/api/donation') ||
    originalUrl.startsWith('/api/timings') ||
    originalUrl.startsWith('/api/pooja') ||
    originalUrl.startsWith('/api/darshan-videos') ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer '))
  );

  // Public temple calendar and admin access do not require API keys.
  if (isPublicRoute) {
    return next();
  }

  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const masterKey = process.env.MASTER_API_KEY;

  // Master key always works
  if (apiKey === masterKey) {
    return next();
  }

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required',
      message: 'Provide API key via X-API-Key header or api_key query parameter',
      docs: '/api/docs',
    });
  }

  // Validate key
  const data = loadKeys();
  const keyEntry = data.keys.find(k => k.key === apiKey && k.active);

  if (!keyEntry) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or inactive API key',
    });
  }

  // Rate limit check
  if (!checkRateLimit(apiKey)) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded (1000 requests/hour)',
    });
  }

  // Increment usage
  keyEntry.usage_count++;
  saveKeys(data);

  // Attach key info to request
  req.apiKeyInfo = keyEntry;
  next();
}

module.exports = {
  apiKeyAuth,
  generateKey,
  listKeys,
  revokeKey,
  loadKeys,
};
