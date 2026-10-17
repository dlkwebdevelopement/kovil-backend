/**
 * middleware/errorHandler.js
 * ==========================
 * Centralized error handler and 404 handler.
 */

function notFoundHandler(req, res, next) {
  // If it's an API route and wasn't handled, return 404 JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.path}`
    });
  }
  next();
}

function errorHandler(err, req, res, next) {
  console.error('[Error]', err);

  const statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (statusCode === 413 || err.type === 'entity.too.large') {
    message = 'கோப்பின் அளவு அனுமதிக்கப்பட்ட வரம்பை விட அதிகமாக உள்ளது (File payload is too large. Please select a smaller file).';
  }

  res.status(statusCode).json({
    success: false,
    error: message
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
