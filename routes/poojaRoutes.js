/**
 * routes/poojaRoutes.js
 * =====================
 * API routes for temple poojas, rituals, and special festivals.
 */

const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/adminAuth');
const poojaController = require('../controllers/poojaController');

// Public endpoints
router.get('/', poojaController.getPoojas);
router.get('/icons', poojaController.getPoojaIcons);

// Admin-protected CRUD endpoints
router.post('/', requireAdmin, poojaController.createPooja);
router.put('/:id', requireAdmin, poojaController.updatePooja);
router.delete('/:id', requireAdmin, poojaController.deletePooja);

module.exports = router;
