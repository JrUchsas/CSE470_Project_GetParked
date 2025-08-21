const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Admin only routes
router.route('/')
  .get(protect, authorize(['admin']), userController.getAllUsers);

router.route('/:id')
  .get(protect, authorize(['admin']), userController.getUserById)
  .put(protect, authorize(['admin']), userController.updateUser)
  .delete(protect, authorize(['admin']), userController.deleteUser);

module.exports = router;