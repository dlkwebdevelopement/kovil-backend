/**
 * controllers/donationController.js
 * ==================================
 * Handlers for donation details & bank account info.
 */

const donationService = require('../services/donationService');

function getDonation(req, res, next) {
  try {
    const data = donationService.getDonation();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

function updateDonation(req, res, next) {
  try {
    const payload = req.body;
    donationService.updateDonation(payload);
    res.json({ success: true, data: payload });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDonation,
  updateDonation
};
