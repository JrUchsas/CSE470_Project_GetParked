const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to check if current time is within reservation window
const isTimeWithinReservation = (currentTime, bookingStart, bookingEnd) => {
  const now = new Date(currentTime);
  const start = new Date(bookingStart);
  const end = new Date(bookingEnd);

  // Allow check-in 15 minutes before and after the start time
  const allowedStart = new Date(start.getTime() - 15 * 60 * 1000);
  const allowedEnd = new Date(end.getTime());

  return now >= allowedStart && now <= allowedEnd;
};

// Log check-in
const checkIn = async (req, res) => {
  const { vehicleId, slotId } = req.body;
  console.log('Check-in request received:', { vehicleId, slotId });
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { owner: true }
    });
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { user: true, vehicle: true }
    });

    if (!vehicle || !slot) {
      return res.status(404).json({ error: 'Vehicle or Slot not found' });
    }

    // Check if slot is reserved (new requirement)
    if (slot.status !== 'Reserved') {
      return res.status(400).json({ error: 'Slot must be reserved before check-in' });
    }

    // Check if the slot is reserved by the vehicle owner
    if (slot.reservedBy !== vehicle.ownerId) {
      return res.status(403).json({ error: 'Slot is not reserved by this vehicle owner' });
    }

    // Check if the reserved vehicle matches the check-in vehicle
    if (slot.vehicleId !== vehicleId) {
      return res.status(400).json({ error: 'Vehicle does not match the reservation' });
    }

    // Validate reservation time
    const currentTime = new Date();
    if (!isTimeWithinReservation(currentTime, slot.bookingStart, slot.bookingEnd)) {
      return res.status(400).json({
        error: 'Current time is not within your reserved slot time. You can check in 15 minutes before your reservation starts until your reservation ends.',
        currentTime: currentTime.toISOString(),
        reservationStart: slot.bookingStart,
        reservationEnd: slot.bookingEnd
      });
    }

    console.log('Creating parking session...');
    const parkingSession = await prisma.parkingSession.create({
      data: {
        vehicle: { connect: { id: vehicleId } },
        slot: { connect: { id: slotId } },
      },
    });
    console.log('Parking session created:', parkingSession);

    // Update slot status to Occupied while preserving reservation details
    console.log('Updating slot status to Occupied...');
    const updatedSlot = await prisma.slot.update({
      where: { id: slotId },
      data: {
        status: 'Occupied'
        // Keep reservedBy, vehicleId, bookingStart, bookingEnd intact
      },
    });
    console.log('Slot updated:', updatedSlot);

    res.status(201).json(parkingSession);
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Failed to check-in' });
  }
};

