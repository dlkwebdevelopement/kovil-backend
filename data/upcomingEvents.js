const fs = require('fs');
const path = require('path');

const EVENTS_FILE = path.join(__dirname, 'upcoming-events.json');

function ensureFile() {
  if (!fs.existsSync(EVENTS_FILE)) {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readUpcomingEvents() {
  ensureFile();
  try {
    const raw = fs.readFileSync(EVENTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeUpcomingEvents(events) {
  ensureFile();
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf-8');
}

function normalizeEvent(item) {
  const eventDate = item.date || item.event_date || '';
  const day = eventDate ? eventDate.split('-')[2] : (item.day || '');
  const month = eventDate ? new Date(`${eventDate}T00:00:00`).toLocaleString('ta-IN', { month: 'short' }) : (item.month || '');

  return {
    id: item.id || `event-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: item.title || 'சிறப்பு நிகழ்வு',
    subtitle: item.subtitle || item.note || 'கோவில் சிறப்பு பூஜை',
    time: item.time || 'காலை 8:00 மணி',
    date: eventDate,
    day,
    month,
    image: item.image || item.image_url || '/images/event-card-icon.png',
    featured: Boolean(item.featured),
  };
}

function mergeUpcomingEvents(publicEvents = []) {
  const custom = readUpcomingEvents().map(normalizeEvent);
  const all = [...custom, ...publicEvents.map(normalizeEvent)];
  const unique = new Map();

  all.forEach((event) => {
    const key = `${event.title}|${event.date}|${event.image}`;
    if (!unique.has(key)) unique.set(key, event);
  });

  return [...unique.values()].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
  });
}

module.exports = {
  readUpcomingEvents,
  writeUpcomingEvents,
  normalizeEvent,
  mergeUpcomingEvents,
};
