const fs = require('fs');
const path = require('path');

const TIMINGS_FILE = path.join(__dirname, 'timings.json');

const DEFAULT_TIMINGS = {
  openTime: "காலை 5:30 மணி",
  morningPooja: "காலை 8:00 மணி",
  noonPooja: "பகல் 12:00 மணி",
  nightPooja: "இரவு 8:30 மணி"
};

function readTimings() {
  try {
    if (!fs.existsSync(TIMINGS_FILE)) {
      writeTimings(DEFAULT_TIMINGS);
      return DEFAULT_TIMINGS;
    }
    const data = fs.readFileSync(TIMINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading timings.json:', error);
    return DEFAULT_TIMINGS;
  }
}

function writeTimings(data) {
  try {
    fs.writeFileSync(TIMINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing timings.json:', error);
    return false;
  }
}

module.exports = {
  readTimings,
  writeTimings,
  DEFAULT_TIMINGS
};
