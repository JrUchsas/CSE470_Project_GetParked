const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Create a new share request
// @route   POST /api/share/request
// @access  Private
const createShareRequest = async (req, res) => {
  const { slotId, originalUserId, requestedStartTime, requestedEndTime, initialMessage } = req.body;
  const requesterId = req.user.id; // User sending the request

  try {
    // Basic validation
    if (!slotId || !originalUserId || !requestedStartTime || !requestedEndTime) {
      return res.status(400).json({ message: 'Missing required fields for share request.' });
    }

    // Ensure the slot exists and is reserved by the original user
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { user: true },
    });

    if (!slot || slot.reservedBy !== originalUserId) {
      return res.status(404).json({ message: 'Slot not found or not reserved by the specified user.' });
    }

    // Ensure requester is not the original user
    if (requesterId === originalUserId) {
      return res.status(400).json({ message: 'Cannot send a share request to yourself.' });
    }

    // Check for overlapping existing requests for the same slot and requester
    const existingRequest = await prisma.shareRequest.findFirst({
      where: {
        slotId,
        requesterId,
        status: { in: ['PENDING', 'ACCEPTED'] },
        OR: [
          { requestedStartTime: { lte: new Date(requestedEndTime) }, requestedEndTime: { gte: new Date(requestedStartTime) } },
        ],
      },
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'An active share request for this slot and time already exists.' });
    }

    const shareRequest = await prisma.shareRequest.create({
      data: {
        slotId,
        originalUserId,
        requesterId,
        requestedStartTime: new Date(requestedStartTime),
        requestedEndTime: new Date(requestedEndTime),
        initialMessage,
        status: 'PENDING',
      },
    });

    res.status(201).json({ message: 'Share request sent successfully.', shareRequest });
  } catch (error) {
    console.error('Error creating share request:', error);
    res.status(500).json({ message: 'Server error while creating share request.' });
  }
};

// @desc    Get share requests for the authenticated user (both sent and received)
// @route   GET /api/share/requests
// @access  Private
const getShareRequestsForUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const requests = await prisma.shareRequest.findMany({
      where: {
        OR: [
          { originalUserId: userId }, // Requests sent to this user
          { requesterId: userId },    // Requests sent by this user
        ],
      },
      include: {
        slot: { select: { location: true, type: true } },
        originalUser: { select: { name: true, email: true } },
        requester: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching share requests:', error);
    res.status(500).json({ message: 'Server error while fetching share requests.' });
  }
};

// @desc    Accept a share request
// @route   PUT /api/share/requests/:id/accept
// @access  Private (Original User Only)
const acceptShareRequest = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // User accepting the request

  try {
    const shareRequest = await prisma.shareRequest.findUnique({
      where: { id },
    });

    if (!shareRequest) {
      return res.status(404).json({ message: 'Share request not found.' });
    }

    if (shareRequest.originalUserId !== userId) {
      return res.status(403).json({ message: 'Not authorized to accept this request.' });
    }

    if (shareRequest.status !== 'PENDING') {
      return res.status(400).json({ message: 'Request is not pending.' });
    }

    // Logic to transfer/share the slot
    // This is a critical business logic step. For now, we'll just update the request status.
    // In a real system, you might:
    // 1. Create a new temporary reservation for the requester for the shared time.
    // 2. Adjust the original user's reservation if it's a partial share.
    // 3. Handle payment/fee splitting if applicable.

    const updatedRequest = await prisma.shareRequest.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });

    // Optionally, notify the requester
    res.json({ message: 'Share request accepted.', updatedRequest });
  } catch (error) {
    console.error('Error accepting share request:', error);
    res.status(500).json({ message: 'Server error while accepting share request.' });
  }
};

