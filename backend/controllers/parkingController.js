const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Log check-in
const checkIn = async (req, res) => {
  const { vehicleId, slotId } = req.body;
  try {
    const parkingSession = await prisma.parkingSession.create({
      data: {
        vehicle: { connect: { id: vehicleId } },
        slot: { connect: { id: slotId } },
      },
    });

    // Update slot status to Occupied
    await prisma.slot.update({
      where: { id: slotId },
      data: { status: 'Occupied' },
    });

    res.status(201).json(parkingSession);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check-in' });
  }
};

// Log check-out
const checkOut = async (req, res) => {
  const { id } = req.params;
  try {
    const parkingSession = await prisma.parkingSession.findUnique({ where: { id } });
    if (!parkingSession) {
      return res.status(404).json({ error: 'Parking session not found' });
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(parkingSession.checkInTime);
    const duration = Math.ceil((checkOutTime - checkInTime) / (1000 * 60)); // Duration in minutes
    const fee = Math.ceil(duration / 60); // $1 per hour, rounded up

    const updatedParkingSession = await prisma.parkingSession.update({
      where: { id },
      data: {
        checkOutTime,
        duration,
        fee,
      },
    });

    // Update slot status to Available
    await prisma.slot.update({
      where: { id: parkingSession.slotId },
      data: { status: 'Available' },
    });

    res.json(updatedParkingSession);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check-out' });
  }
};

// Get parking session by slot ID
const getParkingSessionBySlot = async (req, res) => {
  const { slotId } = req.params;
  try {
    const parkingSession = await prisma.parkingSession.findFirst({
      where: { slotId, checkOutTime: null }, // Find active session
    });
    if (!parkingSession) {
      return res.status(404).json({ error: 'Parking session not found' });
    }
    res.json(parkingSession);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get parking session' });
  }
};

// Get all parking sessions for a user
const getParkingSessionsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const parkingSessions = await prisma.parkingSession.findMany({
      where: {
        vehicle: {
          ownerId: userId,
        },
      },
      include: {
        vehicle: true, // Include vehicle details
        slot: true,    // Include slot details
      },
      orderBy: {
        checkInTime: 'desc', // Order by most recent
      },
    });
    res.json(parkingSessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get parking sessions for user' });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getParkingSessionBySlot,
  getParkingSessionsByUser,
};
