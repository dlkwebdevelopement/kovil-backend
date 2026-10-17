/**
 * data/templeEventsHelper.js
 * ==========================
 * Persistent storage and management for temple events (கோவில் நிகழ்வுகள்).
 * Saves custom additions, modifications, and deletions to templeEvents.json.
 */

const fs = require('fs');
const path = require('path');

const TEMPLE_EVENTS_FILE = path.join(__dirname, 'templeEvents.json');

/**
 * Assign deterministic or unique ID to an event object
 */
function ensureEventId(event, index = 0) {
  if (event.id) return event.id;
  const safeType = (event.event_type || 'event').replace(/[^a-zA-Z0-9_]/g, '_');
  return `evt_${event.date}_${safeType}_${index}`;
}

/**
 * Read saved temple events from JSON file, or initialize with baseline generated events
 */
function initTempleEvents(baselineEvents = []) {
  try {
    if (fs.existsSync(TEMPLE_EVENTS_FILE)) {
      const content = fs.readFileSync(TEMPLE_EVENTS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all events have an id
        return parsed.map((e, idx) => ({ ...e, id: ensureEventId(e, idx) }));
      }
    }
  } catch (error) {
    console.warn('⚠️ Error reading templeEvents.json, initializing from baseline:', error.message);
  }

  // Baseline initialization
  const initialized = baselineEvents.map((e, idx) => ({
    ...e,
    id: ensureEventId(e, idx)
  }));

  saveTempleEvents(initialized);
  return initialized;
}

/**
 * Write temple events array to disk
 */
function saveTempleEvents(events) {
  try {
    fs.writeFileSync(TEMPLE_EVENTS_FILE, JSON.stringify(events, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('❌ Failed to save templeEvents.json:', error.message);
    return false;
  }
}

/**
 * Find matching panchangam row for date to auto-enrich Tamil calendar details
 */
function enrichFromPanchangam(eventDate, dailyData = []) {
  const match = dailyData.find(r => r.gregorian_date === eventDate);
  if (!match) return {};
  return {
    weekday: match['கிழமை'] || '',
    weekday_en: match.weekday || '',
    tamil_month: match['தமிழ்_மாதம்'] || '',
    tamil_year: match['தமிழ்_ஆண்டு'] || '',
  };
}

/**
 * Add a new temple event
 */
function addEvent(allEvents, eventData, dailyData = []) {
  if (!eventData.date || !eventData.event_name) {
    throw new Error('Date (தேதி) and Event Name (நிகழ்வு பெயர்) are required');
  }

  const enriched = enrichFromPanchangam(eventData.date, dailyData);
  const newEvent = {
    id: eventData.id || `evt_${eventData.date}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    date: eventData.date,
    event_name: eventData.event_name.trim(),
    event_name_en: eventData.event_name_en || '',
    event_type: eventData.event_type || 'special_puja',
    note: eventData.note || '',
    weekday: eventData.weekday || enriched.weekday || '',
    weekday_en: eventData.weekday_en || enriched.weekday_en || '',
    tamil_month: eventData.tamil_month || enriched.tamil_month || '',
    tamil_year: eventData.tamil_year || enriched.tamil_year || '',
  };

  const updated = [newEvent, ...allEvents];
  updated.sort((a, b) => a.date.localeCompare(b.date));
  saveTempleEvents(updated);

  return { newEvent, allEvents: updated };
}

/**
 * Update an existing temple event
 */
function updateEvent(allEvents, id, updateData, dailyData = []) {
  const index = allEvents.findIndex(e => String(e.id) === String(id));
  if (index === -1) {
    throw new Error(`Event with ID "${id}" not found`);
  }

  const current = allEvents[index];
  const newDate = updateData.date || current.date;
  const enriched = newDate !== current.date ? enrichFromPanchangam(newDate, dailyData) : {};

  const updatedEvent = {
    ...current,
    ...updateData,
    id: current.id,
    date: newDate,
    event_name: (updateData.event_name || current.event_name).trim(),
    event_type: updateData.event_type || current.event_type,
    note: updateData.note !== undefined ? updateData.note : current.note,
    weekday: updateData.weekday || enriched.weekday || current.weekday,
    weekday_en: updateData.weekday_en || enriched.weekday_en || current.weekday_en,
    tamil_month: updateData.tamil_month || enriched.tamil_month || current.tamil_month,
    tamil_year: updateData.tamil_year || enriched.tamil_year || current.tamil_year,
  };

  const updated = [...allEvents];
  updated[index] = updatedEvent;
  updated.sort((a, b) => a.date.localeCompare(b.date));
  saveTempleEvents(updated);

  return { updatedEvent, allEvents: updated };
}

/**
 * Delete a temple event
 */
function deleteEvent(allEvents, id) {
  const target = allEvents.find(e => String(e.id) === String(id));
  if (!target) {
    throw new Error(`Event with ID "${id}" not found`);
  }

  const updated = allEvents.filter(e => String(e.id) !== String(id));
  saveTempleEvents(updated);

  return { deletedId: id, allEvents: updated };
}

module.exports = {
  initTempleEvents,
  saveTempleEvents,
  addEvent,
  updateEvent,
  deleteEvent
};
