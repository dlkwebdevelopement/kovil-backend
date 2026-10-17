/**
 * controllers/upcomingEventsController.js
 * =======================================
 * Handlers for upcoming events and banner/image uploads.
 */

const upcomingEventsService = require('../services/upcomingEventsService');

function getUpcomingEvents(req, res, next) {
  try {
    const data = upcomingEventsService.getAllEvents();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

function createUpcomingEvents(req, res, next) {
  try {
    const saved = upcomingEventsService.createEvents(req.body);
    res.json({ success: true, data: saved, count: saved.length });
  } catch (error) {
    next(error);
  }
}

function updateUpcomingEvent(req, res, next) {
  try {
    const { id } = req.params;
    const updated = upcomingEventsService.updateEvent(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Upcoming event not found' });
    }
    res.json({ success: true, data: [updated], count: 1 });
  } catch (error) {
    next(error);
  }
}

function deleteUpcomingEvent(req, res, next) {
  try {
    const { id } = req.params;
    const result = upcomingEventsService.deleteEvent(id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Upcoming event not found' });
    }
    res.json({ success: true, deletedId: result.deletedId, count: result.remainingCount });
  } catch (error) {
    next(error);
  }
}

function uploadEventImage(req, res) {
  const { imageBase64, fileName = 'event-upload.png', images } = req.body || {};

  // Support batch upload of multiple images (up to 25)
  if (Array.isArray(images)) {
    if (images.length === 0) {
      return res.status(400).json({ success: false, error: 'No images provided in batch' });
    }
    if (images.length > 25) {
      return res.status(400).json({ success: false, error: 'அதிகபட்சம் 25 படங்கள் மட்டுமே பதிவேற்ற முடியும் (Maximum 25 images limit exceeded)' });
    }
    try {
      const imageUrls = upcomingEventsService.saveUploadedImages(images);
      return res.json({ success: true, imageUrls, count: imageUrls.length });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message || 'Batch upload failed' });
    }
  }

  // Single image upload
  if (!imageBase64) {
    return res.status(400).json({ success: false, error: 'Image data is required' });
  }

  try {
    const imageUrl = upcomingEventsService.saveUploadedImage(imageBase64, fileName);
    res.json({ success: true, imageUrl });
  } catch (error) {
    const isClientError = error.message.includes('required') || error.message.includes('Unsupported');
    res.status(isClientError ? 400 : 500).json({ success: false, error: error.message || 'Image upload failed' });
  }
}

module.exports = {
  getUpcomingEvents,
  createUpcomingEvents,
  updateUpcomingEvent,
  deleteUpcomingEvent,
  uploadEventImage
};
