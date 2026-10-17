/**
 * app.js
 * ======
 * Express application configuration and middleware orchestration.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const config = require('./config');
const { apiKeyAuth } = require('./middleware/apiKey');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const app = express();

// ─── Core Middleware ───
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key', 'Authorization'],
}));
app.options('*', cors());

app.use(express.json({ limit: config.BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: config.BODY_LIMIT }));

// ─── Static Uploads ───
if (!fs.existsSync(config.PATHS.UPLOADS)) {
  fs.mkdirSync(config.PATHS.UPLOADS, { recursive: true });
}
app.use('/uploads', express.static(config.PATHS.UPLOADS));

// ─── Resolve Frontend and Admin Dist Paths ───
const frontendDist = fs.existsSync(config.PATHS.FRONTEND_DIST)
  ? config.PATHS.FRONTEND_DIST
  : config.PATHS.ALT_FRONTEND_DIST;

const adminDist = fs.existsSync(config.PATHS.ADMIN_DIST)
  ? config.PATHS.ADMIN_DIST
  : config.PATHS.ALT_ADMIN_DIST;

// ─── Serve Admin Panel Static Assets ───
if (fs.existsSync(adminDist)) {
  app.use('/admin', express.static(adminDist));
}

// ─── Serve Frontend Client Static Assets ───
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

// ─── API Routes (Mounted under /api) ───
app.use('/api', apiKeyAuth, apiRoutes);

// ─── Admin SPA Fallback ───
if (fs.existsSync(adminDist)) {
  const adminIndex = path.join(adminDist, 'index.html');
  app.get('/admin', (req, res) => res.sendFile(adminIndex));
  app.get('/admin/*', (req, res) => res.sendFile(adminIndex));
}

// ─── Frontend SPA Fallback ───
if (fs.existsSync(frontendDist)) {
  const appIndex = path.join(frontendDist, 'index.html');
  app.get('/', (req, res) => res.sendFile(appIndex));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/admin')) {
      return next();
    }
    return res.sendFile(appIndex);
  });
}

// ─── 404 & Centralized Error Handling ───
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
