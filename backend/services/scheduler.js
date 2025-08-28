const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('Scheduler service initialized.');

// This cron job runs every hour
const overstayCheckJob = cron.schedule('0 * * * *', async () => {
  console.log('Running overstay check...');
  try {
    const now = new Date();

    // Find reservations that have ended, are not checked out, and have no violation yet
    const overstayedReservations = await prisma.reservationHistory.findMany({
      where: {
        reservedEnd: {
          lt: now, // The reservation end time is in the past
        },
        checkOutTime: null, // The user has not checked out
        violationType: null, // A violation has not already been recorded
      },
    });

    if (overstayedReservations.length > 0) {
      console.log(`Found ${overstayedReservations.length} overstayed reservations.`);
      // For each overstayed reservation, update it to add a violation
      for (const reservation of overstayedReservations) {
        await prisma.reservationHistory.update({
          where: { id: reservation.id },
          data: {
            violationType: 'Overstay',
            penaltyFee: 50, // Example penalty fee, you can make this dynamic
            paymentStatus: 'Not Paid',
          },
        });
      }
      console.log('Successfully flagged overstayed reservations.');
    }
  } catch (error) {
    console.error('Error during overstay check:', error);
  }
});

const startScheduler = () => {
  overstayCheckJob.start();
  console.log('Overstay check scheduler started. Will run every hour.');
};

module.exports = { startScheduler };
