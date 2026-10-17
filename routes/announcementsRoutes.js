/**
 * routes/announcementsRoutes.js
 * ==============================
 * Route definitions for announcements and annadhanam details.
 */

const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/adminAuth');
const announcementsController = require('../controllers/announcementsController');

// Public
router.get('/', announcementsController.getAnnouncements);

// Admin-protected
router.post('/', requireAdmin, announcementsController.updateAnnouncements);

module.exports = router;
