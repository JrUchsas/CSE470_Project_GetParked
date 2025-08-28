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

    // Bookings for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyBookings = await prisma.reservationHistory.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Format daily bookings for the chart
    const bookingsLast7Days = Array(7).fill(0).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const day = d.toISOString().split('T')[0];
        return { date: day, count: 0 };
    }).reverse();

    dailyBookings.forEach(item => {
        const itemDate = item.createdAt.toISOString().split('T')[0];
        const dayData = bookingsLast7Days.find(d => d.date === itemDate);
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
      bookingsLast7Days,
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ message: 'Server error while fetching statistics.' });
  }
};

module.exports = {
  getStatistics,
};
