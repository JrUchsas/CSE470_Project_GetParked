import React, { useState, useEffect } from 'react';
import { getSlots, updateSlot } from '../services/api';
import Slot from '../components/Slot';
import SlotModal from '../components/SlotModal';
import ErrorModal from '../components/ErrorModal';
import '../custom-styles.css';

const HomePage = ({ user }) => {
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

  return (
    <div className="flex flex-col w-full mx-auto">
      <h2 className="">Available slots:</h2>
      {loading && <p className="text-center">Loading slots...</p>}
      {error && (
        <ErrorModal
          errorMessage={error}
          onClose={() => setError('')}
        />
      )}
      <div className="user-slot-list">
        {availableSlots.map((slot) => (
          <div
            key={slot.id}
            className="user-slot-card"
            onClick={() => setSelectedSlot(slot)}
          >
            <Slot slot={slot} />
            <div className="user-slot-status">
              <div>Available</div>
              {slot.type && (
                <div className="text-xs mt-1">
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
            actionLoading={actionLoading}
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;