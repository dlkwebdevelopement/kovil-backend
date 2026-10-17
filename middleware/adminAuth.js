/**
 * middleware/adminAuth.js
 * =======================
 * Administrator authentication and session verification.
 * Supports persistent sessions across server reboots via adminSessions.json
 * and Master API Key bypass.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('../config');

const SESSIONS_FILE = path.join(__dirname, '..', 'data', 'adminSessions.json');
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const sessions = new Map();

function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const content = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      const data = JSON.parse(content);
      const now = Date.now();
      if (Array.isArray(data)) {
        data.forEach(([token, sess]) => {
          if (sess && (now - sess.createdAt) < SESSION_TTL_MS) {
            sessions.set(token, sess);
          }
        });
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not load admin sessions file:', err.message);
  }
}

function saveSessions() {
  try {
    const list = Array.from(sessions.entries());
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('❌ Failed to save admin sessions file:', err.message);
  }
}

// Initial load on module require
loadSessions();

function login(username, password) {
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return null;
  const token = crypto.randomBytes(32).toString('hex');
  const sess = { username, createdAt: Date.now() };
  sessions.set(token, sess);
  saveSessions();
  return token;
}

function logout(token) {
  if (token && sessions.has(token)) {
    sessions.delete(token);
    saveSessions();
  }
}

function requireAdmin(req, res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice(7).trim()
    : (req.headers['x-api-key'] || req.query.token || '').trim();

  if (!token) {
    return res.status(401).json({ success: false, error: 'Admin login required' });
  }

  // 1. Allow Master API Key
  const masterKey = config.MASTER_API_KEY || process.env.MASTER_API_KEY;
  if (token === masterKey) {
    req.adminSession = { username: ADMIN_USERNAME, isMaster: true };
    return next();
  }

  // 2. Check in-memory session cache
  if (sessions.has(token)) {
    const sess = sessions.get(token);
    if (Date.now() - sess.createdAt < SESSION_TTL_MS) {
      req.adminSession = sess;
      return next();
    } else {
      sessions.delete(token);
      saveSessions();
    }
  }

  // 3. Fallback: reload from disk in case written by another worker/process
  loadSessions();
  if (sessions.has(token)) {
    const sess = sessions.get(token);
    if (Date.now() - sess.createdAt < SESSION_TTL_MS) {
      req.adminSession = sess;
      return next();
    }
  }

  return res.status(401).json({ success: false, error: 'Admin login required' });
}

module.exports = {
  login,
  logout,
  requireAdmin,
  ADMIN_USERNAME,
};
