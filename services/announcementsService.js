/**
 * services/announcementsService.js
 * =================================
 * Data operations for temple announcements & annadhanam details.
 */

const { readAnnouncements, writeAnnouncements } = require('../data/announcementsHelper');

function getAnnouncements() {
  return readAnnouncements();
}

function updateAnnouncements({ announcements, annadhanam, annadhanamImage }) {
  const current = readAnnouncements();

  if (Array.isArray(announcements)) {
    current.announcements = announcements;
  }
  if (typeof annadhanam === 'string') {
    current.annadhanam = annadhanam;
  }
  if (typeof annadhanamImage === 'string') {
    current.annadhanamImage = annadhanamImage;
  }

  writeAnnouncements(current);
  return current;
}

module.exports = {
  getAnnouncements,
  updateAnnouncements
};
