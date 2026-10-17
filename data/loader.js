/**
 * data/loader.js
 * ==============
 * Loads the 10-year panchangam CSV into memory and derives temple events.
 * 
 * Data: 2026-01-01 to 2036-12-31 (4,019 days)
 * Temple: அருள்மிகு மகாகாளியம்மன் திருக்கோவில் (பொன்னிர், சென்னை)
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const templeEventsHelper = require('./templeEventsHelper');

// ─── CSV Column Mapping ───
const CSV_COLUMNS = [
  'gregorian_date', 'weekday', 'tamil_year', 'tamil_month', 'tamil_date',
  'rasi', 'paksha', 'tithi', 'tithi_number', 'nakshatram', 'padam',
  'yogam', 'karanam', 'sunrise', 'sunset', 'rahu_kalam',
  'yamagandam', 'kuligai', 'nalla_neram'
];

const TAMIL_COLUMNS = [
  'கிரிகோரியன்_தேதி', 'கிழமை', 'தமிழ்_ஆண்டு', 'தமிழ்_மாதம்', 'தமிழ்_தேதி',
  'ராசி', 'பக்ஷம்', 'திதி', 'திதி_எண்', 'நட்சத்திரம்', 'பாதம்',
  'யோகம்', 'கரணம்', 'சூரிய_உதயம்', 'சூரிய_அஸ்தமனம்', 'ராகு_காலம்',
  'எமகண்டம்', 'குளிகை', 'நல்ல_நேரம்'
];

let dailyData = [];
let templeEvents = [];
let eventDateSet = new Set();

/**
 * Load CSV and build data structures
 */
function loadData() {
  const csvPath = path.join(__dirname, 'daily_panchangam_ta_2026_2036.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found:', csvPath);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });

  // Map Tamil column names to English keys for easier API use
  dailyData = records.map(row => {
    const mapped = {};
    TAMIL_COLUMNS.forEach((tamilKey, i) => {
      mapped[CSV_COLUMNS[i]] = row[tamilKey] || '';
      mapped[tamilKey] = row[tamilKey] || ''; // Keep Tamil keys too
    });
    return mapped;
  });

  // Generate and initialize temple events with persistence
  const generated = generateTempleEvents(dailyData);
  templeEvents = templeEventsHelper.initTempleEvents(generated);
  
  // Build event date lookup set
  eventDateSet = new Set(templeEvents.map(e => e.date));

  console.log(`✅ Loaded ${dailyData.length} days of panchangam data`);
  console.log(`✅ Initialized ${templeEvents.length} temple events`);
  console.log(`📅 Date range: ${dailyData[0]?.gregorian_date} to ${dailyData[dailyData.length - 1]?.gregorian_date}`);
}

/**
 * Generate all temple events from daily panchangam data
 * Matches the Python logic in temple_panchangam_api.py
 */
