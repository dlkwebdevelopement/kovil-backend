/**
 * controllers/contactController.js
 * =================================
 * Handlers for contact info & map embed URL.
 */

const contactService = require('../services/contactService');

function getContact(req, res, next) {
  try {
    const data = contactService.getContact();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

function updateContact(req, res, next) {
  try {
    const payload = req.body;
    contactService.updateContact(payload);
    res.json({ success: true, data: payload });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getContact,
  updateContact
};