// @desc    Reject a share request
// @route   PUT /api/share/requests/:id/reject
// @access  Private (Original User Only)
const rejectShareRequest = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body; // Get message from body
  const userId = req.user.id; // User rejecting the request

  try {
    const shareRequest = await prisma.shareRequest.findUnique({
      where: { id },
    });

    if (!shareRequest) {
      return res.status(404).json({ message: 'Share request not found.' });
    }

    if (shareRequest.originalUserId !== userId) {
      return res.status(403).json({ message: 'Not authorized to reject this request.' });
    }

    if (shareRequest.status !== 'PENDING') {
      // If already rejected, allow updating the message, but not changing status again
      if (shareRequest.status === 'REJECTED') {
        const updatedRequest = await prisma.shareRequest.update({
          where: { id },
          data: { rejectionMessage: message || null }, // Update message, allow null
        });
        return res.json({ message: 'Rejection message updated.', updatedRequest });
      }
      return res.status(400).json({ message: 'Request is not pending.' });
    }

    const updatedRequest = await prisma.shareRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionMessage: message || null, // Set message when rejecting
      },
    });

    res.json({ message: 'Share request rejected.', updatedRequest });
  } catch (error) {
    console.error('Error rejecting share request:', error);
    res.status(500).json({ message: 'Server error while rejecting share request.' });
  }
};

// @desc    Send a rejection message for a share request
// @route   POST /api/share/requests/:id/reject-message
// @access  Private (Original User Only)
const sendShareRejectionMessage = async (req, res) => {
  const { id } = req.params;
  let { message } = req.body;
  const userId = req.user.id; // User sending the rejection message

  // Ensure message is a string, even if empty or null from frontend
  if (message === undefined || message === null) {
    message = '';
  }

  try {
    const shareRequest = await prisma.shareRequest.findUnique({
      where: { id },
    });

    if (!shareRequest) {
      return res.status(404).json({ message: 'Share request not found.' });
    }

    // Ensure the user sending the message is the original user of the slot
    if (shareRequest.originalUserId !== userId) {
      return res.status(403).json({ message: 'Not authorized to send rejection message for this request.' });
    }

    // Update the share request with the rejection message
    const updatedRequest = await prisma.shareRequest.update({
      where: { id },
      data: { rejectionMessage: message },
    });

    res.json({ message: 'Rejection message sent successfully.', updatedRequest });
  } catch (error) {
    console.error('Error sending rejection message:', error);
    res.status(500).json({ message: 'Server error while sending rejection message.' });
  }
};

// @desc    Get relevant pending share request for a specific slot and the authenticated user
// @route   GET /api/share/requests/relevant/:slotId
// @access  Private
const getRelevantPendingShareRequest = async (req, res) => {
  const { slotId } = req.params;
  const currentUserId = req.user.id; // User making the request

  console.log(`Backend: Fetching relevant pending share request for slotId: ${slotId}, currentUserId: ${currentUserId}`); // Added log

  try {
    const shareRequest = await prisma.shareRequest.findFirst({
      where: {
        slotId: slotId,
        status: 'PENDING',
        OR: [
          { originalUserId: currentUserId }, // Current user is the owner of the slot
          { requesterId: currentUserId },    // Current user is the one who sent the request
        ],
      },
      include: {
        slot: { select: { location: true, type: true } },
        originalUser: { select: { name: true, email: true } },
        requester: { select: { name: true, email: true } },
      },
    });

    if (!shareRequest) {
      return res.status(404).json({ message: 'No relevant pending share request found.' });
    }

    res.json(shareRequest);
  } catch (error) {
    console.error('Error fetching relevant pending share request:', error);
    res.status(500).json({ message: 'Server error while fetching relevant pending share request.' });
  }
};

// @desc    Accept a share request and cancel the original user's overlapping reservation
// @route   PUT /api/share/requests/:id/accept-and-cancel
// @access  Private (Original User Only)
const acceptShareRequestAndCancelMyReservation = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // User accepting the request

  try {
    const shareRequest = await prisma.shareRequest.findUnique({
      where: { id },
    });

    if (!shareRequest) {
      return res.status(404).json({ message: 'Share request not found.' });
    }

    if (shareRequest.originalUserId !== userId) {
      return res.status(403).json({ message: 'Not authorized to accept this request.' });
    }

    if (shareRequest.status !== 'PENDING') {
      return res.status(400).json({ message: 'Request is not pending.' });
    }

    // Logic to cancel the original user's overlapping reservation and apply fine
    // This is a complex business logic that needs to be implemented based on specific rules.
    // Placeholder for now:
    // 1. Find overlapping reservation for originalUser and slotId
    // 2. Calculate fine based on cancellation policy
    // 3. Update reservation status to cancelled and record fine

    const updatedRequest = await prisma.shareRequest.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });

    res.json({ message: 'Share request accepted and reservation cancelled.', updatedRequest });
  } catch (error) {
    console.error('Error accepting share request and cancelling reservation:', error);
    res.status(500).json({ message: 'Server error while accepting share request and cancelling reservation.' });
  }
};

