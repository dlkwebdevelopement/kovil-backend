/**
 * services/poojaService.js
 * =========================
 * Service layer for temple poojas & rituals management.
 */

const fs = require('fs');
const path = require('path');
const {
  readPoojas,
  addPooja,
  updatePooja,
  deletePooja
} = require('../data/poojaHelper');

function getPoojas() {
  return readPoojas();
}

function getPoojaIcons() {
  try {
    const iconsDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'images', 'Pooja-icons');
    if (fs.existsSync(iconsDir)) {
      const files = fs.readdirSync(iconsDir);
      return files
        .filter(f => /\.(png|jpe?g|webp|svg)$/i.test(f))
        .map(f => `/images/Pooja-icons/${f}`);
    }
  } catch (err) {
    console.warn('Could not read Pooja-icons directory:', err.message);
  }
  return [];
}

function createPooja(data) {
  if (!data || !data.title) {
    throw new Error('பூஜையின் தலைப்பு தேவை (Title is required)');
  }
  return addPooja(data);
}

function modifyPooja(id, data) {
  if (!id) {
    throw new Error('Pooja ID is required');
  }
  const updated = updatePooja(id, data);
  if (!updated) {
    throw new Error('பூஜை விவரம் கிடைக்கவில்லை (Pooja not found)');
  }
  return updated;
}

function removePooja(id) {
  if (!id) {
    throw new Error('Pooja ID is required');
  }
  const removed = deletePooja(id);
  if (!removed) {
    throw new Error('பூஜை நீக்க முடியவில்லை (Failed to delete pooja)');
  }
  return true;
}

module.exports = {
  getPoojas,
  getPoojaIcons,
  createPooja,
  modifyPooja,
  removePooja
};
