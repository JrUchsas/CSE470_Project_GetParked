const express = require('express');
const router = express.Router();
const { checkIn, checkOut, checkOutBySlot, getParkingSessionBySlot, getParkingSessionsByUser, getAllParkingSessions } = require('../controllers/parkingController');

router.post('/check-in', checkIn);
router.put('/check-out/:id', checkOut);
router.put('/check-out-by-slot/:slotId', checkOutBySlot);
router.get('/slot/:slotId', getParkingSessionBySlot);
router.get('/user/:userId', getParkingSessionsByUser);
router.get('/all', getAllParkingSessions);

module.exports = router;
