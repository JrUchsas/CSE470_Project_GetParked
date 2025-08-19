const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new vehicle
const createVehicle = async (req, res) => {
  const { licensePlate, model, color, type, ownerId } = req.body;
  try {
    const newVehicle = await prisma.vehicle.create({
      data: {
        licensePlate,
        model,
        color,
        type,
        owner: { connect: { id: ownerId } },
      },
    });
    res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
};

// Get all vehicles for a user
const getVehiclesByOwner = async (req, res) => {
  const { ownerId } = req.params;
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { ownerId },
    });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get vehicles' });
  }
};

// Update a vehicle
const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const { licensePlate, model, color, type } = req.body;

  try {
    const existingVehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    let message = 'Vehicle updated successfully.';

    // Check if vehicle type is being changed
    if (type && existingVehicle.type !== type) {
      // Find any active parking sessions for this vehicle
      const activeParkingSessions = await prisma.parkingSession.findMany({
        where: { vehicleId: id, checkOutTime: null },
        include: { slot: true },
      });

      for (const session of activeParkingSessions) {
        if (session.slot && session.slot.type !== type) {
          // Type mismatch: close the reservation
          const checkOutTime = new Date();
          const checkInTime = new Date(session.checkInTime);
          const duration = Math.ceil((checkOutTime - checkInTime) / (1000 * 60)); // Duration in minutes
          const fee = Math.ceil(duration / 60); // $1 per hour, rounded up

          await prisma.parkingSession.update({
            where: { id: session.id },
            data: {
              checkOutTime,
              duration,
              fee,
            },
          });

          // Set the slot status back to Available
          await prisma.slot.update({
            where: { id: session.slot.id },
            data: { status: 'Available' },
          });

          message += ` Reservation for slot ${session.slot.location} was closed due to vehicle type mismatch.`;
        }
      }
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        licensePlate,
        model,
        color,
        type,
      },
    });
    res.json({ ...updatedVehicle, message });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
};

// Delete a vehicle
const deleteVehicle = async (req, res) => {
  const { id } = req.params;
  try {
    // Find all active ParkingSession records associated with this vehicle
    const activeParkingSessions = await prisma.parkingSession.findMany({
      where: { vehicleId: id, checkOutTime: null },
      include: { slot: true },
    });

    // For each active ParkingSession, close it and free up the slot
    for (const session of activeParkingSessions) {
      const checkOutTime = new Date();
      const checkInTime = new Date(session.checkInTime);
      const duration = Math.ceil((checkOutTime - checkInTime) / (1000 * 60)); // Duration in minutes
      const fee = Math.ceil(duration / 60); // $1 per hour, rounded up

      await prisma.parkingSession.update({
        where: { id: session.id },
        data: {
          checkOutTime,
          duration,
          fee,
        },
      });

      await prisma.slot.update({
        where: { id: session.slot.id },
        data: { status: 'Available' },
      });
    }

    await prisma.vehicle.delete({
      where: { id },
    });
    res.status(200).json({ message: 'Vehicle deleted and associated active parking sessions closed.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
};

// Get all vehicles
const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get all vehicles' });
  }
};

module.exports = {
  createVehicle,
  getVehiclesByOwner,
  updateVehicle,
  deleteVehicle,
  getAllVehicles,
};
