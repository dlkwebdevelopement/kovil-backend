/**
 * controllers/darshanVideosController.js
 * ======================================
 * Route controllers for temple darshan videos (திருக்கோவில் தரிசன காணொளி).
 */

const darshanVideosService = require('../services/darshanVideosService');

function getDarshanVideos(req, res, next) {
  try {
    const data = darshanVideosService.getDarshanVideos();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

function updateSection(req, res, next) {
  try {
    const data = darshanVideosService.updateSection(req.body);
    res.json({ success: true, message: 'பகுதி தலைப்பு மற்றும் விவரம் புதுப்பிக்கப்பட்டது', data });
  } catch (error) {
    next(error);
  }
}

async function createVideo(req, res, next) {
  try {
    const data = await darshanVideosService.createVideo(req.body);
    res.status(201).json({ success: true, message: 'காணொளி வெற்றிகரமாக சேர்க்கப்பட்டது (சுருக்கப்பட்டு மேம்படுத்தப்பட்டது)', data });
  } catch (error) {
    next(error);
  }
}

async function updateVideo(req, res, next) {
  try {
    const { id } = req.params;
    const data = await darshanVideosService.modifyVideo(id, req.body);
    res.json({ success: true, message: 'காணொளி விவரம் புதுப்பிக்கப்பட்டது (சுருக்கப்பட்டு மேம்படுத்தப்பட்டது)', data });
  } catch (error) {
    next(error);
  }
}

function deleteVideo(req, res, next) {
  try {
    const { id } = req.params;
    darshanVideosService.removeVideo(id);
    res.json({ success: true, message: 'காணொளி வெற்றிகரமாக நீக்கப்பட்டது' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDarshanVideos,
  updateSection,
  createVideo,
  updateVideo,
  deleteVideo
};
