/**
 * services/timingsService.js
 * ==========================
 * Data operations for temple opening & pooja timings.
 */

const { readTimings, writeTimings } = require('../data/timingsHelper');

function getTimings() {
  return readTimings();
}

function updateTimings(payload) {
  writeTimings(payload);
  return payload;
}

module.exports = {
  getTimings,
  updateTimings
};
