import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReservationHistoryById, updatePaymentStatus } from '../services/api';
import '../styles/custom-styles.css'; // For general styles
import '../styles/custom-payment.css'; // For specific payment page styles

const PaymentPage = () => {
  const { id } = useParams(); // Get reservation history ID from URL
  const navigate = useNavigate();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getReservationHistoryById(id);
        setHistory(data);
        setError('');
        console.log('Frontend: History data received:', data);
        console.log('Frontend: History fee received:', data?.fee);
      } catch (err) {
        console.error('Error fetching reservation history for payment:', err);
        setError('Failed to load payment details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  const handlePayNow = async () => {
    if (!history) return;
    setPaymentProcessing(true);
    try {
      // Simulate payment success without actual gateway integration
      await updatePaymentStatus(history.id, 'Paid'); // Update status in backend
      alert('Payment successful! Redirecting to reservation history.');
      navigate('/reservation-history'); // Redirect back to history page
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

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
          <span className="loading-text">Loading payment details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-homepage-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Error</h3>
          <p className="error-message">{error}</p>
          <button onClick={() => navigate('/reservation-history')} className="retry-button">
            Back to History
          </button>
        </div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="modern-homepage-container">
        <div className="empty-state">
          <div className="empty-state-icon">🤷‍♂️</div>
          <h3 className="empty-state-title">No Payment Details Found</h3>
          <p className="empty-state-description">The reservation history for this payment could not be loaded.</p>
          <button onClick={() => navigate('/reservation-history')} className="retry-button">
            Back to History
          </button>
        </div>
      </div>
    );
  }

  // Calculate fee breakdown for display
  const onlineReservationFee = 20;
  const totalAmountDue = history.fee || 0;

  // Calculate parking fee properly - ensure it's never negative
  const parkingFeeDisplay = Math.max(0, totalAmountDue - onlineReservationFee);

  // Recalculate the fee if it seems incorrect (for debugging/validation)
  const hourlyRate = history.vehicleType.toLowerCase() === 'car' || history.vehicleType.toLowerCase() === 'suv' ? 120 :
                     history.vehicleType.toLowerCase() === 'van' || history.vehicleType.toLowerCase() === 'minibus' ? 140 :
                     history.vehicleType.toLowerCase() === 'bike' ? 100 : 0;

  const durationMinutes = history.duration || 0;
  const ratePerMinute = hourlyRate / 60;
  const calculatedParkingFee = Math.ceil(ratePerMinute * durationMinutes);
  const calculatedTotalFee = calculatedParkingFee + onlineReservationFee;

  console.log('Frontend: totalAmountDue (history.fee):', totalAmountDue);
  console.log('Frontend: parkingFeeDisplay:', parkingFeeDisplay);
  console.log('Frontend: calculatedTotalFee:', calculatedTotalFee);
  console.log('Frontend: duration in minutes:', durationMinutes);
  console.log('Frontend: hourlyRate:', hourlyRate);


  return (
    <div className="modern-homepage-container">
      <div className="payment-invoice-card">
        <div className="invoice-header">
          <h1 className="invoice-title">Payment Invoice</h1>
          <p className="invoice-date">Date: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="invoice-section">
          <h2 className="section-title">User Details</h2>
          <div className="detail-row">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{history.user?.name || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{history.user?.email || 'N/A'}</span>
          </div>
        </div>

        <div className="invoice-section">
          <h2 className="section-title">Vehicle Details</h2>
          <div className="detail-row">
            <span className="detail-label">License Plate:</span>
            <span className="detail-value">{history.vehiclePlate}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Model:</span>
            <span className="detail-value">{history.vehicleModel}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Type:</span>
            <span className="detail-value capitalize">{history.vehicleType}</span>
          </div>
        </div>

        <div className="invoice-section">
          <h2 className="section-title">Parking Details</h2>
          <div className="detail-row">
            <span className="detail-label">Slot Location:</span>
            <span className="detail-value">{history.slotLocation}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Check-in Time:</span>
            <span className="detail-value">{formatDateTime(history.checkInTime)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Check-out Time:</span>
            <span className="detail-value">{formatDateTime(history.checkOutTime)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Duration:</span>
            <span className="detail-value">{formatDuration(history.duration)}</span>
          </div>
        </div>

        <div className="invoice-section">
          <h2 className="section-title">Payment Summary</h2>
          <div className="detail-row">
            <span className="detail-label">Parking Fee:</span>
            <span className="detail-value">{parkingFeeDisplay} Taka</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Online Reservation Fee:</span>
            <span className="detail-value">{onlineReservationFee} Taka</span>
          </div>
          <div className="detail-row total-row">
            <span className="detail-label">Total Amount Due:</span>
            <span className="detail-value">{totalAmountDue} Taka</span>
          </div>
        </div>

        <div className="invoice-footer">
          {history.paymentStatus === 'Paid' ? (
            <p className="payment-status-paid">Payment Already Processed</p>
          ) : (
            <button
              onClick={handlePayNow}
              className="pay-now-button"
              disabled={paymentProcessing}
            >
              {paymentProcessing ? 'Processing Payment...' : `Pay ${totalAmountDue} Taka Now`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;