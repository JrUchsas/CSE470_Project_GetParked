const express = require('express');
const router = express.Router();
const { getStatistics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/admin/statistics
// @desc    Get application statistics
// @access  Private/Admin
router.get('/statistics', protect, authorize('admin'), getStatistics);

module.exports = router;
