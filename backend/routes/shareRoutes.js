const express = require('express');
const router = express.Router();
const {
  createShareRequest,
  getShareRequestsForUser,
  acceptShareRequest,
  rejectShareRequest,
  sendShareMessage,
  getShareMessages,
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

// @route   PUT /api/share/requests/:id/accept
// @desc    Accept a share request
// @access  Private (Original User Only)
router.put('/requests/:id/accept', acceptShareRequest);

// @route   PUT /api/share/requests/:id/reject
// @desc    Reject a share request
// @access  Private (Original User Only)
router.put('/requests/:id/reject', rejectShareRequest);

// @route   POST /api/share/requests/:id/message
// @desc    Send a message within a share request chat
// @access  Private (Participants Only)
router.post('/requests/:id/message', sendShareMessage);

// @route   GET /api/share/requests/:id/messages
// @desc    Get messages for a specific share request chat
// @access  Private (Participants Only)
router.get('/requests/:id/messages', getShareMessages);

module.exports = router;
