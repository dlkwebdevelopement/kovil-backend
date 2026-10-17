const fs = require('fs');
const path = require('path');

const ANNOUNCEMENTS_FILE = path.join(__dirname, 'announcements.json');

function ensureFile() {
  if (!fs.existsSync(ANNOUNCEMENTS_FILE)) {
    const defaultData = {
      announcements: [],
      annadhanam: ""
    };
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

function readAnnouncements() {
  ensureFile();
  try {
    const raw = fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (error) {
    return { announcements: [], annadhanam: "" };
  }
}

function writeAnnouncements(data) {
  ensureFile();
  fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  readAnnouncements,
  writeAnnouncements
};
