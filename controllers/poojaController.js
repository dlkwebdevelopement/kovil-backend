/**
 * controllers/poojaController.js
 * ==============================
 * Route controllers for pooja rituals & festivals.
 */

const poojaService = require('../services/poojaService');

function getPoojas(req, res, next) {
  try {
    const data = poojaService.getPoojas();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

function getPoojaIcons(req, res, next) {
  try {
    const data = poojaService.getPoojaIcons();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

function createPooja(req, res, next) {
  try {
    const data = poojaService.createPooja(req.body);
    res.status(201).json({ success: true, message: 'பூஜை வெற்றிகரமாக சேர்க்கப்பட்டது', data });
  } catch (error) {
    next(error);
  }
}

function updatePooja(req, res, next) {
  try {
    const { id } = req.params;
    const data = poojaService.modifyPooja(id, req.body);
    res.json({ success: true, message: 'பூஜை விவரம் புதுப்பிக்கப்பட்டது', data });
  } catch (error) {
    next(error);
  }
}

function deletePooja(req, res, next) {
  try {
    const { id } = req.params;
    poojaService.removePooja(id);
    res.json({ success: true, message: 'பூஜை வெற்றிகரமாக நீக்கப்பட்டது' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPoojas,
  getPoojaIcons,
  createPooja,
  updatePooja,
  deletePooja
};