function generateTempleEvents(rows) {
  const events = [];

  // 1. தேய்பிறை அஷ்டமி → மகா பிரத்யங்கிரா தேவி பூஜை
  rows.forEach(r => {
    if (r['பக்ஷம்'] === 'கிருஷ்ண பக்ஷம்' && r['திதி'] === 'அஷ்டமி') {
      events.push({
        date: r.gregorian_date,
        weekday: r['கிழமை'],
        weekday_en: r.weekday,
        event_name: 'மகா பிரத்யங்கிரா தேவி பூஜை',
        event_name_en: 'Maha Pratyangira Devi Puja',
        event_type: 'krishna_ashtami',
        note: 'தேய்பிறை அஷ்டமி (Krishna Paksha Ashtami)',
        tamil_month: r['தமிழ்_மாதம்'],
        tamil_year: r['தமிழ்_ஆண்டு'],
      });
    }
  });

  // 2. அமாவாசை → ஊஞ்சல் சாமி பூஜை
  rows.forEach(r => {
    if (r['திதி'] === 'அமாவாசை') {
      events.push({
        date: r.gregorian_date,
        weekday: r['கிழமை'],
        weekday_en: r.weekday,
        event_name: 'ஊஞ்சல் சாமி பூஜை',
        event_name_en: 'Oonchal Sami Puja (Amavasai)',
        event_type: 'amavasai',
        note: 'அமாவாசை',
        tamil_month: r['தமிழ்_மாதம்'],
        tamil_year: r['தமிழ்_ஆண்டு'],
      });
    }
  });

  // 3. பௌர்ணமி → திருவிழாக்கு பூஜை
  rows.forEach(r => {
    if (r['திதி'] === 'பௌர்ணமி') {
      events.push({
        date: r.gregorian_date,
        weekday: r['கிழமை'],
        weekday_en: r.weekday,
        event_name: 'திருவிழாக்கு பூஜை',
        event_name_en: 'Thiruvilakku Puja (Pournami)',
        event_type: 'pournami',
        note: 'பௌர்ணமி',
        tamil_month: r['தமிழ்_மாதம்'],
        tamil_year: r['தமிழ்_ஆண்டு'],
      });
    }
  });

  // 4. ஆடி பூரம் → கூழ் வார்த்தல்
  rows.forEach(r => {
    if (r['தமிழ்_மாதம்'] === 'ஆடி' && r['நட்சத்திரம்'] === 'பூரம்') {
      events.push({
        date: r.gregorian_date,
        weekday: r['கிழமை'],
        weekday_en: r.weekday,
        event_name: 'ஆடி பூரம் — கூழ் வார்த்தல்',
        event_name_en: 'Aadi Pooram — Koozh Vaarthal',
        event_type: 'aadi_pooram',
        note: 'ஆடி மாதம் + பூரம் நட்சத்திரம்',
        tamil_month: r['தமிழ்_மாதம்'],
        tamil_year: r['தமிழ்_ஆண்டு'],
      });
    }
  });

  // 5. ஆடி க்ரம் (~ஆடி கிருத்திகை)
  rows.forEach(r => {
    if (r['தமிழ்_மாதம்'] === 'ஆடி' && r['நட்சத்திரம்'] === 'கார்த்திகை') {
      events.push({
        date: r.gregorian_date,
        weekday: r['கிழமை'],
        weekday_en: r.weekday,
        event_name: 'ஆடி க்ரம் விழா',
        event_name_en: 'Aadi Kram Festival (Aadi Karthigai)',
        event_type: 'aadi_kram',
        note: 'ஆடி கார்த்திகை என அனுமானம்',
        tamil_month: r['தமிழ்_மாதம்'],
        tamil_year: r['தமிழ்_ஆண்டு'],
      });
    }
  });

  // 6. ஒவ்வொரு தமிழ் மாத கடைசி வெள்ளிக்கிழமை → நவசக்தி அர்ச்சனை
  const lastFridayByMonth = {};
  rows.forEach(r => {
    if (r['கிழமை'] === 'வெள்ளி') {
      const key = `${r['தமிழ்_ஆண்டு']}|${r['தமிழ்_மாதம்']}`;
      lastFridayByMonth[key] = r; // last one found wins
    }
  });

  Object.entries(lastFridayByMonth)
    .sort((a, b) => a[1].gregorian_date.localeCompare(b[1].gregorian_date))
    .forEach(([key, r]) => {
      const [year, month] = key.split('|');
      events.push({
        date: r.gregorian_date,
        weekday: r['கிழமை'],
        weekday_en: r.weekday,
        event_name: `நவசக்தி அர்ச்சனை — ${month} மாத கடைசி வெள்ளி`,
        event_name_en: `Navasakthi Archanai — Last Friday of ${month}`,
        event_type: 'navasakthi',
        note: `${year} வருஷம் ${month} மாத கடைசி வெள்ளிக்கிழமை`,
        tamil_month: month,
        tamil_year: year,
      });
    });

  // 7. புரட்டாசி மாத கடைசி வெள்ளி → தேர் உற்சவம் + 5-நாள் திருவிழா
  Object.entries(lastFridayByMonth)
    .filter(([key]) => key.includes('புரட்டாசி'))
    .sort((a, b) => a[1].gregorian_date.localeCompare(b[1].gregorian_date))
    .forEach(([key, r]) => {
      const [year] = key.split('|');
      const therDate = new Date(r.gregorian_date);

      events.push({
        date: r.gregorian_date,
        weekday: r['கிழமை'],
        weekday_en: r.weekday,
        event_name: 'தேர் உற்சவம் — நவசக்தி நிறைவு நாள்',
        event_name_en: 'Ther Utsavam — Navasakthi Conclusion',
        event_type: 'ther_utsavam',
        note: `${year} வருஷம் புரட்டாசி தேர்`,
        tamil_month: 'புரட்டாசி',
        tamil_year: year,
      });

      // 5-day festival (4 days before + ther day)
      const startDate = new Date(therDate);
      startDate.setDate(startDate.getDate() - 4);
      const startStr = startDate.toISOString().split('T')[0];

      events.push({
        date: startStr,
        weekday: '',
        weekday_en: '',
        event_name: '5-நாள் கோவில் திருவிழா (தொடக்கம்)',
        event_name_en: '5-Day Temple Festival Start',
        event_type: 'thiruvizha_start',
        note: `${startStr} முதல் ${r.gregorian_date} வரை — ஏழு ஊர் எல்லை`,
        tamil_month: 'புரட்டாசி',
        tamil_year: year,
        end_date: r.gregorian_date,
      });
    });

  // 8. சித்திரா பௌர்ணமி → பால் குடம் அபிஷேகம்
  rows.forEach(r => {
    if (r['தமிழ்_மாதம்'] === 'சித்திரை' && r['திதி'] === 'பௌர்ணமி') {
      events.push({
        date: r.gregorian_date,
        weekday: r['கிழமை'],
        weekday_en: r.weekday,
        event_name: 'சித்திரா பௌர்ணமி — பால் குடம் அபிஷேகம்',
        event_name_en: 'Chithira Pournami — Paal Kudam Abhishekam',
        event_type: 'chithira_pournami',
        note: 'சித்திரை மாதம் பௌர்ணமி',
        tamil_month: 'சித்திரை',
        tamil_year: r['தமிழ்_ஆண்டு'],
      });
    }
  });

  // 9. தமிழ் புத்தாண்டு (சித்திரை 1)
  rows.forEach(r => {
    if (r['தமிழ்_மாதம்'] === 'சித்திரை' && String(r['தமிழ்_தேதி']) === '1') {
      events.push({
        date: r.gregorian_date,
        weekday: r['கிழமை'],
        weekday_en: r.weekday,
        event_name: 'தமிழ் புத்தாண்டு',
        event_name_en: 'Tamil New Year (Puthandu)',
        event_type: 'tamil_new_year',
        note: `${r['தமிழ்_ஆண்டு']} வருஷ புத்தாண்டு`,
        tamil_month: 'சித்திரை',
        tamil_year: r['தமிழ்_ஆண்டு'],
      });
    }
  });

  // Sort all events by date
  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}

