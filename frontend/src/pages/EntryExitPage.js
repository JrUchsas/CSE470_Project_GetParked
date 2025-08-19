import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSlots, getVehiclesByOwner, checkIn, checkOut, getParkingSessionBySlot } from '../services/api';
import CheckOutModal from '../components/CheckOutModal'; // NEW

const EntryExitPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { slotId: initialSlotId } = location.state || {}; // Get slotId from state
  const [slots, setSlots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [user, setUser] = useState(null);
  const [selectedOccupiedSlot, setSelectedOccupiedSlot] = useState(null); // New state for modal

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
    }
  }, []);

  const fetchSlots = async () => {
    try {
      console.log('Fetching slots...');
      const response = await getSlots();
      console.log('Slots fetched:', response);
      setSlots(response || []);
    } catch (error) {
      console.error('Failed to fetch slots', error);
      setSlots([]);
    }
  };

  const fetchVehicles = async () => {
    if (!user) return;
    try {
      const response = await getVehiclesByOwner(user.id);
      setVehicles(response || []);
    } catch (error) {
      console.error('Failed to fetch vehicles', error);
      setVehicles([]);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered');
    fetchSlots();
    fetchVehicles();

    if (initialSlotId && user && vehicles.length > 0) {
      console.log('Attempting to auto-check-in:', initialSlotId);
      const slotToCheckIn = slots.find(s => s.id === initialSlotId);
      if (slotToCheckIn && slotToCheckIn.status === 'Reserved') {
        console.log('Slot found and reserved:', slotToCheckIn);
        if (vehicles.length > 0) {
          console.log('Vehicles available, pre-selecting and checking in:', vehicles[0]);
          setSelectedVehicle(vehicles[0].id); // Pre-select first vehicle
          handleCheckIn(initialSlotId, vehicles[0].id); // Pass vehicleId to handleCheckIn
          navigate('/entry-exit', { replace: true }); // Clear the state from URL
        } else {
          alert('Please register a vehicle to check in.');
          console.log('No vehicles registered for auto-check-in.');
        }
      } else {
        console.log('Slot not found or not reserved for auto-check-in.');
      }
    } else {
      console.log('Conditions not met for auto-check-in. initialSlotId:', initialSlotId, 'user:', user, 'vehicles.length:', vehicles.length);
    }
  }, [user, initialSlotId, slots, vehicles]);

  const handleCheckIn = async (slotId, vehicleIdToUse = selectedVehicle) => {
    console.log('handleCheckIn called for slotId:', slotId, 'with vehicleId:', vehicleIdToUse);
    if (!vehicleIdToUse) {
      alert('Please select a vehicle first');
      console.log('No vehicle selected for check-in.');
      return;
    }
    try {
      console.log('Calling checkIn API...');
      await checkIn({ vehicleId: vehicleIdToUse, slotId });
      console.log('CheckIn API successful, fetching slots...');
      fetchSlots();
      console.log('Slots fetched after check-in.');
    } catch (error) {
      console.error('Failed to check-in', error);
    }
  };

  const handleCheckOut = async (slot) => {
    try {
      console.log('handleCheckOut called for slot:', slot.id);
      const response = await getParkingSessionBySlot(slot.id);
      const parkingSession = response;
      console.log('Parking session found:', parkingSession);

      await checkOut(parkingSession.id); // Only pass parkingSession.id
      console.log('checkOut API successful.');
      fetchSlots();
      console.log('Slots fetched after check-out. Navigating to home page...');
      navigate('/'); // Navigate to home page
    } catch (error) {
      console.error('Failed to check-out', error);
      console.log('Error during check-out:', error);
    }
  };

  const occupiedSlots = slots.filter(slot => slot.status === 'Occupied' && slot.user && slot.user.id === user.id);

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Occupied Parking Slots</h1>
      {/* Removed Select Vehicle as this page now focuses on occupied slots */}
      <> {/* Added React Fragment */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl">
          {occupiedSlots.length === 0 ? (
            <p className="text-center text-gray-600 col-span-full">No occupied slots found.</p>
          ) : (
            occupiedSlots.map((slot) => (
              <div key={slot.id} className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center justify-center">
                <p className="text-lg font-semibold mb-2">{slot.location}</p>
                <p className="text-gray-600 mb-4">{slot.status}</p>
                {slot.status === 'Occupied' && (
                  <button
                    onClick={() => handleCheckOut(slot.id)}
                    className="slot-modal-btn" // Reusing existing button style
                  >
                    Check-out
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        {selectedOccupiedSlot && (
          <CheckOutModal
            slot={selectedOccupiedSlot}
            onClose={() => setSelectedOccupiedSlot(null)}
            onCheckOut={handleCheckOut}
          />
        )}
      </> {/* Closing React Fragment */}
    </div>
  );
};

export default EntryExitPage;
