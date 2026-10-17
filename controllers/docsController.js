/**
 * controllers/docsController.js
 * ==============================
 * API documentation metadata controller.
 */

function getApiDocs(req, res) {
  res.json({
    title: 'Temple Panchangam API — அருள்மிகு மகாகாளியம்மன் திருக்கோவில்',
    version: '1.0.0',
    description: '10-Year Tamil Panchangam REST API (2026–2036) with temple-specific events',
    authentication: {
      method: 'API Key',
      header: 'X-API-Key: <your-key>',
      query: '?api_key=<your-key>',
      generate: 'POST /api/keys/generate (requires master key)',
    },
    endpoints: [
      { method: 'GET', path: '/api/panchangam/today', description: "Today's panchangam" },
      { method: 'GET', path: '/api/panchangam/daily/:date', description: 'Single day (YYYY-MM-DD)' },
      { method: 'GET', path: '/api/panchangam/daily?from=&to=', description: 'Date range query' },
      { method: 'GET', path: '/api/panchangam/month/:year/:month', description: 'Full month data' },
      { method: 'GET', path: '/api/panchangam/events', description: 'Temple events (?from=&to=&year=&type=)' },
      { method: 'GET', path: '/api/panchangam/events/upcoming', description: 'Next 30 days events' },
      { method: 'GET', path: '/api/panchangam/events/year/:year', description: 'Events for a year' },
      { method: 'GET', path: '/api/panchangam/search', description: 'Search (?tithi=&nakshatram=&tamil_month=)' },
      { method: 'GET', path: '/api/panchangam/pournami', description: 'All Pournami dates' },
      { method: 'GET', path: '/api/panchangam/amavasai', description: 'All Amavasai dates' },
      { method: 'GET', path: '/api/panchangam/event-dates', description: 'Event date map (for calendar)' },
      { method: 'GET', path: '/api/panchangam/stats', description: 'Data summary & stats' },
      { method: 'POST', path: '/api/keys/generate', description: 'Generate new API key' },
      { method: 'GET', path: '/api/keys/list', description: 'List all API keys' },
      { method: 'POST', path: '/api/keys/revoke', description: 'Revoke an API key' },
      { method: 'GET', path: '/api/upcoming-events', description: 'List upcoming events' },
      { method: 'GET', path: '/api/announcements', description: 'Temple announcements & annadhanam info' },
      { method: 'GET', path: '/api/contact', description: 'Contact information & map location' },
      { method: 'GET', path: '/api/donation', description: 'Donation instructions & bank details' },
      { method: 'GET', path: '/api/gallery', description: 'Temple gallery images' },
      { method: 'GET', path: '/api/timings', description: 'Temple pooja and visiting hours' },
    ],
    event_types: [
      { type: 'krishna_ashtami', name: 'மகா பிரத்யங்கிரா தேவி பூஜை' },
      { type: 'amavasai', name: 'ஊஞ்சல் சாமி பூஜை' },
      { type: 'pournami', name: 'திருவிழாக்கு பூஜை' },
      { type: 'aadi_pooram', name: 'ஆடி பூரம் — கூழ் வார்த்தல்' },
      { type: 'aadi_kram', name: 'ஆடி க்ரம் விழா' },
      { type: 'navasakthi', name: 'நவசக்தி அர்ச்சனை' },
      { type: 'ther_utsavam', name: 'தேர் உற்சவம்' },
      { type: 'thiruvizha_start', name: '5-நாள் கோவில் திருவிழா' },
      { type: 'chithira_pournami', name: 'சித்திரா பௌர்ணமி — பால் குடம்' },
      { type: 'tamil_new_year', name: 'தமிழ் புத்தாண்டு' },
    ],
  });
}

module.exports = {
  getApiDocs
};
