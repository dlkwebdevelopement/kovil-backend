/**
 * routes/donationRoutes.js
 * ========================
 * Route definitions for donation information and bank transfer details.
 */

const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/adminAuth');
const donationController = require('../controllers/donationController');

// Public
router.get('/', donationController.getDonation);

// Admin-protected
router.post('/', requireAdmin, donationController.updateDonation);

module.exports = router;
