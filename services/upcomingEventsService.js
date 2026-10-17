/**
 * services/upcomingEventsService.js
 * =================================
 * Business logic for upcoming events and associated image uploads.
 */

const fs = require('fs');
const path = require('path');
const config = require('../config');
const dataLoader = require('../data/loader');
const {
  readUpcomingEvents,
  writeUpcomingEvents,
  normalizeEvent
} = require('../data/upcomingEvents');

function getAllEvents() {
  const publicEvents = dataLoader.getUpcomingEvents ? dataLoader.getUpcomingEvents() : [];
  const customEvents = readUpcomingEvents();
  const merged = [...customEvents, ...publicEvents].map(normalizeEvent);
  const unique = new Map();

  merged.forEach((item) => {
    const key = `${item.title}|${item.date}|${item.image}`;
    if (!unique.has(key)) unique.set(key, item);
  });

  const sorted = [...unique.values()].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const featured = sorted.filter((item) => item.featured);
  const regular = sorted.filter((item) => !item.featured);

  return [...featured, ...regular];
}

function createEvents(eventsData) {
  const events = Array.isArray(eventsData) ? eventsData : [eventsData];
  const saved = events.map(normalizeEvent);
  const current = readUpcomingEvents();
  const merged = [...current, ...saved];
  writeUpcomingEvents(merged);
  return saved;
}

function updateEvent(id, updateData) {
  const current = readUpcomingEvents();
  const index = current.findIndex((event) => String(event.id) === String(id));

  if (index === -1) {
    return null;
  }

  const payload = { ...current[index], ...updateData, id: String(id) };
  if (updateData.date && updateData.date !== current[index].date) {
    delete payload.day;
    delete payload.month;
  }
  const updated = normalizeEvent(payload);
  current[index] = updated;
  writeUpcomingEvents(current);

  return updated;
}

function deleteEvent(id) {
  const current = readUpcomingEvents();
  const filtered = current.filter((event) => String(event.id) !== String(id));

  if (filtered.length === current.length) {
    return null;
  }

  writeUpcomingEvents(filtered);
  return { deletedId: String(id), remainingCount: filtered.length };
}

function saveUploadedImage(imageBase64, fileName = 'event-upload.png') {
  if (!imageBase64) {
    throw new Error('Image data is required');
  }

  const matches = imageBase64.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/i);
  if (!matches) {
    throw new Error('Unsupported image format');
  }

  const extension = matches[1].toLowerCase();
  const buffer = Buffer.from(matches[2], 'base64');
  const uniqueToken = Math.random().toString(36).substring(2, 8);
  const safeFileName = `${Date.now()}-${uniqueToken}-${fileName.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
  const finalName = safeFileName.includes('.') ? safeFileName : `${safeFileName}.${extension}`;

  if (!fs.existsSync(config.PATHS.UPLOADS)) {
    fs.mkdirSync(config.PATHS.UPLOADS, { recursive: true });
  }

  const outputPath = path.join(config.PATHS.UPLOADS, finalName);
  fs.writeFileSync(outputPath, buffer);

  return `/uploads/${finalName}`;
}

function saveUploadedImages(imagesList) {
  if (!Array.isArray(imagesList)) {
    throw new Error('Images array is required');
  }
  return imagesList.map((item, index) => {
    return saveUploadedImage(item.imageBase64, item.fileName || `gallery-${index + 1}.png`);
  });
}

module.exports = {
  getAllEvents,
  createEvents,
  updateEvent,
  deleteEvent,
  saveUploadedImage,
  saveUploadedImages
};
