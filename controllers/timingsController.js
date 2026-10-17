/**
 * controllers/timingsController.js
 * =================================
 * Handlers for temple opening hours & pooja timings.
 */

const timingsService = require('../services/timingsService');

function getTimings(req, res, next) {
  try {
    const data = timingsService.getTimings();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

function updateTimings(req, res, next) {
  try {
    const payload = req.body;
    timingsService.updateTimings(payload);
    res.json({ success: true, data: payload });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTimings,
  updateTimings
};
