/**
 * data/darshanVideosHelper.js
 * ===========================
 * Persistent helper for temple darshan videos (திருக்கோவில் தரிசன காணொளி).
 */

const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'darshanVideos.json');

const DEFAULT_DARSHAN_DATA = {
  title: 'தரிசன காணொளி',
  title_en: 'Darshan Videos',
  description: 'அம்மனின் சிறப்பு அலங்காரங்கள் மற்றும் திருவிழா நிகழ்வுகளைக் கண்டு தரிசனம் செய்யுங்கள்.',
  description_en: 'Witness divine alankaram, sacred rituals, and grand festival celebration moments of Amman.',
  videos: []
};

function readDarshanVideos() {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      writeDarshanVideos(DEFAULT_DARSHAN_DATA);
      return DEFAULT_DARSHAN_DATA;
    }
    const raw = fs.readFileSync(FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.videos)) {
      return parsed;
    }
    writeDarshanVideos(DEFAULT_DARSHAN_DATA);
    return DEFAULT_DARSHAN_DATA;
  } catch (error) {
    console.error('Error reading darshanVideos.json:', error);
    return DEFAULT_DARSHAN_DATA;
  }
}

function writeDarshanVideos(data) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing darshanVideos.json:', error);
    return false;
  }
}

function updateSectionInfo(title, description, title_en, description_en) {
  const current = readDarshanVideos();
  if (title !== undefined) current.title = (title || '').trim();
  if (description !== undefined) current.description = (description || '').trim();
  if (title_en !== undefined) current.title_en = (title_en || '').trim();
  if (description_en !== undefined) current.description_en = (description_en || '').trim();
  writeDarshanVideos(current);
  return current;
}

const { processAndCompressVideo } = require('../services/videoCompressor');

async function addVideo(videoData) {
  const current = readDarshanVideos();
  const autoplay = Boolean(videoData.autoplay);
  const loop = videoData.loop !== false;
  const muted = videoData.muted !== false;
  const controls = videoData.controls !== false;
  const processedUrl = await processAndCompressVideo((videoData.url || '').trim());

  const newVideo = {
    id: videoData.id || `video-${Date.now()}`,
    title: (videoData.title || '').trim() || 'தரிசன காணொளி',
    category: (videoData.category || '').trim() || 'சிறப்பு பூஜை',
    description: (videoData.description || '').trim(),
    date: (videoData.date || '').trim() || new Date().toISOString().split('T')[0],
    url: processedUrl,
    autoplay,
    loop,
    muted,
    controls
  };

  current.videos.push(newVideo);
  writeDarshanVideos(current);
  return newVideo;
}

async function updateVideo(id, videoData) {
  const current = readDarshanVideos();
  const index = current.videos.findIndex((v) => v.id === id);
  if (index === -1) {
    throw new Error('காணொளி கிடைக்கவில்லை');
  }

  const existing = current.videos[index];
  const autoplay = videoData.autoplay !== undefined ? Boolean(videoData.autoplay) : Boolean(existing.autoplay);
  const loop = videoData.loop !== undefined ? Boolean(videoData.loop) : (existing.loop !== false);
  const muted = videoData.muted !== undefined ? Boolean(videoData.muted) : (existing.muted !== false);
  const controls = videoData.controls !== undefined ? Boolean(videoData.controls) : (existing.controls !== false);
  
  let url = (videoData.url !== undefined ? videoData.url : existing.url || '').trim();
  if (url && url.startsWith('data:video')) {
    url = await processAndCompressVideo(url);
  }

  const updated = {
    ...existing,
    title: videoData.title !== undefined ? videoData.title.trim() : existing.title,
    category: videoData.category !== undefined ? (videoData.category || '').trim() : (existing.category || 'சிறப்பு பூஜை'),
    description: videoData.description !== undefined ? (videoData.description || '').trim() : (existing.description || ''),
    date: videoData.date !== undefined ? (videoData.date || '').trim() : (existing.date || ''),
    url,
    autoplay,
    loop,
    muted,
    controls
  };

  current.videos[index] = updated;
  writeDarshanVideos(current);
  return updated;
}

function deleteVideo(id) {
  const current = readDarshanVideos();
  const initialLength = current.videos.length;
  current.videos = current.videos.filter((v) => v.id !== id);
  if (current.videos.length === initialLength) {
    throw new Error('காணொளி கிடைக்கவில்லை');
  }
  writeDarshanVideos(current);
  return true;
}

module.exports = {
  DEFAULT_DARSHAN_DATA,
  readDarshanVideos,
  writeDarshanVideos,
  updateSectionInfo,
  addVideo,
  updateVideo,
  deleteVideo
};
