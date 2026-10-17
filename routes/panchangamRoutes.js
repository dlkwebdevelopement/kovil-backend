/**
 * routes/panchangamRoutes.js
 * ==========================
 * Route definitions for temple panchangam endpoints.
 */

const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/adminAuth');
const panchangamController = require('../controllers/panchangamController');

router.get('/today', panchangamController.getToday);
router.get('/daily/:date', panchangamController.getDailyByDate);
router.get('/daily', panchangamController.getDailyRange);
router.get('/month/:year/:month', panchangamController.getByMonth);
router.get('/events', panchangamController.getTempleEvents);
router.get('/events/upcoming', panchangamController.getUpcomingEvents);
router.get('/events/year/:year', panchangamController.getEventsByYear);
router.get('/search', panchangamController.searchPanchangam);
router.get('/pournami', panchangamController.getPournami);
router.get('/amavasai', panchangamController.getAmavasai);
router.get('/event-dates', panchangamController.getEventDates);
router.get('/stats', panchangamController.getStats);

// Admin-protected Temple Event CRUD endpoints
router.post('/events', requireAdmin, panchangamController.createTempleEvent);
router.put('/events/:id', requireAdmin, panchangamController.updateTempleEvent);
router.delete('/events/:id', requireAdmin, panchangamController.deleteTempleEvent);

module.exports = router;

