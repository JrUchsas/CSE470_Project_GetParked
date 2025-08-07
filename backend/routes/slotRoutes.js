const express = require('express');
const router = express.Router();
const {
  getSlots,
  createSlot,
  updateSlot,
  deleteSlot,
} = require('../controllers/slotController');

// Route for getting all slots and creating a new one
router.route('/').get(getSlots).post(createSlot);

// Route for updating and deleting a specific slot by ID
router.route('/:id').put(updateSlot).delete(deleteSlot);

module.exports = router;