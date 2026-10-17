/**
 * routes/galleryRoutes.js
 * =======================
 * Route definitions for temple photo gallery.
 */

const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/adminAuth');
const galleryController = require('../controllers/galleryController');

// Public
router.get('/', galleryController.getGallery);

// Admin-protected
router.post('/', requireAdmin, galleryController.updateGallery);

module.exports = router;
