import React, { useState, useEffect, useCallback } from 'react';
import { getSlots, checkOutBySlot } from '../services/api';
import CheckOutModal from '../components/CheckOutModal';

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
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Parking Entry/Exit</h1>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> To check in to a parking slot, you must first reserve it from the main parking page.
          Only reserved slots can be checked into, and check-in is only allowed during your reservation time window.
        </p>
      </div>

      {/* Occupied Slots Section */}
      <section className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Your Occupied Parking Slots</h2>
        {occupiedSlotsByUser.length === 0 ? (
          <p className="text-gray-600">You don't have any active parking sessions.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {occupiedSlotsByUser.map(slot => (
              <div key={slot.id} className="bg-red-50 border border-red-200 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{slot.location}</h3>
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
                    Occupied
                  </span>
                </div>

                {slot.vehicle && (
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Vehicle:</span>
                      <span className="text-sm text-gray-800">{slot.vehicle.licensePlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Model:</span>
                      <span className="text-sm text-gray-800">{slot.vehicle.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Type:</span>
                      <span className="text-sm text-gray-800 capitalize">{slot.vehicle.type}</span>
                    </div>
                  </div>
                )}

                {slot.bookingStart && slot.bookingEnd && (
                  <div className="mb-4 space-y-2 border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Reserved From:</span>
                      <span className="text-sm text-gray-800">
                        {new Date(slot.bookingStart).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Reserved Until:</span>
                      <span className="text-sm text-gray-800">
                        {new Date(slot.bookingEnd).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleCheckOut(slot)}
                  className="w-full mt-4 py-2 px-4 rounded-md text-white font-semibold bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Check Out
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

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