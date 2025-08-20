const express = require('express');
const router = express.Router();
const { 
  getReservationHistoryByUser, 
  createReservationHistory, 
  getAllReservationHistory 
} = require('../controllers/reservationHistoryController');

// Get reservation history for a specific user
router.get('/user/:userId', getReservationHistoryByUser);

// Create a new reservation history entry
router.post('/', createReservationHistory);

// Get all reservation history (admin only)
router.get('/', getAllReservationHistory);

module.exports = router;