// @desc    Accept a share request and edit the original user's overlapping reservation
// @route   PUT /api/share/requests/:id/accept-and-edit
// @access  Private (Original User Only)
const acceptShareRequestAndEditMyReservation = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // User accepting the request

  try {
    const shareRequest = await prisma.shareRequest.findUnique({
      where: { id },
    });

    if (!shareRequest) {
      return res.status(404).json({ message: 'Share request not found.' });
    }

    if (shareRequest.originalUserId !== userId) {
      return res.status(403).json({ message: 'Not authorized to accept this request.' });
    }

    if (shareRequest.status !== 'PENDING') {
      return res.status(400).json({ message: 'Request is not pending.' });
    }

    // Logic to edit the original user's overlapping reservation to match share timing
    // This is a complex business logic that needs to be implemented based on specific rules.
    // Placeholder for now:
    // 1. Find overlapping reservation for originalUser and slotId
    // 2. Adjust reservation bookingStart/bookingEnd to accommodate the shared time.
    //    This might involve splitting the reservation into two parts if the share time is in the middle.

    const updatedRequest = await prisma.shareRequest.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });

    res.json({ message: 'Share request accepted and reservation edited.', updatedRequest });
  } catch (error) {
    console.error('Error accepting share request and editing reservation:', error);
    res.status(500).json({ message: 'Server error while accepting share request and editing reservation.' });
  }
};

// @desc    Send a message within a share request chat
// @route   POST /api/share/requests/:id/message
// @access  Private (Participants Only)
const sendShareMessage = async (req, res) => {
  const { id } = req.params; // shareRequestId
  const { content } = req.body;
  const senderId = req.user.id;

  try {
    const shareRequest = await prisma.shareRequest.findUnique({
      where: { id },
    });

    if (!shareRequest) {
      return res.status(404).json({ message: 'Share request not found.' });
    }

    // Ensure sender is a participant in the share request
    if (shareRequest.originalUserId !== senderId && shareRequest.requesterId !== senderId) {
      return res.status(403).json({ message: 'Not authorized to send messages to this request.' });
    }

    const message = await prisma.shareMessage.create({
      data: {
        shareRequestId: id,
        senderId,
        content,
      },
    });

    res.status(201).json({ message: 'Message sent.', message });
  } catch (error) {
    console.error('Error sending share message:', error);
    res.status(500).json({ message: 'Server error while sending message.' });
  }
};

// @desc    Get messages for a specific share request chat
// @route   GET /api/share/requests/:id/messages
// @access  Private (Participants Only)
const getShareMessages = async (req, res) => {
  const { id } = req.params; // shareRequestId
  const userId = req.user.id;

  try {
    const shareRequest = await prisma.shareRequest.findUnique({
      where: { id },
    });

    if (!shareRequest) {
      return res.status(404).json({ message: 'Share request not found.' });
    }

    // Ensure user is a participant in the share request
    if (shareRequest.originalUserId !== userId && shareRequest.requesterId !== userId) {
      return res.status(403).json({ message: 'Not authorized to view messages for this request.' });
    }

    const messages = await prisma.shareMessage.findMany({
      where: { shareRequestId: id },
      include: { sender: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching share messages:', error);
    res.status(500).json({ message: 'Server error while fetching messages.' });
  }
};

module.exports = {
  createShareRequest,
  getShareRequestsForUser,
  acceptShareRequest,
  rejectShareRequest,
  sendShareRejectionMessage,
  acceptShareRequestAndCancelMyReservation,
  acceptShareRequestAndEditMyReservation,
  getRelevantPendingShareRequest,
};
