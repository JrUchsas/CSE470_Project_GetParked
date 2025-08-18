const express = require('express');
const router = express.Router();
const { createVehicle, getVehiclesByOwner, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');

router.post('/', createVehicle);
router.get('/owner/:ownerId', getVehiclesByOwner);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

module.exports = router;
