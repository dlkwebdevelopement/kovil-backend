/**
 * routes/contactRoutes.js
 * =======================
 * Route definitions for temple contact details and map embed URL.
 */

const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/adminAuth');
const contactController = require('../controllers/contactController');

// Public
router.get('/', contactController.getContact);

// Admin-protected
router.post('/', requireAdmin, contactController.updateContact);

module.exports = router;
