import React, { useState, useEffect } from 'react';
import { getReservationHistoryByUser } from '../services/api';
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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Reservation History</h1>

      {reservationHistory.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg">No reservation history found.</p>
          <p className="text-gray-500 text-sm mt-2">
            Your completed parking sessions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservationHistory.map((history) => (
            <div key={history.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{history.slotLocation}</h3>
                  <p className="text-sm text-gray-500">
                    Completed on {formatDateTime(history.checkOutTime)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                    Completed
                  </span>
                  {history.fee && (
                    <p className="text-lg font-bold text-green-600 mt-1">${history.fee}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">Vehicle Details</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">License Plate:</span>
                      <span className="font-medium">{history.vehiclePlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium">{history.vehicleModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{history.vehicleType}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">Timing Details</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reserved:</span>
                      <span className="font-medium text-xs">
                        {formatDateTime(history.reservedStart)} - {formatDateTime(history.reservedEnd)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium">{formatDateTime(history.checkInTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium">{formatDateTime(history.checkOutTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{formatDuration(history.duration)}</span>
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
