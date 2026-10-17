/**
 * services/darshanVideosService.js
 * ================================
 * Business logic for temple darshan videos.
 */

const darshanVideosHelper = require('../data/darshanVideosHelper');

function getDarshanVideos() {
  return darshanVideosHelper.readDarshanVideos();
}

function updateSection(payload) {
  return darshanVideosHelper.updateSectionInfo(payload.title, payload.description, payload.title_en, payload.description_en);
}

async function createVideo(payload) {
  return await darshanVideosHelper.addVideo(payload);
}

async function modifyVideo(id, payload) {
  return await darshanVideosHelper.updateVideo(id, payload);
}

function removeVideo(id) {
  return darshanVideosHelper.deleteVideo(id);
}

module.exports = {
  getDarshanVideos,
  updateSection,
  createVideo,
  modifyVideo,
  removeVideo
};
