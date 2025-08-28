const express = require('express');
const router = express.Router();
const {
  createShareRequest,
  getShareRequestsForUser,
  acceptShareRequest,
  rejectShareRequest,
  sendShareRejectionMessage,
  acceptShareRequestAndCancelMyReservation,
  acceptShareRequestAndEditMyReservation,
  getRelevantPendingShareRequest, // New import
} = require('../controllers/shareController');
const { protect } = require('../middleware/authMiddleware');

// All share routes are private
router.use(protect);

// @route   POST /api/share/request
// @desc    Create a new share request
// @access  Private
router.post('/request', createShareRequest);

// @route   GET /api/share/requests
// @desc    Get share requests for the authenticated user (both sent and received)
// @access  Private
router.get('/requests', getShareRequestsForUser);

// @route   GET /api/share/requests/relevant/:slotId
// @desc    Get relevant pending share request for a specific slot and the authenticated user
// @access  Private
router.get('/requests/relevant/:slotId', getRelevantPendingShareRequest);

// @route   PUT /api/share/requests/:id/accept
// @desc    Accept a share request
// @access  Private (Original User Only)
router.put('/requests/:id/accept', acceptShareRequest);

// @route   PUT /api/share/requests/:id/accept-and-cancel
// @desc    Accept a share request and cancel the original user's overlapping reservation
// @access  Private (Original User Only)
router.put('/requests/:id/accept-and-cancel', acceptShareRequestAndCancelMyReservation);

// @route   PUT /api/share/requests/:id/accept-and-edit
// @desc    Accept a share request and edit the original user's overlapping reservation
// @access  Private (Original User Only)
router.put('/requests/:id/accept-and-edit', acceptShareRequestAndEditMyReservation);

// @route   PUT /api/share/requests/:id/reject
// @desc    Reject a share request
// @access  Private (Original User Only)
router.put('/requests/:id/reject', rejectShareRequest);

// @route   POST /api/share/requests/:id/reject-message
// @desc    Send a rejection message for a share request
// @access  Private (Original User Only)
router.post('/requests/:id/reject-message', sendShareRejectionMessage);

module.exports = router;
