const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'gallery.json');

const readGallery = () => {
  if (!fs.existsSync(FILE_PATH)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading gallery:', error);
    return [];
  }
};

const writeGallery = (data) => {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing gallery:', error);
  }
};

module.exports = {
  readGallery,
  writeGallery
};
