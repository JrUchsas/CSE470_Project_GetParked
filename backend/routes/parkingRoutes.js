const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getParkingSessionBySlot, getParkingSessionsByUser } = require('../controllers/parkingController');

router.post('/check-in', checkIn);
router.put('/check-out/:id', checkOut);
router.get('/slot/:slotId', getParkingSessionBySlot);
router.get('/user/:userId', getParkingSessionsByUser);

module.exports = router;
