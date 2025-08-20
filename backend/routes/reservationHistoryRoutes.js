const express = require('express');
const router = express.Router();
const {
  getReservationHistoryByUser,
  createReservationHistory,
  getAllReservationHistory,
  updatePaymentStatus
} = require('../controllers/reservationHistoryController');

// Get reservation history for a specific user
router.get('/user/:userId', getReservationHistoryByUser);

// Create a new reservation history entry
router.post('/', createReservationHistory);

// Get all reservation history (admin only)
router.get('/', getAllReservationHistory);

// Update payment status for a reservation history entry
router.put('/:id/payment', updatePaymentStatus);

module.exports = router;
