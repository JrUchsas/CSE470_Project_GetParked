const express = require('express');
const router = express.Router();
const { createFeedback, getAllFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   POST /api/feedback
// @desc    Submit feedback for a reservation
// @access  Private
router.post('/', protect, createFeedback);

// @route   GET /api/feedback
// @desc    Get all feedback
// @access  Private/Admin
router.get('/', protect, authorize('admin'), getAllFeedback);

module.exports = router;
