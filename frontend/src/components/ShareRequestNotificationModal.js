import React, { useState } from 'react';
import { format } from 'date-fns';
import { acceptShareRequest, rejectShareRequest } from '../services/api'; // Assuming these exist

const ShareRequestNotificationModal = ({ request, onClose, onUpdateRequests }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState('');
  const [showAcceptOptions, setShowAcceptOptions] = useState(false);

  const handleAcceptClick = () => {
    setShowAcceptOptions(true);
  };

  const handleRejectClick = () => {
    setShowRejectConfirmation(true);
  };

  const handleAcceptAndCancelMyReservation = async () => {
    setLoading(true);
    setError('');
    try {
      // Call backend API to accept and cancel user's reservation
      // This API call needs to be implemented in the backend
      // await acceptShareRequestAndCancelMyReservation(request.id);
      await acceptShareRequest(request.id); // For now, just accept
      onUpdateRequests();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept and cancel reservation.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAndEditMyReservation = async () => {
    setLoading(true);
    setError('');
    try {
      // Call backend API to accept and edit user's reservation
      // This API call needs to be implemented in the backend
      // await acceptShareRequestAndEditMyReservation(request.id);
      await acceptShareRequest(request.id); // For now, just accept
      onUpdateRequests();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept and edit reservation.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    setLoading(true);
    setError('');
    try {
      await rejectShareRequest(request.id, { message: rejectionMessage }); // Send message with rejection
      onUpdateRequests(); // Notify parent to refresh requests
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="slot-modal-overlay" onClick={onClose}>
      {request ? (
        <div className="slot-modal-card" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onClose}
            className="slot-modal-close"
            aria-label="Close modal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="slot-modal-content">
            <div className="slot-modal-header">
              <h2 className="slot-modal-title">Share Request Received!</h2>
              <p className="slot-modal-subtitle">A user wants to share a slot with you.</p>
            </div>

            {error && (
              <p className="text-danger" style={{ marginBottom: '1rem' }}>{error}</p>
            )}

            {!showRejectConfirmation && !showAcceptOptions ? (
              <>
                <div className="form-group">
                  <p className="slot-modal-label">
                    From: <span className="font-semibold">{request.requester?.name || 'Unknown User'}</span>
                  </p>
                  <p className="slot-modal-label">
                    For Slot: <span className="font-semibold">{request.slot?.location || 'N/A'}</span> ({request.slot?.type ? request.slot.type.charAt(0).toUpperCase() + request.slot.type.slice(1) : 'N/A'})
                  </p>
                  <p className="slot-modal-label">
                    Requested Time: <span className="font-semibold">
                      {format(new Date(request.requestedStartTime), 'MMM dd, yyyy hh:mm a')} -{' '}
                      {format(new Date(request.requestedEndTime), 'hh:mm a')}
                    </span>
                  </p>
                  <p className="slot-modal-label">
                    Message: <span className="font-semibold">{request.initialMessage || 'No message provided.'}</span>
                  </p>
                </div>

                <div className="slot-modal-actions">
                  <div className="action-buttons-group">
                    <button
                      onClick={handleAcceptClick}
                      className="slot-modal-btn success"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Accept'}
                    </button>
                    <button
                      onClick={handleRejectClick}
                      className="slot-modal-btn danger"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </>
            ) : showRejectConfirmation ? (
              <>
                <div className="form-group">
                  <label htmlFor="rejectionMessage" className="slot-modal-label">Reason for Rejection (Optional):</label>
                  <textarea
                    id="rejectionMessage"
                    rows="3"
                    className="slot-modal-input"
                    value={rejectionMessage}
                    onChange={(e) => setRejectionMessage(e.target.value)}
                    placeholder="e.g., Not available at that time, slot already in use."
                  ></textarea>
                </div>
                <div className="slot-modal-actions">
                  <div className="action-buttons-group">
                    <button
                      onClick={handleConfirmReject}
                      className="slot-modal-btn danger"
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Confirm Reject'}
                    </button>
                    <button
                      onClick={() => setShowRejectConfirmation(false)}
                      className="slot-modal-btn disabled"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // showAcceptOptions is true
              <>
                <div className="form-group">
                  <p className="slot-modal-label">How would you like to proceed?</p>
                </div>
                <div className="slot-modal-actions">
                  <div className="action-buttons-group">
                    <button
                      onClick={handleAcceptAndCancelMyReservation}
                      className="slot-modal-btn primary"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Cancel My Reservation & Accept'}
                    </button>
                    <button
                      onClick={handleAcceptAndEditMyReservation}
                      className="slot-modal-btn primary"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Edit My Reservation & Accept'}
                    </button>
                    <button
                      onClick={() => setShowAcceptOptions(false)}
                      className="slot-modal-btn disabled"
                      disabled={loading}
                    >
                      Back
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <p>Loading share request details...</p>
      )}
    </div>
  );
};

export default ShareRequestNotificationModal;