/**
 * routes/timingsRoutes.js
 * =======================
 * Route definitions for temple opening and pooja timings.
 */

const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/adminAuth');
const timingsController = require('../controllers/timingsController');

// Public
router.get('/', timingsController.getTimings);

// Admin-protected
router.post('/', requireAdmin, timingsController.updateTimings);

module.exports = router;
