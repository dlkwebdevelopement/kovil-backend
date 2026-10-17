/**
 * routes/index.js
 * ===============
 * Central API router combining all modular resource routes.
 */

const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/adminAuth');

// Import modular route handlers
const adminRoutes = require('./adminRoutes');
const keysRoutes = require('./keysRoutes');
const panchangamRoutes = require('./panchangamRoutes');
const upcomingEventsRoutes = require('./upcomingEventsRoutes');
const announcementsRoutes = require('./announcementsRoutes');
const contactRoutes = require('./contactRoutes');
const donationRoutes = require('./donationRoutes');
const galleryRoutes = require('./galleryRoutes');
const timingsRoutes = require('./timingsRoutes');
const poojaRoutes = require('./poojaRoutes');
const darshanVideosRoutes = require('./darshanVideosRoutes');
const docsRoutes = require('./docsRoutes');

// Documentation
router.use('/docs', docsRoutes);

// Panchangam
router.use('/panchangam', panchangamRoutes);

// Public Resource Routes
router.use('/upcoming-events', upcomingEventsRoutes);
router.use('/announcements', announcementsRoutes);
router.use('/contact', contactRoutes);
router.use('/donation', donationRoutes);
router.use('/gallery', galleryRoutes);
router.use('/timings', timingsRoutes);
router.use('/pooja', poojaRoutes);
router.use('/darshan-videos', darshanVideosRoutes);

// Admin Routes (/api/admin/*)
router.use('/admin', adminRoutes);
router.use('/admin/events', panchangamRoutes);
router.use('/admin/upcoming-events', upcomingEventsRoutes);
router.use('/admin/announcements', announcementsRoutes);
router.use('/admin/contact', contactRoutes);
router.use('/admin/donation', donationRoutes);
router.use('/admin/gallery', galleryRoutes);
router.use('/admin/timings', timingsRoutes);
router.use('/admin/pooja', poojaRoutes);
router.use('/admin/darshan-videos', darshanVideosRoutes);

// API Keys Management (Protected by Admin)
router.use('/keys', requireAdmin, keysRoutes);

module.exports = router;
