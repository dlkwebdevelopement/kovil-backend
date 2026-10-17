const fs = require('fs');
const path = require('path');

const CONTACT_FILE = path.join(__dirname, 'contact.json');

function ensureFile() {
  if (!fs.existsSync(CONTACT_FILE)) {
    const defaultData = {
      phones: '98406 56936, 99419 52018, 98842 55943, 99403 91565, 73052 46999',
      email: 'arulmigumahakaliammanthirukoil@gmail.com',
      address: 'அருள்மிகு மகா காளியம்மன் திருக்கோவில்,\nபோரூர், சென்னை - 116',
      subtitle: 'வருகை தரும் முன் கோவில் நேரத்தை உறுதி செய்ய தொடர்பு கொள்ளுங்கள்.',
      mapUrl: 'https://maps.google.com/maps?q=13.035389,80.158306+(Arulmigu%20Maha%20Kaliamman%20Thirukoil)&t=&z=16&ie=UTF8&iwloc=B&output=embed',
      facebook: '',
      instagram: '',
      youtube: '',
      whatsapp: ''
    };
    fs.writeFileSync(CONTACT_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

function readContact() {
  ensureFile();
  try {
    const raw = fs.readFileSync(CONTACT_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (error) {
    return {};
  }
}

function writeContact(data) {
  ensureFile();
  fs.writeFileSync(CONTACT_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  readContact,
  writeContact
};
