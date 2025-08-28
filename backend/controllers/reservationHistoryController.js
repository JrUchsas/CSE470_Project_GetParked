const { PrismaClient } = require('@prisma/client');
const { createPaymentInvoice } = require('./paymentInvoiceController');
const prisma = new PrismaClient();

// Get reservation history for a user
const getReservationHistoryByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const reservationHistory = await prisma.reservationHistory.findMany({
      where: {
        userId: userId,
      },
      include: {
        slot: true,
        vehicle: true,
        feedback: true,
      },
      orderBy: {
        checkOutTime: 'desc', // Order by most recent
      },
    });
    res.json(reservationHistory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get reservation history for user' });
  }
};

// Create a reservation history entry (used when checking out)
const createReservationHistory = async (req, res) => {
  const {
    userId,
    slotId,
    vehicleId,
    slotLocation,
    vehiclePlate,
    vehicleModel,
    vehicleType,
    reservedStart,
    reservedEnd,
    checkInTime,
    checkOutTime,
    duration,
    fee
  } = req.body;

  try {
    const reservationHistory = await prisma.reservationHistory.create({
      data: {
        userId,
        slotId,
        vehicleId,
        slotLocation,
        vehiclePlate,
        vehicleModel,
        vehicleType,
        reservedStart: new Date(reservedStart),
        reservedEnd: new Date(reservedEnd),
        checkInTime: new Date(checkInTime),
        checkOutTime: new Date(checkOutTime),
        duration,
        fee,
      },
      include: {
        slot: true,
        vehicle: true,
        user: true,
      },
    });
    res.status(201).json(reservationHistory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create reservation history' });
  }
};

// Get all reservation history (admin only)
const getAllReservationHistory = async (req, res) => {
  try {
    const reservationHistory = await prisma.reservationHistory.findMany({
      include: {
        user: true,
        slot: true,
        vehicle: true,
      },
      orderBy: {
        checkOutTime: 'desc',
      },
    });
    res.json(reservationHistory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get reservation history' });
  }
};

// Update payment status for a reservation history entry
const updatePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;

  try {
    const updatedHistory = await prisma.reservationHistory.update({
      where: { id: id },
      data: { paymentStatus: paymentStatus },
    });

    // If payment status is set to "Paid", create a payment invoice
    if (paymentStatus === 'Paid') {
      try {
        const paymentInvoice = await createPaymentInvoice(id);
      } catch (invoiceError) {
        // Don't fail the payment status update if invoice creation fails
        // The payment is still successful, just log the error
      }
    }

    res.json(updatedHistory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment status' });
  }
};

// Get reservation history by ID
const getReservationHistoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const history = await prisma.reservationHistory.findUnique({
      where: { id },
      include: {
        user: true,
        slot: true,
        vehicle: true,
      },
    });

    if (history) {
      res.json(history);
    } else {
      res.status(404).json({ message: 'Reservation history not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get reservation history by ID' });
  }
};

// @desc    Report a violation for a reservation
// @route   POST /api/reservation-history/:id/violation
// @access  Private/Admin
const reportViolation = async (req, res) => {
  const { id } = req.params;
  const { violationType, penaltyFee } = req.body;

  if (!violationType || !penaltyFee) {
    return res.status(400).json({ message: 'Violation type and penalty fee are required.' });
  }

  try {
    const updatedHistory = await prisma.reservationHistory.update({
      where: { id: id },
      data: {
        violationType,
        penaltyFee,
        paymentStatus: 'Not Paid', // Ensure payment status reflects the new penalty
      },
    });

    res.json(updatedHistory);
  } catch (error) {
    console.error('Error reporting violation:', error);
    res.status(500).json({ message: 'Failed to report violation.' });
  }
};

module.exports = {
  getReservationHistoryByUser,
  createReservationHistory,
  getAllReservationHistory,
  updatePaymentStatus,
  getReservationHistoryById,
  reportViolation,
};