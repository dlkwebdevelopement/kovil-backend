/**
 * controllers/announcementsController.js
 * ======================================
 * Handlers for announcements & annadhanam details.
 */

const announcementsService = require('../services/announcementsService');

function getAnnouncements(req, res, next) {
  try {
    const data = announcementsService.getAnnouncements();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

function updateAnnouncements(req, res, next) {
  try {
    const data = announcementsService.updateAnnouncements(req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAnnouncements,
  updateAnnouncements
};
