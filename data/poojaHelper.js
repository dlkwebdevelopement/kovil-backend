/**
 * data/poojaHelper.js
 * ====================
 * Persistent helper for temple poojas / special festivals.
 */

const fs = require('fs');
const path = require('path');

const POOJA_FILE = path.join(__dirname, 'pooja.json');

const DEFAULT_POOJAS = [
  {
    id: 'pooja-1',
    title: 'மகா பிரத்யங்கிரா தேவி பூஜை',
    subtitle: 'கிருஷ்ணாஷ்டமி',
    image: '/images/Pooja-icons/file_00000000d3a08211a3efbcfdcb87b1ab.png',
    description: 'கிருஷ்ணாஷ்டமி நன்னாளில் நடைபெறும் விசேஷ மகா பிரத்யங்கிரா தேவி பூஜை.'
  },
  {
    id: 'pooja-2',
    title: 'ஊஞ்சல் சாமி பூஜை',
    subtitle: 'அமாவாசை',
    image: '/images/Pooja-icons/file_0000000010b081f4a87b6a97e32cd93e.png',
    description: 'அமாவாசை தோறும் நடைபெறும் சிறப்பு ஊஞ்சல் சாமி பூஜை.'
  },
  {
    id: 'pooja-3',
    title: 'திருவிளக்கு பூஜை',
    subtitle: 'பௌர்ணமி',
    image: '/images/Pooja-icons/file_00000000982482118cad7730b0d94e64.png',
    description: 'பௌர்ணமி தோறும் நடைபெறும் சிறப்பு திருவிளக்கு பூஜை.'
  },
  {
    id: 'pooja-4',
    title: 'ஆடி பூரம்',
    subtitle: 'கூழ் வார்த்தல்',
    image: '/images/Pooja-icons/file_00000000971482088067e1bccf06389f.png',
    description: 'ஆடி மாதத்தில் நடைபெறும் விசேஷ கூழ் வார்த்தல் மற்றும் அம்மன் தரிசனம்.'
  },
  {
    id: 'pooja-5',
    title: 'ஆடி கரகம் விழா',
    subtitle: 'சிறப்பு விழா',
    image: '/images/Pooja-icons/file_0000000000708207b8d963915833b01b.png',
    description: 'ஆடி மாதத்தில் மிகவும் விமர்சையாக நடைபெறும் கரகம் மற்றும் சிறப்பு விழா.'
  },
  {
    id: 'pooja-6',
    title: 'நவசக்தி அர்ச்சனை',
    subtitle: 'சிறப்பு அர்ச்சனை',
    image: '/images/Pooja-icons/file_000000008a4c8208984a0a6b3302fd9b.png',
    description: 'அம்மனின் ஒன்பது ரூபங்களை வழிபடும் சிறப்பு நவசக்தி அர்ச்சனை.'
  },
  {
    id: 'pooja-7',
    title: 'தேர் உற்சவம்',
    subtitle: 'திருவிழா',
    image: '/images/Pooja-icons/file_0000000001048208866a794118137fbc.png',
    description: 'அம்மன் வீதி உலா வரும் சிறப்பு தேர் உற்சவம் மற்றும் கோலாகல விழா.'
  },
  {
    id: 'pooja-8',
    title: '5-நாள் கோவில் திருவிழா',
    subtitle: 'வருடாந்திர விழா',
    image: '/images/Pooja-icons/file_00000000b1f08208b28d20310423eb0c.png',
    description: 'ஆண்டுதோறும் விமரிசையாக நடைபெறும் 5-நாள் பெருவிழா.'
  },
  {
    id: 'pooja-9',
    title: 'சித்திரா பௌர்ணமி',
    subtitle: 'பால் குடம்',
    image: '/images/Pooja-icons/file_00000000dad08211bf40b5cd5aa81bc8.png',
    description: 'சித்திரா பௌர்ணமி அன்று நடைபெறும் சிறப்பு பால்குட ஊர்வலம்.'
  },
  {
    id: 'pooja-10',
    title: 'தமிழ் புத்தாண்டு',
    subtitle: 'சித்திரை 1',
    image: '/images/Pooja-icons/file_00000000ad208208904ac49188316895.png',
    description: 'தமிழ் வருடப்பிறப்பு சிறப்பு தரிசனம் மற்றும் விசேஷ பூஜைகள்.'
  }
];

function readPoojas() {
  try {
    if (!fs.existsSync(POOJA_FILE)) {
      writePoojas(DEFAULT_POOJAS);
      return DEFAULT_POOJAS;
    }
    const raw = fs.readFileSync(POOJA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    writePoojas(DEFAULT_POOJAS);
    return DEFAULT_POOJAS;
  } catch (error) {
    console.error('Error reading pooja.json:', error);
    return DEFAULT_POOJAS;
  }
}

function writePoojas(data) {
  try {
    fs.writeFileSync(POOJA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing pooja.json:', error);
    return false;
  }
}

function addPooja(poojaData) {
  const list = readPoojas();
  const newPooja = {
    id: poojaData.id || `pooja-${Date.now()}`,
    title: (poojaData.title || '').trim(),
    subtitle: (poojaData.subtitle || '').trim(),
    image: poojaData.image || '/images/Pooja-icons/file_00000000d3a08211a3efbcfdcb87b1ab.png',
    description: (poojaData.description || '').trim(),
    createdAt: new Date().toISOString()
  };

  list.push(newPooja);
  writePoojas(list);
  return newPooja;
}

function updatePooja(id, poojaData) {
  const list = readPoojas();
  const index = list.findIndex(p => String(p.id) === String(id));
  if (index === -1) {
    return null;
  }

  list[index] = {
    ...list[index],
    title: poojaData.title !== undefined ? poojaData.title.trim() : list[index].title,
    subtitle: poojaData.subtitle !== undefined ? poojaData.subtitle.trim() : list[index].subtitle,
    image: poojaData.image !== undefined ? poojaData.image : list[index].image,
    description: poojaData.description !== undefined ? poojaData.description.trim() : list[index].description,
    updatedAt: new Date().toISOString()
  };

  writePoojas(list);
  return list[index];
}

function deletePooja(id) {
  const list = readPoojas();
  const filtered = list.filter(p => String(p.id) !== String(id));
  if (filtered.length === list.length) {
    return false;
  }
  writePoojas(filtered);
  return true;
}

module.exports = {
  readPoojas,
  writePoojas,
  addPooja,
  updatePooja,
  deletePooja,
  DEFAULT_POOJAS
};
