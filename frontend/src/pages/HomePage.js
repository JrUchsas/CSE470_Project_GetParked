import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSlots, updateSlot, checkIn } from '../services/api';
import SlotModal from '../components/SlotModal';
import CheckInConfirmationModal from '../components/CheckInConfirmationModal';
import ErrorModal from '../components/ErrorModal';
import { getVehicleIcon, formatVehicleType } from '../components/VehicleIcons';


const HomePage = ({ user }) => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [checkInSlot, setCheckInSlot] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoading(true);
        const data = await getSlots();
        setSlots(data);
        setError('');
      } catch (err) {
        setError('Failed to fetch parking slots. Is the backend server running?');
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, []);

  // Only show available slots
  const availableSlots = slots.filter((slot) => slot.status === 'Available');
  const reservedSlots = slots.filter((slot) => slot.status === 'Reserved');

  // Reserve a slot
  const handleReserve = async (slot, bookingStart, bookingEnd, selectedVehicleId) => {
    if (!user) return;
    setActionLoading(true);
    try {
      const updated = await updateSlot(slot.id, {
        status: 'Reserved',
        reservedBy: user.id,
        bookingStart: bookingStart ? new Date(bookingStart).toISOString() : null,
        bookingEnd: bookingEnd ? new Date(bookingEnd).toISOString() : null,
        vehicleId: selectedVehicleId,
      });
      setSlots((prev) => prev.map((s) => (s.id === slot.id ? updated : s)));
      setSelectedSlot(null);
    } catch (err) {
      alert('Failed to reserve slot.');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel reservation
  const handleCancel = async (slot) => {
    if (!user) return;
    setActionLoading(true);
    try {
      const updated = await updateSlot(slot.id, {
        status: 'Available',
        reservedBy: null,
        bookingStart: null,
        bookingEnd: null
      });
      setSlots((prev) => prev.map((s) => (s.id === slot.id ? updated : s)));
      setSelectedSlot(null);
    } catch (err) {
      alert('Failed to cancel reservation.');
    } finally {
      setActionLoading(false);
    }
  };

  // Check In - Show confirmation modal
  const handleCheckIn = (slot) => {
    if (!user) return;
    setCheckInSlot(slot);
    setSelectedSlot(null); // Close the slot modal
  };

  // Confirm Check In - Actually perform the check-in
  const handleConfirmCheckIn = async (slot) => {
    if (!user) return;
    setActionLoading(true);
    try {

      // Call the check-in API with the vehicle from the slot reservation
      const checkInResult = await checkIn({ vehicleId: slot.vehicleId, slotId: slot.id });

      // Refresh the slots data to get the updated status
      const updatedSlots = await getSlots();
      setSlots(updatedSlots);
      setCheckInSlot(null);

      alert('Checked in successfully!');
      // Navigate to entry/exit page to show the occupied slot
      navigate('/entry-exit');
    } catch (err) {
      setError(`Failed to check in: ${err.response?.data?.error || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate statistics
  const availableCount = slots.filter(slot => slot.status === 'Available').length;
  const reservedCount = slots.filter(slot => slot.status === 'Reserved').length;
  const occupiedCount = slots.filter(slot => slot.status === 'Occupied').length;
  const totalSlots = slots.length;

  // Scroll to section function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="modern-homepage-container">
      {/* Header Section */}
      <div className="homepage-header">
        <div className="header-content">
          <h1 className="homepage-title">
            GetParked Dashboard
          </h1>
          <p className="homepage-subtitle">
            Welcome back, {user?.name}! Find and manage your parking spots.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card available clickable" onClick={() => scrollToSection('available-slots')}>
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <div className="stat-number">{availableCount}</div>
            <div className="stat-label">Available</div>
          </div>
        </div>
        <div className="stat-card reserved clickable" onClick={() => scrollToSection('reserved-slots')}>
          <div className="stat-icon">🟡</div>
          <div className="stat-content">
            <div className="stat-number">{reservedCount}</div>
            <div className="stat-label">Reserved</div>
          </div>
        </div>
        <div className="stat-card occupied clickable" onClick={() => scrollToSection('occupied-slots')}>
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <div className="stat-number">{occupiedCount}</div>
            <div className="stat-label">Occupied</div>
          </div>
        </div>
        <div className="stat-card total clickable" onClick={() => scrollToSection('available-slots')}>
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{totalSlots}</div>
            <div className="stat-label">Total Slots</div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner-modern"></div>
          <span className="loading-text">Loading parking slots...</span>
        </div>
      )}

      {error && (
        <ErrorModal
          errorMessage={error}
          onClose={() => setError('')}
        />
      )}

      {/* Available Slots Section */}
      {!loading && availableSlots.length > 0 && (
        <div id="available-slots" className="slots-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">🟢</span>
              Available Parking Slots
            </h2>
            <div className="section-badge">{availableSlots.length} slots</div>
          </div>
          <div className="modern-slot-grid">
            {availableSlots.map((slot) => (
              <div
                key={slot.id}
                className="modern-slot-card available-slot"
                onClick={() => setSelectedSlot(slot)}
              >
                <div className="slot-card-header">
                  <div className="slot-location">
                    <span className="location-icon">P</span>
                    {slot.location}
                  </div>
                  <div className="slot-status-indicator available">
                    <span className="status-dot"></span>
                    Available
                  </div>
                </div>
                <div className="slot-card-body">
                  <div className="slot-type">
                    <span className="type-icon">
                      {getVehicleIcon(slot.type || 'car', 'slot-card-icon')}
                    </span>
                    {formatVehicleType(slot.type || 'car')}
                  </div>

                </div>
                <div className="slot-card-footer">
                  <div className="reserve-button">
                    <span>Reserve Now</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && availableSlots.length === 0 && (
        <div id="available-slots" className="empty-state">
          <div className="empty-icon">🚫</div>
          <h3 className="empty-title">No Available Slots</h3>
          <p className="empty-description">All parking slots are currently occupied or reserved. Check back later!</p>
        </div>
      )}

      {/* Occupied Slots Placeholder Section */}
      <div id="occupied-slots" className="slots-section" style={{ paddingTop: '1rem' }}>
        {/* This section can be expanded later to show occupied slots */}
      </div>
      {/* Reserved Slots Section */}
      {!loading && reservedSlots.length > 0 && (
        <div id="reserved-slots" className="slots-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">🟡</span>
              Reserved Slots
            </h2>
            <div className="section-badge">{reservedSlots.length} slots</div>
          </div>
          <div className="modern-slot-grid">
            {reservedSlots.map((slot) => (
              <div
                key={slot.id}
                className="modern-slot-card reserved-slot"
                onClick={() => setSelectedSlot(slot)}
              >
                <div className="slot-card-header">
                  <div className="slot-location">
                    <span className="location-icon">P</span>
                    {slot.location}
                  </div>
                  <div className="slot-status-indicator reserved">
                    <span className="status-dot"></span>
                    Reserved
                  </div>
                </div>
                <div className="slot-card-body">
                  <div className="slot-type">
                    <span className="type-icon">
                      {getVehicleIcon(slot.type || 'car', 'slot-card-icon')}
                    </span>
                    {formatVehicleType(slot.type || 'car')}
                  </div>
                  <div className="reservation-details">
                    <div className="reserved-by">
                      <span className="user-icon">👤</span>
                      {slot.user?.name || 'Unknown User'}
                    </div>
                    {slot.bookingStart && (
                      <div className="booking-time">
                        <span className="time-icon">⏰</span>
                        {new Date(slot.bookingStart).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="slot-card-footer">
                  <div className="manage-button">
                    <span>Manage Reservation</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Slot Modal */}
      {selectedSlot && (
        <div className="modern-modal-overlay">
          <SlotModal
            slot={selectedSlot}
            user={user}
            onClose={() => setSelectedSlot(null)}
            onReserve={handleReserve}
            onCancel={handleCancel}
            onCheckIn={handleCheckIn}
            actionLoading={actionLoading}
          />
        </div>
      )}

      {/* Check-In Confirmation Modal */}
      {checkInSlot && (
        <div className="modern-modal-overlay">
          <CheckInConfirmationModal
            slot={checkInSlot}
            onClose={() => setCheckInSlot(null)}
            onConfirmCheckIn={handleConfirmCheckIn}
            actionLoading={actionLoading}
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;