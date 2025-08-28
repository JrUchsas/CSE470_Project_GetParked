const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get admin statistics
// @route   GET /api/admin/statistics
// @access  Private/Admin
const getStatistics = async (req, res) => {
  try {
    // Total Users
    const totalUsers = await prisma.user.count({
      where: { role: 'user' },
    });

    // Total Bookings (from ReservationHistory)
    const totalBookings = await prisma.reservationHistory.count();

    // Total Revenue (sum of fees from paid invoices)
    const revenueResult = await prisma.paymentInvoice.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        paymentStatus: 'Paid',
      },
    });
    const totalRevenue = revenueResult._sum.totalAmount || 0;

    // Slot Occupancy
    const totalSlots = await prisma.slot.count();
    const occupiedSlots = await prisma.slot.count({
      where: {
        status: { not: 'Available' },
      },
    });
    const slotOccupancyRate = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

    // Bookings for the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyBookingsRaw = await prisma.reservationHistory.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Format monthly bookings for calendar view
    const bookingsThisMonth = [];
    let currentDate = new Date(startOfMonth);
    while (currentDate <= endOfMonth) {
      const dateString = currentDate.toISOString().split('T')[0];
      bookingsThisMonth.push({ date: dateString, count: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    monthlyBookingsRaw.forEach(item => {
        const itemDate = item.createdAt.toISOString().split('T')[0];
        const dayData = bookingsThisMonth.find(d => d.date === itemDate);
        if (dayData) {
            dayData.count += item._count.id;
        }
    });


    res.json({
      totalUsers,
      totalBookings,
      totalRevenue,
      slotOccupancy: {
        occupied: occupiedSlots,
        total: totalSlots,
        percentage: slotOccupancyRate.toFixed(2),
      },
      bookingsThisMonth,
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ message: 'Server error while fetching statistics.' });
  }
};

module.exports = {
  getStatistics,
};
