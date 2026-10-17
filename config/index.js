const path = require('path');
require('dotenv').config();

const ROOT_DIR = path.resolve(__dirname, '..');

module.exports = {
  PORT: process.env.PORT || 5001,
  MASTER_API_KEY: process.env.MASTER_API_KEY || 'temple-master-key-2026',
  
  PATHS: {
    ROOT: ROOT_DIR,
    UPLOADS: path.join(ROOT_DIR, 'uploads'),
    DATA: path.join(ROOT_DIR, 'data'),
    // Support both kovil-frontend and frontend directory names
    FRONTEND_DIST: path.join(ROOT_DIR, '..', 'frontend', 'dist'),
    ALT_FRONTEND_DIST: path.join(ROOT_DIR, '..', 'kovil-frontend', 'dist'),
    ADMIN_DIST: path.join(ROOT_DIR, '..', 'admin', 'dist'),
    ALT_ADMIN_DIST: path.join(ROOT_DIR, '..', 'admin-panel', 'dist')
  },

  BODY_LIMIT: process.env.BODY_LIMIT || '250mb'
};
