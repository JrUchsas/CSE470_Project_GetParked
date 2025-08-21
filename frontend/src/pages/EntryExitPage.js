import React, { useState, useEffect, useCallback } from 'react';
import { getSlots, checkOutBySlot } from '../services/api';
import CheckOutModal from '../components/CheckOutModal';
import { getVehicleIcon } from '../components/VehicleIcons';
import '../styles/custom-styles.css';

const formatVehicleType = (type) => {
  let formattedType = type;
  switch (type) {
    case 'car':
      formattedType = 'Car';
      break;
    case 'bike':
      formattedType = 'Bike';
      break;
    case 'suv':
      formattedType = 'SUV';
      break;
    case 'van':
      formattedType = 'Van';
      break;
    case 'minibus':
      formattedType = 'Minibus';
      break;
    default:
      formattedType = type.charAt(0).toUpperCase() + type.slice(1);
  }
  return formattedType;
};

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
      <div className="modern-homepage-container">
        <div className="loading-container">
          <div className="loading-spinner-modern"></div>
          <span className="loading-text">Loading your parking sessions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-homepage-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Error loading data</h3>
          <p className="error-message">{error}</p>
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
            <span className="title-icon">🚪</span>
            Entry & Exit
          </h1>
          <p className="homepage-subtitle">
            Manage your active parking sessions and check out when you're ready to leave
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="stat-card info-card">
        <div className="stat-icon">ℹ️</div>
        <div className="stat-content">
          <div className="stat-label">How it works</div>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            To check in to a parking slot, you must first reserve it from the main parking page.
            Only reserved slots can be checked into, and check-in is only allowed during your reservation time window.
          </p>
        </div>
      </div>

      {/* Active Sessions Section */}
      <div className="slots-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">🔴</span>
            Active Parking Sessions
          </h2>
          <div className="section-badge">{occupiedSlotsByUser.length} sessions</div>
        </div>

        {occupiedSlotsByUser.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚗</div>
            <h3 className="empty-state-title">No Active Sessions</h3>
            <p className="empty-state-description">
              You don't have any active parking sessions at the moment.
            </p>
            <p className="empty-state-hint">
              Reserve a slot from the main page to get started!
            </p>
          </div>
        ) : (
          <div className="horizontal-slot-grid">
            {occupiedSlotsByUser.map(slot => (
              <div key={slot.id} className="horizontal-slot-card occupied-slot">
                <div className="horizontal-slot-header">
                  <div className="slot-location-horizontal">
                    <span className="location-icon">P</span>
                    <span className="location-text">{slot.location}</span>
                  </div>
                  <div className="slot-status-indicator occupied-enhanced">
                    <span className="status-dot-enhanced"></span>
                    <span className="status-text">Occupied</span>
                  </div>
                  <button
                    onClick={() => handleCheckOut(slot)}
                    className="compact-checkout-button"
                    title="Check Out"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    <span className="checkout-text">Check Out</span>
                    <span className="checkout-arrow">→</span>
                  </button>
                </div>

                <div className="horizontal-slot-content">
                  {slot.vehicle && (
                    <div className="horizontal-vehicle-section">
                      <h4 className="horizontal-section-subtitle">
                        <span className="vehicle-icon">{getVehicleIcon(slot.vehicle.type, "text-lg")}</span>
                        Vehicle Information
                      </h4>
                      <div className="horizontal-detail-grid">
                        <div className="horizontal-detail-item">
                          <span className="detail-label">License Plate:</span>
                          <span className="detail-value">{slot.vehicle.licensePlate}</span>
                        </div>
                        <div className="horizontal-detail-item">
                          <span className="detail-label">Model:</span>
                          <span className="detail-value">{slot.vehicle.model}</span>
                        </div>
                        <div className="horizontal-detail-item">
                          <span className="detail-label">Type:</span>
                          <span className="detail-value">{formatVehicleType(slot.vehicle.type)}</span>
                        </div>
                        {slot.vehicle.color && (
                          <div className="horizontal-detail-item">
                            <span className="detail-label">Color:</span>
                            <span className="detail-value">{slot.vehicle.color}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {slot.bookingStart && slot.bookingEnd && (
                    <div className="horizontal-timing-section">
                      <h4 className="horizontal-section-subtitle">
                        <span className="timing-icon">⏰</span>
                        Reservation Time
                      </h4>
                      <div className="horizontal-detail-grid">
                        <div className="horizontal-detail-item">
                          <span className="detail-label">From:</span>
                          <span className="detail-value">
                            {new Date(slot.bookingStart).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="horizontal-detail-item">
                          <span className="detail-label">Until:</span>
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

              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOccupiedSlot && (
        <CheckOutModal
          slot={selectedOccupiedSlot}
          onClose={() => setSelectedOccupiedSlot(null)}
          onCheckOut={confirmCheckOut}
        />
      )}
    </div>
  );
};

export default EntryExitPage;