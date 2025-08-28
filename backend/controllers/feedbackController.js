const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Private
const createFeedback = async (req, res) => {
  const { rating, comment, reservationHistoryId } = req.body;
  const userId = req.user.id; // from protect middleware

  if (!rating || !reservationHistoryId) {
    return res.status(400).json({ message: 'Rating and reservation ID are required.' });
  }

  try {
    // Check if feedback for this reservation already exists
    const existingFeedback = await prisma.feedback.findUnique({
      where: { reservationHistoryId },
    });

    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback has already been submitted for this reservation.' });
    }

    const feedback = await prisma.feedback.create({
      data: {
        rating: parseInt(rating, 10),
        comment,
        userId,
        reservationHistoryId,
      },
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ message: 'Server error while creating feedback.' });
  }
};

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private/Admin
const getAllFeedback = async (req, res) => {
  try {
    const feedback = await prisma.feedback.findMany({
      include: {
        user: { select: { name: true, email: true } },
        reservationHistory: { select: { slotLocation: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Server error while fetching feedback.' });
  }
};

module.exports = { createFeedback, getAllFeedback };
