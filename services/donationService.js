/**
 * services/donationService.js
 * ===========================
 * Data operations for donation bank info, QR codes & donors list.
 */

const { readDonation, writeDonation } = require('../data/donationHelper');

function getDonation() {
  return readDonation();
}

function updateDonation(payload) {
  writeDonation(payload);
  return payload;
}

module.exports = {
  getDonation,
  updateDonation
};
