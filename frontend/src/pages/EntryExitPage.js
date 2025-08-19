import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getSlots, getVehiclesByOwner, checkIn, checkOut, getParkingSessionBySlot } from '../services/api';
import CheckOutModal from '../components/CheckOutModal';

const EntryExitPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { slotId: initialSlotId } = location.state || {};

  const [slots, setSlots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
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

  useEffect(() => {
    if (user && user.id) {
      fetchData();
    }
  }, [user, fetchData]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [slotsResponse, vehiclesResponse] = await Promise.all([
        getSlots(),
        getVehiclesByOwner(user.id),
      ]);
      setSlots(slotsResponse || []);
      setVehicles(vehiclesResponse || []);

      if (initialSlotId && slotsResponse && vehiclesResponse.length > 0) {
        const slotToCheckIn = slotsResponse.find(s => s.id === initialSlotId);
        if (slotToCheckIn && slotToCheckIn.status === 'Available') {
          setSelectedVehicle(vehiclesResponse[0].id); // Pre-select first vehicle
          // Note: handleCheckIn call removed to avoid circular dependency
          navigate('/entry-exit', { replace: true }); // Clear the state from URL
        }
      }
    } catch (err) {
      setError('Failed to load data.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [user.id, initialSlotId, navigate]);

  const handleCheckIn = async (slotId, vehicleIdToUse = selectedVehicle) => {
    if (!vehicleIdToUse) {
      alert('Please select a vehicle first.');
      return;
    }
    try {
      await checkIn({ vehicleId: vehicleIdToUse, slotId });
      alert('Checked in successfully!');
      fetchData(); // Refresh data after check-in
    } catch (err) {
      setError('Failed to check-in.');
      console.error('Error during check-in:', err);
    }
  };

  const handleCheckOut = async (slot) => {
    try {
      const parkingSession = await getParkingSessionBySlot(slot.id);
      setSelectedOccupiedSlot({ ...slot, parkingSession });
    } catch (err) {
      setError('Failed to retrieve parking session for check-out.');
      console.error('Error fetching parking session:', err);
    }
  };

  const confirmCheckOut = async () => {
    if (!selectedOccupiedSlot || !selectedOccupiedSlot.parkingSession) return;
    try {
      await checkOut(selectedOccupiedSlot.parkingSession.id);
      alert('Checked out successfully!');
      setSelectedOccupiedSlot(null);
      fetchData(); // Refresh data after check-out
    } catch (err) {
      setError('Failed to check-out.');
      console.error('Error during check-out confirmation:', err);
    }
  };

  const availableSlots = slots.filter(slot => slot.status === 'Available');
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

      {/* Check-in Section */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Check-in</h2>
        {user && vehicles.length > 0 ? (
          <div className="mb-4">
            <label htmlFor="vehicle-select" className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle:</label>
            <select
              id="vehicle-select"
              className="mt-1 block w-full md:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              <option value="">-- Select a Vehicle --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.licensePlate} ({v.model})</option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-gray-600 mb-4">Please <Link to="/register-vehicle" className="text-blue-500 hover:underline">register a vehicle</Link> to check in.</p>
        )}

        <h3 className="text-xl font-medium mb-3">Available Slots</h3>
        {availableSlots.length === 0 ? (
          <p className="text-gray-600">No available slots at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableSlots.map(slot => (
              <div key={slot.id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col items-center">
                <p className="text-lg font-semibold">{slot.location}</p>
                <p className="text-sm text-gray-500">Type: {slot.type || 'Any'}</p>
                <button
                  onClick={() => handleCheckIn(slot.id)}
                  disabled={!selectedVehicle}
                  className={`mt-3 py-2 px-4 rounded-md text-white font-semibold ${selectedVehicle ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  Check-in
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Check-out Section */}
      <section className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Check-out</h2>
        {occupiedSlotsByUser.length === 0 ? (
          <p className="text-gray-600">No active parking sessions for your vehicles.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {occupiedSlotsByUser.map(slot => (
              <div key={slot.id} className="bg-red-50 p-4 rounded-lg shadow-sm flex flex-col items-center">
                <p className="text-lg font-semibold">{slot.location}</p>
                <p className="text-sm text-gray-500">Status: {slot.status}</p>
                <button
                  onClick={() => handleCheckOut(slot)}
                  className="mt-3 py-2 px-4 rounded-md text-white font-semibold bg-red-500 hover:bg-red-600"
                >
                  Check-out
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