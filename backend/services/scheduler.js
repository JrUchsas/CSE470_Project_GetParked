const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// This cron job runs every hour
const startScheduler = () => {
  cron.schedule('0 * * * *', async () => { // Run every hour
    try {
      const overstayedReservations = await prisma.reservationHistory.findMany({
        where: {
          checkInTime: { not: null },
          checkOutTime: null, // Still checked in
          bookingEnd: { lt: new Date() }, // Booking period has ended
          violationType: null, // Not yet flagged for overstay
        },
      });

      if (overstayedReservations.length > 0) {
        const updatePromises = overstayedReservations.map(async (reservation) => {
          await prisma.reservationHistory.update({
            where: { id: reservation.id },
            data: { violationType: 'Overstay', paymentStatus: 'Pending' },
          });
        });
        await Promise.all(updatePromises);
      }
    } catch (error) {
      console.error('Error in overstay check scheduler:', error);
    }
  });
};

module.exports = {
  startScheduler,
};

module.exports = { startScheduler };
