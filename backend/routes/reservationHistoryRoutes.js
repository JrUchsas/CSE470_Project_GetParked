const express = require('express');
const router = express.Router();
const {
  getReservationHistoryByUser,
  createReservationHistory,
  getAllReservationHistory,
    updatePaymentStatus,
  getReservationHistoryById,
  reportViolation,
  updateReservation,
  deleteReservation
} = require('../controllers/reservationHistoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get reservation history by ID
router.get('/:id', getReservationHistoryById);

// Get reservation history for a specific user
router.get('/user/:userId', getReservationHistoryByUser);

// Create a new reservation history entry
router.post('/', createReservationHistory);

// Get all reservation history (admin only)
router.get('/', getAllReservationHistory);

// Update payment status for a reservation history entry
router.put('/:id/payment', updatePaymentStatus);

// Report a violation for a reservation
router.post('/:id/violation', protect, authorize('admin'), reportViolation);

// Update a reservation
router.put('/:id', protect, authorize('admin'), updateReservation);

// Delete a reservation
router.delete('/:id', protect, authorize('admin'), deleteReservation);

module.exports = router;
