import React, { useState, useEffect, useCallback } from 'react';
import { getSlots, checkOutBySlot } from '../services/api';
import CheckOutModal from '../components/CheckOutModal';
import { getVehicleIcon } from '../components/VehicleIcons';
import '../custom-styles.css';

const EntryExitPage = () => {

  const [slots, setSlots] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedOccupiedSlot, setSelectedOccupiedSlot] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!user || !user.id) return;

    setLoading(true);
    setError('');
    try {
      const slotsResponse = await getSlots();
      setSlots(slotsResponse || []);
    } catch (err) {
      setError('Failed to load data.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      fetchData();
    }
  }, [user, fetchData]);



  const handleCheckOut = async (slot) => {
    // Simply set the slot for checkout - we'll get the parking session during confirmation
    setSelectedOccupiedSlot(slot);
  };

  const confirmCheckOut = async () => {
    if (!selectedOccupiedSlot) return;

    try {
      console.log('Checking out slot:', selectedOccupiedSlot.id);
      // Use the simpler checkout by slot method
      await checkOutBySlot(selectedOccupiedSlot.id);
      alert('Checked out successfully!');
      setSelectedOccupiedSlot(null);
      fetchData(); // Refresh data after check-out
    } catch (err) {
      console.error('Error during check-out:', err);
      console.error('Error response:', err.response?.data);
      setError(`Failed to check-out: ${err.response?.data?.error || err.message}`);
    }
  };

  const occupiedSlotsByUser = slots.filter(slot => slot.status === 'Occupied' && slot.reservedBy === user?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-4" style={{ width: '3rem', height: '3rem' }}></div>
              <p className="text-gray-600 text-lg">Loading your parking sessions...</p>
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
              <p className="text-red-600 text-lg font-medium">Error loading data</p>
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Entry & Exit
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Manage your active parking sessions and check out when you're ready to leave
          </p>
        </div>

        {/* Info Card */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                To check in to a parking slot, you must first reserve it from the main parking page.
                Only reserved slots can be checked into, and check-in is only allowed during your reservation time window.
              </p>
            </div>
          </div>
        </div>

        {/* Occupied Slots Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Active Parking Sessions</h2>
            </div>
          </div>

          <div className="p-6">
            {occupiedSlotsByUser.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Sessions</h3>
                <p className="text-gray-600 mb-4">You don't have any active parking sessions at the moment.</p>
                <p className="text-sm text-gray-500">Reserve a slot from the main page to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {occupiedSlotsByUser.map(slot => (
                  <div key={slot.id} className="modern-slot-card group hover:shadow-xl transition-all duration-300 border-l-4 border-l-red-500">
                    <div className="slot-card-header">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="slot-icon-container bg-gradient-to-br from-red-500 to-pink-500">
                            <span className="parking-p-icon text-white">P</span>
                          </div>
                          <div>
                            <h3 className="slot-title">{slot.location}</h3>
                            <p className="slot-subtitle">Currently Occupied</p>
                          </div>
                        </div>
                        <div className="slot-status-badge occupied">
                          <div className="status-dot"></div>
                          Occupied
                        </div>
                      </div>
                    </div>

                    <div className="slot-card-content">
                      {slot.vehicle && (
                        <div className="vehicle-info">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="vehicle-icon">
                              {getVehicleIcon(slot.vehicle.type)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{slot.vehicle.licensePlate}</h4>
                              <p className="text-sm text-gray-600">{slot.vehicle.model}</p>
                            </div>
                          </div>

                          <div className="vehicle-details">
                            <div className="detail-item">
                              <span className="detail-label">Vehicle Type</span>
                              <span className="detail-value capitalize">{slot.vehicle.type}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Color</span>
                              <span className="detail-value">{slot.vehicle.color}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {slot.bookingStart && slot.bookingEnd && (
                        <div className="timing-info">
                          <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Reservation Time
                          </h5>
                          <div className="timing-details">
                            <div className="detail-item">
                              <span className="detail-label">From</span>
                              <span className="detail-value">
                                {new Date(slot.bookingStart).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Until</span>
                              <span className="detail-value">
                                {new Date(slot.bookingEnd).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="slot-card-footer">
                      <button
                        onClick={() => handleCheckOut(slot)}
                        className="checkout-button group"
                      >
                        <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        Check Out
                        <span className="arrow">→</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedOccupiedSlot && (
          <CheckOutModal
            slot={selectedOccupiedSlot}
            onClose={() => setSelectedOccupiedSlot(null)}
            onCheckOut={confirmCheckOut}
          />
        )}
      </div>
    </div>
  );
};

export default EntryExitPage;