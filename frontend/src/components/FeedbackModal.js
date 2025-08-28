import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const Star = ({ filled, onClick }) => (
  <svg
    onClick={onClick}
    className={`star-icon ${filled ? 'star-filled' : 'star-empty'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
    width="32"
    height="32"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const FeedbackModal = ({ reservation, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit({ 
        rating, 
        comment, 
        reservationHistoryId: reservation.id 
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="slot-modal-overlay" onClick={onClose}>
      <div className="slot-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="slot-modal-content">
          <div className="slot-modal-header">
            <div className="slot-modal-icon-wrapper">
              {/* Generic Feedback Icon */}
              <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="slot-location-container">
              <h3 className="slot-modal-title">Leave Feedback</h3>
            </div>
            <p className="slot-modal-subtitle">
              For your parking at <span className="font-semibold">{reservation.slotLocation}</span> on {new Date(reservation.checkOutTime).toLocaleDateString()}
            </p>
          </div>
        
        <form onSubmit={handleSubmit} className="slot-modal-form">
          <div className="form-group">
            <label className="slot-modal-label">Your Rating</label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  filled={star <= rating} 
                  onClick={() => setRating(star)} 
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="comment" className="slot-modal-label">Comments (Optional)</label>
            <textarea
              id="comment"
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              className="slot-modal-input"
            />
          </div>

          {error && <p className="text-danger text-center mb-4">{error}</p>}

          <div className="slot-modal-actions">
            <div className="action-buttons-group">
              <button
                type="button"
                onClick={onClose}
                className="modal-cancel-button"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="modal-submit-button"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </form>
      </div> {/* Close slot-modal-content */}
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
      </div>
    </div>
  );
}; // Closing brace for FeedbackModal component

export default FeedbackModal;
