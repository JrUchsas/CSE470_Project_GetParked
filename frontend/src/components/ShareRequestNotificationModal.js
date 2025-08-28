import React, { useState } from 'react';
import { format } from 'date-fns';
import { acceptShareRequest, rejectShareRequest } from '../services/api';

const ShareRequestNotificationModal = ({ request, onClose, onUpdateRequests }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    setLoading(true);
    setError('');
    try {
      await acceptShareRequest(request.id);
      onUpdateRequests(); // Notify parent to refresh requests
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept request.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError('');
    try {
      await rejectShareRequest(request.id);
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
                onClick={handleAccept}
                className="slot-modal-btn success"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Accept'}
              </button>
              <button
                onClick={handleReject}
                className="slot-modal-btn danger"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareRequestNotificationModal;
