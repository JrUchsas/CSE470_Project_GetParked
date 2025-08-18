const express = require('express');
const router = express.Router();
const { createVehicle, getVehiclesByOwner, updateVehicle, deleteVehicle, getAllVehicles } = require('../controllers/vehicleController');

router.post('/', createVehicle);
router.get('/owner/:ownerId', getVehiclesByOwner);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);
router.get('/', getAllVehicles); // New route for admin to get all vehicles

module.exports = router;
