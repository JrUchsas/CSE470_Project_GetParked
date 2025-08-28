const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Generate unique invoice number
const generateInvoiceNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${timestamp}-${random}`;
};

// Create payment invoice when payment is completed
const createPaymentInvoice = async (reservationHistoryId) => {
  try {
    // Get the reservation history with all related data
    const reservationHistory = await prisma.reservationHistory.findUnique({
      where: { id: reservationHistoryId },
      include: {
        user: true,
        vehicle: true,
        slot: true
      }
    });

    if (!reservationHistory) {
      throw new Error('Reservation history not found');
    }

    // Calculate fee breakdown
    const vehicleType = reservationHistory.vehicleType.toLowerCase();
    let hourlyRate = 0;
    
    if (vehicleType === 'car' || vehicleType === 'suv') {
      hourlyRate = 120;
    } else if (vehicleType === 'van' || vehicleType === 'minibus') {
      hourlyRate = 140;
    } else if (vehicleType === 'bike') {
      hourlyRate = 100;
    }

    const durationMinutes = reservationHistory.duration;
    const ratePerMinute = hourlyRate / 60;
    const parkingFee = Math.ceil(ratePerMinute * durationMinutes);
    const onlineReservationFee = 20;
    const totalAmount = parkingFee + onlineReservationFee;

    // Create payment invoice
    const paymentInvoice = await prisma.paymentInvoice.create({
      data: {
        reservationHistoryId: reservationHistoryId,
        invoiceNumber: generateInvoiceNumber(),
        
        // User details
        userName: reservationHistory.user.name,
        userEmail: reservationHistory.user.email,
        userContact: reservationHistory.user.contact,
        
        // Vehicle details
        vehiclePlate: reservationHistory.vehiclePlate,
        vehicleModel: reservationHistory.vehicleModel,
        vehicleType: reservationHistory.vehicleType,
        
        // Parking details
        slotLocation: reservationHistory.slotLocation,
        checkInTime: reservationHistory.checkInTime,
        checkOutTime: reservationHistory.checkOutTime,
        duration: durationMinutes,
        
        // Fee breakdown
        hourlyRate: hourlyRate,
        parkingFee: parkingFee,
        onlineReservationFee: onlineReservationFee,
        totalAmount: totalAmount,
        
        // Payment details
        paymentMethod: 'Online',
        paymentDate: new Date(),
        paymentStatus: 'Paid'
      }
    });

    return paymentInvoice;
  } catch (error) {
    throw error;
  }
};

// Get payment invoice by reservation history ID
const getPaymentInvoiceByReservationId = async (req, res) => {
  const { reservationHistoryId } = req.params;
  
  try {
    const paymentInvoice = await prisma.paymentInvoice.findUnique({
      where: { reservationHistoryId: reservationHistoryId },
      include: {
        reservationHistory: {
          include: {
            user: true
          }
        }
      }
    });

    if (!paymentInvoice) {
      return res.status(404).json({ error: 'Payment invoice not found' });
    }

    res.json(paymentInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment invoice' });
  }
};

// Get all payment invoices (admin only)
const getAllPaymentInvoices = async (req, res) => {
  try {
    const paymentInvoices = await prisma.paymentInvoice.findMany({
      include: {
        reservationHistory: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });

    res.json(paymentInvoices);
  } catch (error) {
    console.error('Error fetching payment invoices:', error);
    res.status(500).json({ error: 'Failed to fetch payment invoices' });
  }
};

// Get payment invoice by invoice number
const getPaymentInvoiceByNumber = async (req, res) => {
  const { invoiceNumber } = req.params;
  
  try {
    const paymentInvoice = await prisma.paymentInvoice.findUnique({
      where: { invoiceNumber: invoiceNumber },
      include: {
        reservationHistory: {
          include: {
            user: true
          }
        }
      }
    });

    if (!paymentInvoice) {
      return res.status(404).json({ error: 'Payment invoice not found' });
    }

    res.json(paymentInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment invoice' });
  }
};

// Get payment statistics (admin dashboard)
const getPaymentStatistics = async (req, res) => {
  try {
    const totalInvoices = await prisma.paymentInvoice.count();
    
    const totalRevenue = await prisma.paymentInvoice.aggregate({
      _sum: {
        totalAmount: true
      }
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayInvoices = await prisma.paymentInvoice.count({
      where: {
        paymentDate: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    const todayRevenue = await prisma.paymentInvoice.aggregate({
      where: {
        paymentDate: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      _sum: {
        totalAmount: true
      }
    });

    res.json({
      totalInvoices,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      todayInvoices,
      todayRevenue: todayRevenue._sum.totalAmount || 0
    });
  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    res.status(500).json({ error: 'Failed to fetch payment statistics' });
  }
};

module.exports = {
  createPaymentInvoice,
  getPaymentInvoiceByReservationId,
  getAllPaymentInvoices,
  getPaymentInvoiceByNumber,
  getPaymentStatistics
};
