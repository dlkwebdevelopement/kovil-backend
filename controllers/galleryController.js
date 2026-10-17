/**
 * controllers/galleryController.js
 * =================================
 * Handlers for photo gallery items.
 */

const galleryService = require('../services/galleryService');

function getGallery(req, res, next) {
  try {
    const data = galleryService.getGallery();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

function updateGallery(req, res, next) {
  try {
    const galleryItems = req.body.gallery;
    if (!Array.isArray(galleryItems)) {
      return res.status(400).json({ success: false, error: 'Invalid payload: gallery array expected' });
    }
    const data = galleryService.updateGallery(galleryItems);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getGallery,
  updateGallery
};
