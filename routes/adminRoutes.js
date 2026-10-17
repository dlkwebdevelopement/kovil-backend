/**
 * routes/adminRoutes.js
 * =====================
 * Route definitions for administrator authentication.
 */

const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

router.post('/login', adminController.handleLogin);
router.get('/verify', requireAdmin, adminController.handleVerify);

module.exports = router;
