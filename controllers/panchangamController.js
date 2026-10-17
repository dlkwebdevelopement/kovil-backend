/**
 * controllers/panchangamController.js
 * ===================================
 * Controller for 10-year Tamil Panchangam and auto-calculated temple events.
 */

const data = require('../data/loader');

// Helper: today's date as YYYY-MM-DD (IST offset)
function todayStr() {
  const d = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(d.getTime() + offset);
  return ist.toISOString().split('T')[0];
}

// Helper: wrap response
function respond(res, result, meta = {}) {
  if (Array.isArray(result)) {
    return res.json({
      success: true,
      count: result.length,
      ...meta,
      data: result,
    });
  }
  if (result === null) {
    return res.status(404).json({
      success: false,
      error: 'No data found',
    });
  }
  return res.json({
    success: true,
    ...meta,
    data: result,
  });
}

function getToday(req, res) {
  const today = todayStr();
  const row = data.getByDate(today);
  const events = data.getTempleEvents().filter(e => e.date === today);

  if (!row) {
    return res.json({
      success: true,
      message: `${today} is outside the 2026-2036 data range`,
      today: today,
      data: null,
      events: [],
    });
  }

  respond(res, { ...row, events }, { date: today });
}

function getDailyByDate(req, res) {
  const { date } = req.params;
  const row = data.getByDate(date);
  const events = data.getTempleEvents().filter(e => e.date === date);

  if (!row) return respond(res, null);
  respond(res, { ...row, events }, { date });
}

function getDailyRange(req, res) {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({
      success: false,
      error: 'Both "from" and "to" query params required (YYYY-MM-DD)',
    });
  }
  const rows = data.getByDateRange(from, to);
  respond(res, rows, { from, to });
}

function getByMonth(req, res) {
  const { year, month } = req.params;
  const rows = data.getByMonth(year, month);
  const eventDates = data.getEventDateSet();

  const enriched = rows.map(r => ({
    ...r,
    has_event: eventDates.has(r.gregorian_date),
    events: data.getTempleEvents().filter(e => e.date === r.gregorian_date),
  }));

  respond(res, enriched, { year: parseInt(year), month: parseInt(month) });
}

function getTempleEvents(req, res) {
  const { from, to, year, type } = req.query;
  let events = data.getTempleEvents();

  if (from && to) {
    events = events.filter(e => e.date >= from && e.date <= to);
  } else if (year) {
    events = data.getEventsByYear(year);
  }
  if (type) {
    events = events.filter(e => e.event_type === type);
  }

  respond(res, events);
}

function getUpcomingEvents(req, res) {
  const days = parseInt(req.query.days) || 90;
  const today = todayStr();
  const future = new Date();
  future.setDate(future.getDate() + days);
  const futureStr = future.toISOString().split('T')[0];

  const events = data.getEventsByDateRange(today, futureStr);
  respond(res, events, { from: today, to: futureStr });
}

function getEventsByYear(req, res) {
  const events = data.getEventsByYear(req.params.year);
  respond(res, events, { year: parseInt(req.params.year) });
}

function searchPanchangam(req, res) {
  const { tithi, nakshatram, tamil_month, rasi, yogam, paksha } = req.query;

  if (!tithi && !nakshatram && !tamil_month && !rasi && !yogam && !paksha) {
    return res.status(400).json({
      success: false,
      error: 'At least one search parameter required',
      params: ['tithi', 'nakshatram', 'tamil_month', 'rasi', 'yogam', 'paksha'],
    });
  }

  const results = data.searchPanchangam({ tithi, nakshatram, tamil_month, rasi, yogam, paksha });
  respond(res, results, { filters: { tithi, nakshatram, tamil_month, rasi, yogam, paksha } });
}

function getPournami(req, res) {
  let events = data.getEventsByType('pournami');
  if (req.query.year) {
    events = events.filter(e => e.date.startsWith(req.query.year));
  }
  respond(res, events);
}

function getAmavasai(req, res) {
  let events = data.getEventsByType('amavasai');
  if (req.query.year) {
    events = events.filter(e => e.date.startsWith(req.query.year));
  }
  respond(res, events);
}

function getEventDates(req, res) {
  const events = data.getTempleEvents();
  const dateMap = {};

  events.forEach(e => {
    if (!dateMap[e.date]) {
      dateMap[e.date] = [];
    }
    dateMap[e.date].push({
      type: e.event_type,
      name: e.event_name,
      name_en: e.event_name_en,
    });
  });

  res.json({
    success: true,
    total_event_dates: Object.keys(dateMap).length,
    total_events: events.length,
    event_dates: dateMap,
  });
}

function getStats(req, res) {
  respond(res, data.getStats());
}

function createTempleEvent(req, res) {
  try {
    const eventData = req.body || {};
    if (!eventData.date || !eventData.event_name) {
      return res.status(400).json({
        success: false,
        error: 'தேதி (Date) மற்றும் நிகழ்வு பெயர் (Event Name) இரண்டும் கட்டாயம்',
      });
    }
    const newEvent = data.addTempleEvent(eventData);
    res.status(201).json({
      success: true,
      data: newEvent,
      message: 'கோவில் நிகழ்வு வெற்றிகரமாக சேர்க்கப்பட்டது',
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

function updateTempleEvent(req, res) {
  try {
    const { id } = req.params;
    const updated = data.updateTempleEvent(id, req.body || {});
    res.json({
      success: true,
      data: updated,
      message: 'கோவில் நிகழ்வு வெற்றிகரமாக புதுப்பிக்கப்பட்டது',
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

function deleteTempleEvent(req, res) {
  try {
    const { id } = req.params;
    const deletedId = data.deleteTempleEvent(id);
    res.json({
      success: true,
      deletedId,
      message: 'கோவில் நிகழ்வு வெற்றிகரமாக நீக்கப்பட்டது',
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

module.exports = {
  getToday,
  getDailyByDate,
  getDailyRange,
  getByMonth,
  getTempleEvents,
  getUpcomingEvents,
  getEventsByYear,
  searchPanchangam,
  getPournami,
  getAmavasai,
  getEventDates,
  getStats,
  createTempleEvent,
  updateTempleEvent,
  deleteTempleEvent,
};