// Log check-out by parking session ID
const checkOut = async (req, res) => {
  const { id } = req.params;
  try {
    const parkingSession = await prisma.parkingSession.findUnique({
      where: { id },
      include: {
        vehicle: {
          include: { owner: true }
        },
        slot: true
      }
    });

    if (!parkingSession) {
      return res.status(404).json({ error: 'Parking session not found' });
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(parkingSession.checkInTime);
    const durationMinutes = Math.ceil((checkOutTime - checkInTime) / (1000 * 60)); // Duration in minutes

    // Define hourly rates based on vehicle type
    let ratePerMinute = 0;
    const vehicleType = parkingSession.vehicle.type.toLowerCase(); // Ensure type is lowercase for comparison

    if (vehicleType === 'car' || vehicleType === 'suv') {
      ratePerMinute = 120 / 60; // 2 Taka per minute
    } else if (vehicleType === 'van' || vehicleType === 'minibus') {
      ratePerMinute = 180 / 60; // 3 Taka per minute
    } else if (vehicleType === 'bike') {
      ratePerMinute = 100 / 60; // 1.666... Taka per minute
    } else {
      // Default or error handling for unknown vehicle types
      ratePerMinute = 0; // Or throw an error
    }

    const onlineReservationFee = 20;
    const calculatedFee = (ratePerMinute * durationMinutes) + onlineReservationFee;

    // Round the calculated fee to 2 decimal places (or nearest integer if preferred)
    // Since the rates are integers, and durationMinutes is integer, this might not be strictly necessary
    // unless bike rate is used, which is a float.
    const finalCalculatedFee = parseFloat(calculatedFee.toFixed(2)); // Round to 2 decimal places
    console.log('Calculated Fee (checkOut):', finalCalculatedFee); // ADD THIS LINE

    // Update the parking session with check-out details
    const updatedParkingSession = await prisma.parkingSession.update({
      where: { id },
      data: {
        checkOutTime,
        duration: durationMinutes, // Store duration in minutes
        fee: finalCalculatedFee, // Store the calculated fee
      },
    });

    // Create reservation history entry
    await prisma.reservationHistory.create({
      data: {
        userId: parkingSession.vehicle.ownerId,
        slotId: parkingSession.slotId,
        vehicleId: parkingSession.vehicleId,
        slotLocation: parkingSession.slot.location,
        vehiclePlate: parkingSession.vehicle.licensePlate,
        vehicleModel: parkingSession.vehicle.model,
        vehicleType: parkingSession.vehicle.type,
        reservedStart: parkingSession.slot.bookingStart,
        reservedEnd: parkingSession.slot.bookingEnd,
        checkInTime: parkingSession.checkInTime,
        checkOutTime: checkOutTime,
        duration: durationMinutes, // Store duration in minutes
        fee: finalCalculatedFee, // Store the calculated fee
        paymentStatus: "Not Paid", // Default status
      },
    });

    // Update slot status to Available and clear reservation details
    await prisma.slot.update({
      where: { id: parkingSession.slotId },
      data: {
        status: 'Available',
        reservedBy: null,
        vehicleId: null,
        bookingStart: null,
        bookingEnd: null,
      },
    });

    res.json(updatedParkingSession);
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ error: 'Failed to check-out' });
  }
};

