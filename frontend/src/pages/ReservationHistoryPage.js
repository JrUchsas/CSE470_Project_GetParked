import React, { useState, useEffect } from 'react';
import { getReservationHistoryByUser } from '../services/api';
import { getVehicleIcon } from '../components/VehicleIcons';
import '../custom-styles.css';

const ReservationHistoryPage = () => {
  const [reservationHistory, setReservationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
    }
  }, []);

  useEffect(() => {
    const fetchReservationHistory = async () => {
      if (!user || !user.id) return;

      setLoading(true);
      setError('');
      try {
        const history = await getReservationHistoryByUser(user.id);
        setReservationHistory(history || []);
      } catch (err) {
        setError('Failed to load reservation history.');
        console.error('Error fetching reservation history:', err);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-4" style={{ width: '3rem', height: '3rem' }}></div>
              <p className="text-gray-600 text-lg">Loading your reservation history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <p className="text-red-600 text-lg font-medium">Error loading history</p>
              <p className="text-gray-600 mt-2">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Modern Header */}
        <div className="homepage-header text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Parking History
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            View your completed parking sessions and track your parking activity
          </p>
        </div>

        {reservationHistory.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No History Yet</h3>
            <p className="text-gray-600 text-lg mb-2">You haven't completed any parking sessions.</p>
            <p className="text-gray-500">
              Your completed parking sessions will appear here after you check out.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reservationHistory.map((history) => (
              <div key={history.id} className="history-card group">
                <div className="history-card-header">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="slot-icon-container bg-gradient-to-br from-green-500 to-emerald-500">
                        <span className="parking-p-icon text-white">P</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{history.slotLocation}</h3>
                        <p className="text-sm text-gray-600">
                          Completed on {formatDateTime(history.checkOutTime)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">Completed</span>
                      </div>
                      {history.fee && (
                        <div className="fee-badge">
                          <span className="fee-amount">${history.fee}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="history-card-content">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="vehicle-section">
                      <div className="section-header">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="vehicle-icon">
                            {getVehicleIcon(history.vehicleType)}
                          </div>
                          <h4 className="section-title">Vehicle Details</h4>
                        </div>
                      </div>
                      <div className="vehicle-details">
                        <div className="detail-item">
                          <span className="detail-label">License Plate</span>
                          <span className="detail-value font-mono">{history.vehiclePlate}</span>
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
                      <div className="section-header">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="timing-icon">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </div>
                          <h4 className="section-title">Session Timeline</h4>
                        </div>
                      </div>
                      <div className="timing-details">
                        <div className="detail-item">
                          <span className="detail-label">Reserved Period</span>
                          <div className="detail-value text-xs">
                            <div>{formatDateTime(history.reservedStart)}</div>
                            <div className="text-gray-500">to {formatDateTime(history.reservedEnd)}</div>
                          </div>
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
                          <span className="detail-label">Total Duration</span>
                          <span className="detail-value font-semibold text-blue-600">{formatDuration(history.duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationHistoryPage;
