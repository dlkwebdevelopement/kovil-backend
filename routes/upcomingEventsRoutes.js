/**
 * routes/upcomingEventsRoutes.js
 * ==============================
 * Route definitions for upcoming events and image upload.
 */

const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/adminAuth');
const upcomingEventsController = require('../controllers/upcomingEventsController');

// Public endpoints
router.get('/', upcomingEventsController.getUpcomingEvents);

// Admin-protected endpoints
router.post('/', requireAdmin, upcomingEventsController.createUpcomingEvents);
router.put('/:id', requireAdmin, upcomingEventsController.updateUpcomingEvent);
router.delete('/:id', requireAdmin, upcomingEventsController.deleteUpcomingEvent);
router.post('/upload-image', requireAdmin, upcomingEventsController.uploadEventImage);

module.exports = router;