// Get parking session by slot ID
const getParkingSessionBySlot = async (req, res) => {
  const { slotId } = req.params;
  try {
    console.log('Looking for parking session for slot ID:', slotId);

    const parkingSession = await prisma.parkingSession.findFirst({
      where: {
        slotId: slotId,
        checkOutTime: null
      }, // Find active session
      include: {
        vehicle: true,
        slot: true
      }
    });

    console.log('Found parking session:', parkingSession);

    if (!parkingSession) {
      // Let's also check if there are any parking sessions for this slot at all
      const allSessions = await prisma.parkingSession.findMany({
        where: { slotId: slotId },
        include: { vehicle: true, slot: true }
      });
      console.log('All parking sessions for this slot:', allSessions);

      return res.status(404).json({
        error: 'No active parking session found for this slot',
        slotId: slotId,
        allSessions: allSessions.length
      });
    }

    res.json(parkingSession);
  } catch (error) {
    console.error('Error getting parking session by slot:', error);
    res.status(500).json({ error: 'Failed to get parking session', details: error.message });
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

// Check-out by slot ID (alternative method)
const checkOutBySlot = async (req, res) => {
  const { slotId } = req.params;
  try {
    console.log('Checking out by slot ID:', slotId);

    // First, let's see all parking sessions (active and inactive)
    const allSessions = await prisma.parkingSession.findMany({
      include: { vehicle: true, slot: true },
      orderBy: { checkInTime: 'desc' },
      take: 5 // Get last 5 sessions
    });
    console.log('Last 5 parking sessions:', allSessions);

    // Now check active sessions with different query approaches
    const allActiveSessions1 = await prisma.parkingSession.findMany({
      where: { checkOutTime: null },
      include: { vehicle: true, slot: true }
    });
    console.log('Active sessions (checkOutTime: null):', allActiveSessions1);

    const allActiveSessions2 = await prisma.parkingSession.findMany({
      where: {
        OR: [
          { checkOutTime: null },
          { checkOutTime: { equals: null } }
        ]
      },
      include: { vehicle: true, slot: true }
    });
    console.log('Active sessions (OR query):', allActiveSessions2);

    const allActiveSessions3 = await prisma.parkingSession.findMany({
      where: {
        NOT: {
          checkOutTime: { not: null }
        }
      },
      include: { vehicle: true, slot: true }
    });
    console.log('Active sessions (NOT query):', allActiveSessions3);

    // Since the null queries are not working, let's find the session manually from all sessions
    const activeSessions = allSessions.filter(session => !session.checkOutTime);
    console.log('Manually filtered active sessions:', activeSessions);

    // Find the active parking session for this slot
    const parkingSession = activeSessions.find(session => session.slotId === slotId);

    console.log('Found parking session for slot:', parkingSession);

    if (!parkingSession) {
      return res.status(404).json({
        error: 'No active parking session found for this slot',
        slotId: slotId,
        availableSessions: activeSessions.map(s => ({ slotId: s.slotId, sessionId: s.id }))
      });
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(parkingSession.checkInTime);
    const durationMinutes = Math.ceil((checkOutTime - checkInTime) / (1000 * 60)); // Duration in minutes

    // Define hourly rates based on vehicle type
    let ratePerMinute = 0;
    const vehicleType = parkingSession.vehicle.type.toLowerCase(); // Ensure type is lowercase for comparison

    if (vehicleType === 'car' || vehicleType === 'suv') {
      ratePerMinute = 120 / 60; // 2 Taka per minute
    } else if (vehicleType === 'van' || vehicleType === 'minibus') {
      ratePerMinute = 180 / 60; // 3 Taka per minute
    } else if (vehicleType === 'bike') {
      ratePerMinute = 100 / 60; // 1.666... Taka per minute
    } else {
      // Default or error handling for unknown vehicle types
      ratePerMinute = 0; // Or throw an error
    }

    const onlineReservationFee = 20;
    const calculatedFee = (ratePerMinute * durationMinutes) + onlineReservationFee;

    // Round the calculated fee to 2 decimal places
    const finalCalculatedFee = parseFloat(calculatedFee.toFixed(2));
    console.log('Calculated Fee (checkOutBySlot):', finalCalculatedFee); // ADD THIS LINE

    // Update the parking session with check-out details
    const updatedParkingSession = await prisma.parkingSession.update({
      where: { id: parkingSession.id },
      data: {
        checkOutTime,
        duration: durationMinutes,
        fee: finalCalculatedFee,
      },
    });

    // Create reservation history entry
    await prisma.reservationHistory.create({
      data: {
        userId: parkingSession.vehicle.ownerId,
        slotId: parkingSession.slotId,
        vehicleId: parkingSession.vehicleId,
        slotLocation: parkingSession.slot.location,
        vehiclePlate: parkingSession.vehicle.licensePlate,
        vehicleModel: parkingSession.vehicle.model,
        vehicleType: parkingSession.vehicle.type,
        reservedStart: parkingSession.slot.bookingStart,
        reservedEnd: parkingSession.slot.bookingEnd,
        checkInTime: parkingSession.checkInTime,
        checkOutTime: checkOutTime,
        duration: durationMinutes,
        fee: finalCalculatedFee,
        paymentStatus: "Not Paid",
      },
    });

    // Update slot status to Available and clear reservation details
    await prisma.slot.update({
      where: { id: parkingSession.slotId },
      data: {
        status: 'Available',
        reservedBy: null,
        vehicleId: null,
        bookingStart: null,
        bookingEnd: null,
      },
    });

    res.json(updatedParkingSession);
  } catch (error) {
    console.error('Check-out by slot error:', error);
    res.status(500).json({ error: 'Failed to check-out', details: error.message });
  }
};

// Debug endpoint to check all parking sessions
const getAllParkingSessions = async (req, res) => {
  try {
    const sessions = await prisma.parkingSession.findMany({
      include: {
        vehicle: true,
        slot: true
      },
      orderBy: {
        checkInTime: 'desc'
      }
    });
    res.json(sessions);
  } catch (error) {
    console.error('Error getting all parking sessions:', error);
    res.status(500).json({ error: 'Failed to get parking sessions' });
  }
};

module.exports = {
  checkIn,
  checkOut,
  checkOutBySlot,
  getParkingSessionBySlot,
  getParkingSessionsByUser,
  getAllParkingSessions,
};
