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

    const parkingSession = await prisma.parkingSession.create({
      data: {
        vehicle: { connect: { id: vehicleId } },
        slot: { connect: { id: slotId } },
      },
    });

    // Update slot status to Occupied while preserving reservation details
    const updatedSlot = await prisma.slot.update({
      where: { id: slotId },
      data: {
        status: 'Occupied'
      },
    });

    res.status(201).json(parkingSession);
  } catch (error) {
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
      ratePerMinute = 140 / 60; // 2.333... Taka per minute (140 taka/hour)
    } else if (vehicleType === 'bike') {
      ratePerMinute = 100 / 60; // 1.666... Taka per minute
    } else {
      // Default or error handling for unknown vehicle types
      ratePerMinute = 0; // Or throw an error
    }

    const onlineReservationFee = 20;
    let calculatedFee = (ratePerMinute * durationMinutes) + onlineReservationFee;

    // Round to nearest integer since database expects Int
    let finalCalculatedFee = Math.round(calculatedFee);

    // Violation detection
    let violationType = null;
    let penaltyFee = 0;
    const bookingEnd = new Date(parkingSession.slot.bookingEnd);

    if (checkOutTime > bookingEnd) {
      const overstayMinutes = Math.ceil((checkOutTime - bookingEnd) / (1000 * 60));
      if (overstayMinutes > 0) {
        violationType = 'Overstay';
        const penaltyRatePerMinute = 1; // 1 Taka per minute for violation
        const penalty = penaltyRatePerMinute * overstayMinutes;
        penaltyFee = Math.round(penalty);
        finalCalculatedFee += penaltyFee;
      }
    }

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
        violationType: violationType,
        penaltyFee: penaltyFee,
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
    res.status(500).json({ error: 'Failed to check-out' });
  }
};

// Get parking session by slot ID
const getParkingSessionBySlot = async (req, res) => {
  const { slotId } = req.params;
  try {

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

    if (!parkingSession) {
      // Let's also check if there are any parking sessions for this slot at all
      const allSessions = await prisma.parkingSession.findMany({
        where: { slotId: slotId },
        include: { vehicle: true, slot: true }
      });

      return res.status(404).json({
        error: 'No active parking session found for this slot',
        slotId: slotId,
        allSessions: allSessions.length
      });
    }

    res.json(parkingSession);
  } catch (error) {
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

    

    // Get all sessions for this specific slot and filter for active ones
    const allSessionsForSlot = await prisma.parkingSession.findMany({
      where: { slotId: slotId },
      include: { vehicle: true, slot: true },
      orderBy: { checkInTime: 'desc' }
    });

    // Find the most recent session without a checkout time
    const parkingSession = allSessionsForSlot.find(session => !session.checkOutTime);

    if (!parkingSession) {
      // Check if the slot status is inconsistent (shows Occupied but no active session)
      const slot = await prisma.slot.findUnique({ where: { id: slotId } });

      if (slot && slot.status === 'Occupied') {

        // Fix the slot status
        await prisma.slot.update({
          where: { id: slotId },
          data: {
            status: 'Available',
            reservedBy: null,
            vehicleId: null,
            bookingStart: null,
            bookingEnd: null,
          },
        });

        return res.status(404).json({
          error: 'No active parking session found for this slot. Slot status has been corrected.',
          slotId: slotId,
          totalSessionsForSlot: allSessionsForSlot.length,
          statusFixed: true,
          allSessions: allSessionsForSlot.map(s => ({
            id: s.id,
            checkInTime: s.checkInTime,
            checkOutTime: s.checkOutTime,
            vehiclePlate: s.vehicle?.licensePlate
          }))
        });
      }

      return res.status(404).json({
        error: 'No active parking session found for this slot',
        slotId: slotId,
        totalSessionsForSlot: allSessionsForSlot.length,
        allSessions: allSessionsForSlot.map(s => ({
          id: s.id,
          checkInTime: s.checkInTime,
          checkOutTime: s.checkOutTime,
          vehiclePlate: s.vehicle?.licensePlate
        }))
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
      ratePerMinute = 140 / 60; // 2.333... Taka per minute (140 taka/hour)
    } else if (vehicleType === 'bike') {
      ratePerMinute = 100 / 60; // 1.666... Taka per minute
    } else {
      // Default or error handling for unknown vehicle types
      ratePerMinute = 0; // Or throw an error
    }

    const onlineReservationFee = 20;
    let calculatedFee = (ratePerMinute * durationMinutes) + onlineReservationFee;

    // Round to nearest integer since database expects Int
    let finalCalculatedFee = Math.round(calculatedFee);

    // Violation detection
    let violationType = null;
    let penaltyFee = 0;
    const bookingEnd = new Date(parkingSession.slot.bookingEnd);

    if (checkOutTime > bookingEnd) {
      const overstayMinutes = Math.ceil((checkOutTime - bookingEnd) / (1000 * 60));
      if (overstayMinutes > 0) {
        violationType = 'Overstay';
        const penaltyRatePerMinute = 1; // 1 Taka per minute for violation
        const penalty = penaltyRatePerMinute * overstayMinutes;
        penaltyFee = Math.round(penalty);
        finalCalculatedFee += penaltyFee;
      }
    }

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
        violationType: violationType,
        penaltyFee: penaltyFee,
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

    // Also get active sessions count
    const activeSessions = sessions.filter(session => !session.checkOutTime);

    res.json({
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      sessions: sessions.map(session => ({
        id: session.id,
        slotId: session.slotId,
        slotLocation: session.slot?.location,
        vehiclePlate: session.vehicle?.licensePlate,
        checkInTime: session.checkInTime,
        checkOutTime: session.checkOutTime,
        isActive: !session.checkOutTime,
        duration: session.duration,
        fee: session.fee
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get parking sessions' });
  }
};

// Repair function to fix data inconsistencies
const repairSlotStatuses = async (req, res) => {
  try {

    // Get all slots that show as Occupied
    const occupiedSlots = await prisma.slot.findMany({
      where: { status: 'Occupied' },
      include: { vehicle: true }
    });

    let repairedCount = 0;

    for (const slot of occupiedSlots) {
      // Check if there's an active parking session for this slot
      const activeSessions = await prisma.parkingSession.findMany({
        where: { slotId: slot.id },
        orderBy: { checkInTime: 'desc' }
      });

      const activeSession = activeSessions.find(session => !session.checkOutTime);

      if (!activeSession) {
        // No active session but slot shows Occupied - fix it

        await prisma.slot.update({
          where: { id: slot.id },
          data: {
            status: 'Available',
            reservedBy: null,
            vehicleId: null,
            bookingStart: null,
            bookingEnd: null,
          },
        });

        repairedCount++;
      }
    }

    res.json({
      message: 'Slot status repair completed',
      totalOccupiedSlots: occupiedSlots.length,
      repairedSlots: repairedCount,
      details: occupiedSlots.map(slot => ({
        id: slot.id,
        location: slot.location,
        status: slot.status,
        vehiclePlate: slot.vehicle?.licensePlate
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to repair slot statuses' });
  }
};

module.exports = {
  checkIn,
  checkOut,
  checkOutBySlot,
  getParkingSessionBySlot,
  getParkingSessionsByUser,
  getAllParkingSessions,
  repairSlotStatuses,
};