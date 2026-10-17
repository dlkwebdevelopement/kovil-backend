/**
 * services/contactService.js
 * ==========================
 * Data operations for contact details & map URL.
 */

const { readContact, writeContact } = require('../data/contactHelper');

function getContact() {
  return readContact();
}

function updateContact(payload) {
  writeContact(payload);
  return payload;
}

module.exports = {
  getContact,
  updateContact
};
