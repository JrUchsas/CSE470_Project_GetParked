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
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        licensePlate,
        model,
        color,
        type,
      },
    });
    res.json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
};

// Delete a vehicle
const deleteVehicle = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.vehicle.delete({
      where: { id },
    });
    res.status(204).send();
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
