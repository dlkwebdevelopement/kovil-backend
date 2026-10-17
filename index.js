/**
 * index.js — Temple Panchangam REST API Server
 * ==============================================
 * 
 * அருள்மிகு மகாகாளியம்மன் திருக்கோவில் (பொன்னிர், சென்னை)
 * 10-Year Panchangam REST API (2026–2036)
 * 
 * Entry point: Boots data loaders and starts Express HTTP server.
 * Start: npm start
 * Docs:  http://localhost:5001/api/docs
 */

require('dotenv').config();

const app = require('./app');
const config = require('./config');
const dataLoader = require('./data/loader');

console.log('\n🛕  அருள்மிகு மகாகாளியம்மன் திருக்கோவில் — Panchangam API');
console.log('═══════════════════════════════════════════════════════\n');

// ─── Load panchangam & temple dataset ───
dataLoader.loadData();

// ─── Start HTTP Server ───
const server = app.listen(config.PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${config.PORT}`);
  console.log(`📖 API Docs:  http://localhost:${config.PORT}/api/docs`);
  console.log(`🌐 Frontend:  http://localhost:${config.PORT}`);
  console.log(`🔑 Master Key: ${config.MASTER_API_KEY}\n`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`\nℹ️  Panchangam API is already running at http://localhost:${config.PORT}`);
    process.exit(0);
    return;
  }

  console.error('Unable to start the Panchangam API:', error.message);
  process.exitCode = 1;
});

module.exports = server;
