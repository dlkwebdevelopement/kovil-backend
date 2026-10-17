/**
 * routes/darshanVideosRoutes.js
 * ==============================
 * API routes for temple darshan videos (திருக்கோவில் தரிசன காணொளி).
 */

const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/adminAuth');
const darshanVideosController = require('../controllers/darshanVideosController');

// Public route for frontend
router.get('/', darshanVideosController.getDarshanVideos);

// Admin-protected management routes
router.put('/section', requireAdmin, darshanVideosController.updateSection);
router.post('/', requireAdmin, darshanVideosController.createVideo);
router.put('/:id', requireAdmin, darshanVideosController.updateVideo);
router.delete('/:id', requireAdmin, darshanVideosController.deleteVideo);

module.exports = router;
