import React, { useState, useEffect } from 'react';
import { getSlots, updateSlot } from '../services/api';
import Slot from '../components/Slot';
import SlotModal from '../components/SlotModal';

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
  const handleReserve = async (slot) => {
    if (!user) return;
    setActionLoading(true);
    try {
      const updated = await updateSlot(slot.id, {
        status: 'Reserved',
        reservedBy: user.id,
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
    <div className="flex flex-col items-center justify-center w-full text-center mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Available slots:</h2>
      {loading && <p className="text-center">Loading slots...</p>}
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 w-full justify-center mx-auto mb-8">
        {availableSlots.map((slot) => (
          <div
            key={slot.id}
            className="cursor-pointer group"
            onClick={() => setSelectedSlot(slot)}
          >
            <Slot slot={slot} />
          </div>
        ))}
      </div>
      {reservedSlots.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Reserved slots:</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 w-full justify-center mx-auto">
            {reservedSlots.map((slot) => (
              <div
                key={slot.id}
                className="cursor-pointer group"
                onClick={() => setSelectedSlot(slot)}
              >
                <Slot slot={slot} />
                <div className="text-xs text-gray-600 mt-1">Reserved by: {slot.user?.name || 'Unknown'}</div>
              </div>
            ))}
          </div>
        </>
      )}
      {selectedSlot && (
        <SlotModal
          slot={selectedSlot}
          user={user}
          onClose={() => setSelectedSlot(null)}
          onReserve={handleReserve}
          onCancel={handleCancel}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default HomePage;