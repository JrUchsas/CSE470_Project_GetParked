import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSlots, updateSlot } from '../services/api';
import Slot from '../components/Slot';
import SlotModal from '../components/SlotModal';
import ErrorModal from '../components/ErrorModal';
import '../custom-styles.css';

const HomePage = ({ user }) => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
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
        console.error(err);
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

  // Check In
  const handleCheckIn = (slot) => {
    if (!user) return;
    // Navigate to the Entry/Exit page, passing the slot ID
    navigate('/entry-exit', { state: { slotId: slot.id } });
    setSelectedSlot(null); // Close the modal
  };

  return (
    <div className="flex flex-col w-full mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Available Slots</h2>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="loading-spinner" style={{ width: '2rem', height: '2rem' }}></div>
          <span className="ml-3 text-gray-600 font-medium">Loading slots...</span>
        </div>
      )}

      {error && (
        <ErrorModal
          errorMessage={error}
          onClose={() => setError('')}
        />
      )}

      <div className="user-slot-list mb-8">
        {availableSlots.map((slot) => (
          <div
            key={slot.id}
            className="user-slot-card"
            onClick={() => setSelectedSlot(slot)}
            style={{
              cursor: 'pointer'
            }}
          >
            <div className="p-4">
              <div className="text-lg font-bold text-gray-800 mb-2">
                🅿️ {slot.location}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm font-medium text-gray-700">Available</span>
              </div>
              {slot.type && (
                <div className="text-sm font-medium text-gray-600">
                  Type: {slot.type === 'suv' ? 'SUV' : (slot.type.charAt(0).toUpperCase() + slot.type.slice(1))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {reservedSlots.length > 0 && (
        <>
          <h2 className="user-section-title" style={{fontSize:'1.5rem'}}>Reserved slots:</h2>
          <div className="user-slot-list">
            {reservedSlots.map((slot) => (
              <div
                key={slot.id}
                className="user-slot-card"
                onClick={() => setSelectedSlot(slot)}
              >
                <Slot slot={slot} />
                <div className="user-reserved-label">Reserved by: {slot.user?.name || 'Unknown'}</div>
              </div>
            ))}
          </div>
        </>
      )}
      {selectedSlot && (
        <div className="user-modal">
          <SlotModal
            slot={selectedSlot}
            user={user}
            onClose={() => setSelectedSlot(null)}
            onReserve={handleReserve}
            onCancel={handleCancel}
            onCheckIn={handleCheckIn} // New prop
            actionLoading={actionLoading}
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;