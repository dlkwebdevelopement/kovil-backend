/**
 * services/galleryService.js
 * ==========================
 * Data operations for temple gallery images.
 */

const { readGallery, writeGallery } = require('../data/galleryHelper');

function getGallery() {
  return readGallery();
}

function updateGallery(galleryItems) {
  if (!Array.isArray(galleryItems)) {
    throw new Error('Invalid gallery payload: expected array');
  }
  writeGallery(galleryItems);
  return galleryItems;
}

module.exports = {
  getGallery,
  updateGallery
};
