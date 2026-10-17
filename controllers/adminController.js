/**
 * controllers/adminController.js
 * ===============================
 * Authentication controller for temple administrator panel.
 */

const { login } = require('../middleware/adminAuth');

function handleLogin(req, res) {
  const { username, password } = req.body || {};
  const token = login(username, password);

  if (!token) {
    return res.status(401).json({ success: false, error: 'Invalid username or password' });
  }

  res.json({ success: true, token, username });
}

function handleVerify(req, res) {
  res.json({
    success: true,
    authenticated: true,
    username: req.adminSession?.username || 'admin',
    isMaster: !!req.adminSession?.isMaster,
  });
}

module.exports = {
  handleLogin,
  handleVerify,
};
