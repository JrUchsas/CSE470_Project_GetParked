const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Fetch all slots
// @route   GET /api/slots
// @access  Public
const getSlots = async (req, res) => {
  try {
    const slots = await prisma.slot.findMany({
      orderBy: {
        location: 'asc',
      },
      include: { user: true, vehicle: true },
    });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a slot
// @route   POST /api/slots
// @access  Private/Admin
const createSlot = async (req, res) => {
  const { location, vehicleType } = req.body;

  if (!location) {
    return res.status(400).json({ message: 'Location is required' });
  }

  try {
    const slotExists = await prisma.slot.findUnique({
      where: { location },
    });

    if (slotExists) {
      return res.status(400).json({ message: 'Slot location already exists' });
    }

    const newSlot = await prisma.slot.create({
      data: {
        location,
        status: 'Available',
        type: vehicleType, // Using 'vehicleType' here
      },
    });
    res.status(201).json(newSlot);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a slot (location, status, reservedBy)
// @route   PUT /api/slots/:id
// @access  Private/Admin or Authenticated (for reservation)
const updateSlot = async (req, res) => {
  const { id } = req.params;
  const { location, status, reservedBy, bookingStart, bookingEnd, type, vehicleId } = req.body;

  try {
    const updatedSlot = await prisma.slot.update({
      where: { id },
      data: {
        ...(location && { location }),
        ...(status && { status }),
        ...(type && { type }), // Assign 'vehicleType' to 'type' field in Prisma
        reservedBy: reservedBy === undefined ? undefined : reservedBy,
        bookingStart: bookingStart === undefined ? undefined : bookingStart,
        bookingEnd: bookingEnd === undefined ? undefined : bookingEnd,
        ...(vehicleId && { vehicleId }),
      },
      include: { user: true },
    });
    res.json(updatedSlot);
  } catch (error) {
    res.status(404).json({ message: 'Slot not found', error: error.message });
  }
};

// @desc    Delete a slot
// @route   DELETE /api/slots/:id
// @access  Private/Admin
const deleteSlot = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSlot = await prisma.slot.delete({
      where: { id },
    });
    res.json({ message: 'Slot removed' });
  } catch (error) {
    console.error('Error deleting slot:', error); // Added detailed error logging
    res.status(500).json({ message: 'Could not delete slot', error: error.message }); // Changed status to 500 and message
  }
};

module.exports = { getSlots, createSlot, updateSlot, deleteSlot };