/**
 * Query helpers
 */
function getDailyData() { return dailyData; }
function getTempleEvents() { return templeEvents; }
function getEventDateSet() { return eventDateSet; }

function getByDate(dateStr) {
  return dailyData.find(r => r.gregorian_date === dateStr) || null;
}

function getByDateRange(from, to) {
  return dailyData.filter(r => r.gregorian_date >= from && r.gregorian_date <= to);
}

function getByMonth(year, month) {
  const mm = String(month).padStart(2, '0');
  const prefix = `${year}-${mm}`;
  return dailyData.filter(r => r.gregorian_date.startsWith(prefix));
}

function getEventsByDateRange(from, to) {
  return templeEvents.filter(e => e.date >= from && e.date <= to);
}

function getEventsByType(type) {
  return templeEvents.filter(e => e.event_type === type);
}

function getEventsByYear(year) {
  const from = `${year}-01-01`;
  const to = `${year}-12-31`;
  return templeEvents.filter(e => e.date >= from && e.date <= to);
}

function searchPanchangam({ tithi, nakshatram, tamil_month, rasi, yogam, paksha }) {
  return dailyData.filter(r => {
    if (tithi && r['திதி'] !== tithi) return false;
    if (nakshatram && r['நட்சத்திரம்'] !== nakshatram) return false;
    if (tamil_month && r['தமிழ்_மாதம்'] !== tamil_month) return false;
    if (rasi && r['ராசி'] !== rasi) return false;
    if (yogam && r['யோகம்'] !== yogam) return false;
    if (paksha && r['பக்ஷம்'] !== paksha) return false;
    return true;
  });
}

function getStats() {
  const years = new Set(dailyData.map(r => r.gregorian_date.substring(0, 4)));
  const eventTypeCounts = {};
  templeEvents.forEach(e => {
    eventTypeCounts[e.event_type] = (eventTypeCounts[e.event_type] || 0) + 1;
  });

  return {
    total_days: dailyData.length,
    total_events: templeEvents.length,
    year_range: { from: Math.min(...years), to: Math.max(...years) },
    years: [...years].sort(),
    event_type_counts: eventTypeCounts,
    tamil_months: [...new Set(dailyData.map(r => r['தமிழ்_மாதம்']))],
    nakshatrams: [...new Set(dailyData.map(r => r['நட்சத்திரம்']))],
    tithis: [...new Set(dailyData.map(r => r['திதி']))],
  };
}

function addTempleEvent(eventData) {
  const result = templeEventsHelper.addEvent(templeEvents, eventData, dailyData);
  templeEvents = result.allEvents;
  eventDateSet = new Set(templeEvents.map(e => e.date));
  return result.newEvent;
}

function updateTempleEvent(id, updateData) {
  const result = templeEventsHelper.updateEvent(templeEvents, id, updateData, dailyData);
  templeEvents = result.allEvents;
  eventDateSet = new Set(templeEvents.map(e => e.date));
  return result.updatedEvent;
}

function deleteTempleEvent(id) {
  const result = templeEventsHelper.deleteEvent(templeEvents, id);
  templeEvents = result.allEvents;
  eventDateSet = new Set(templeEvents.map(e => e.date));
  return result.deletedId;
}

module.exports = {
  loadData,
  getDailyData,
  getTempleEvents,
  getEventDateSet,
  getByDate,
  getByDateRange,
  getByMonth,
  getEventsByDateRange,
  getEventsByType,
  getEventsByYear,
  searchPanchangam,
  getStats,
  addTempleEvent,
  updateTempleEvent,
  deleteTempleEvent,
};
