/**
 * routes/docsRoutes.js
 * ====================
 * Route definitions for API documentation.
 */

const express = require('express');
const router = express.Router();
const docsController = require('../controllers/docsController');

router.get('/', docsController.getApiDocs);

module.exports = router;
