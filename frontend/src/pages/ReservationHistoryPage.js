import { useState, useEffect } from 'react';
import { getReservationHistoryByUser } from '../services/api';
import '../custom-styles.css';

const ReservationHistoryPage = () => {
  const [reservationHistory, setReservationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState({});

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    console.log('Raw user data from localStorage:', loggedInUser);
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      console.log('Parsed user data:', foundUser);
      setUser(foundUser);
    } else {
      console.log('No user found in localStorage');
    }
  }, []);

  useEffect(() => {
    const fetchReservationHistory = async () => {
      if (!user || !user.id) {
        console.log('No user found, skipping history fetch');
        return;
      }

      console.log('Fetching reservation history for user:', user.id);
      setLoading(true);
      setError('');
      try {
        const history = await getReservationHistoryByUser(user.id);
        console.log('Received history data:', history);
        setReservationHistory(history || []);
      } catch (err) {
        console.error('Error fetching reservation history:', err);
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
                  {history.fee && (
                    <p className="history-fee">${history.fee}</p>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationHistoryPage;
