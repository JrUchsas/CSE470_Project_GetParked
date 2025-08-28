import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReservationHistoryByUser, leaveFeedback } from '../services/api';
import FeedbackModal from '../components/FeedbackModal';
import '../styles/custom-styles.css';

const ReservationHistoryPage = () => {
  const navigate = useNavigate();
  const [reservationHistory, setReservationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);

  const handlePayment = (historyId) => {
    navigate(`/payment/${historyId}`);
  };

  const handleFeedbackClick = (history) => {
    setSelectedHistory(history);
    setIsFeedbackModalOpen(true);
  };

  const handleFeedbackClose = () => {
    setIsFeedbackModalOpen(false);
    setSelectedHistory(null);
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    await leaveFeedback(feedbackData);
    // Refresh the history to show that feedback has been submitted
    const fetchReservationHistory = async () => {
      if (!user || !user.id) {
        return;
      }
      setLoading(true);
      setError('');
      try {
        const history = await getReservationHistoryByUser(user.id);
        setReservationHistory(history || []);
      } catch (err) {
        setError(`Failed to load reservation history: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchReservationHistory();
  };

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
    } else {
    }
  }, []);

  useEffect(() => {
    const fetchReservationHistory = async () => {
      if (!user || !user.id) {
        return;
      }

      setLoading(true);
      setError('');
      try {
        const history = await getReservationHistoryByUser(user.id);
        setReservationHistory(history || []);
      } catch (err) {
        setError(`Failed to load reservation history: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchReservationHistory();
  }, [user]);

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="modern-homepage-container">
        <div className="loading-container">
          <div className="loading-spinner-modern"></div>
          <span className="loading-text">Loading reservation history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-homepage-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Error loading history</h3>
          <p className="error-message">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-homepage-container">
      {/* Header Section */}
      <div className="homepage-header">
        <div className="header-content">
          <h1 className="homepage-title">
            <span className="title-icon">📋</span>
            Reservation History
          </h1>
          <p className="homepage-subtitle">
            View your completed parking sessions and transaction history
          </p>
        </div>
      </div>

      {reservationHistory.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3 className="empty-state-title">No reservation history found</h3>
          <p className="empty-state-description">
            Your completed parking sessions will appear here.
          </p>
        </div>
      ) : (
        <div className="history-cards-container">
          {reservationHistory.map((history) => (
            <div key={history.id} className="history-card">
              <div className="history-card-header">
                <div className="history-location">
                  <span className="location-icon">P</span>
                  <div>
                    <h3 className="history-title">{history.slotLocation}</h3>
                    <p className="history-subtitle">
                      Completed on {formatDateTime(history.checkOutTime)}
                    </p>
                  </div>
                </div>
                <div className="history-status">
                  <span className="status-badge completed">
                    Completed
                  </span>
                  {history.paymentStatus === "Paid" ? (
                    <span className="status-badge paid">
                      Paid
                    </span>
                  ) : (
                    <span className="status-badge not-paid">
                      Not Paid
                    </span>
                  )}
                </div>
              </div>

              <div className="history-card-content">
                <div className="vehicle-section">
                  <h4 className="section-subtitle">
                    <span className="vehicle-icon">🚗</span>
                    Vehicle Details
                  </h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">License Plate</span>
                      <span className="detail-value">{history.vehiclePlate}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Model</span>
                      <span className="detail-value">{history.vehicleModel}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Type</span>
                      <span className="detail-value capitalize">{history.vehicleType}</span>
                    </div>
                  </div>
                </div>

                <div className="timing-section">
                  <h4 className="section-subtitle">
                    <span className="timing-icon">⏰</span>
                    Timing Details
                  </h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Reserved</span>
                      <span className="detail-value text-xs">
                        {formatDateTime(history.reservedStart)} - {formatDateTime(history.reservedEnd)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Check-in</span>
                      <span className="detail-value">{formatDateTime(history.checkInTime)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Check-out</span>
                      <span className="detail-value">{formatDateTime(history.checkOutTime)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Duration</span>
                      <span className="detail-value">{formatDuration(history.duration)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {history.violationType && (
                <div className="violation-section bg-red-50 border-l-4 border-red-500 p-4 my-4 rounded">
                  <h4 className="section-subtitle text-red-800 font-bold flex items-center">
                    <span className="mr-2">⚠️</span>
                    Violation Reported
                  </h4>
                  <div className="detail-grid mt-2">
                    <div className="detail-item">
                      <span className="detail-label text-red-700">Type</span>
                      <span className="detail-value font-semibold">{history.violationType}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label text-red-700">Penalty Fee</span>
                      <span className="detail-value font-semibold">${history.penaltyFee}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="history-card-footer flex justify-end space-x-2">
                {history.paymentStatus !== "Paid" && history.fee ? (
                  <button
                    className="pay-now-button"
                    onClick={() => handlePayment(history.id)}
                  >
                    Pay Now
                  </button>
                ) : (
                  <>
                    {history.paymentStatus === 'Paid' && !history.feedback && (
                      <button
                        className="leave-feedback-button"
                        onClick={() => handleFeedbackClick(history)}
                      >
                        Leave Feedback
                      </button>
                    )}
                    {history.paymentStatus === 'Paid' && (
                      <button
                        className="download-invoice-button"
                        onClick={() => alert(`Downloading invoice for ${history.id}`)} // Placeholder
                      >
                        Download Invoice
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isFeedbackModalOpen && selectedHistory && (
        <FeedbackModal 
          reservation={selectedHistory}
          onClose={handleFeedbackClose}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
};

export default ReservationHistoryPage;