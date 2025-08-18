import React, { useState, useEffect } from 'react';
import { getSlots, getVehiclesByOwner, checkIn, checkOut, getParkingSessionBySlot } from '../services/api';

const EntryExitPage = () => {
  const [slots, setSlots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
    }
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await getSlots();
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
    fetchSlots();
    fetchVehicles();
  }, [user]);

  const handleCheckIn = async (slotId) => {
    if (!selectedVehicle) {
      alert('Please select a vehicle first');
      return;
    }
    try {
      await checkIn({ vehicleId: selectedVehicle, slotId });
      fetchSlots();
    } catch (error) {
      console.error('Failed to check-in', error);
    }
  };

  const handleCheckOut = async (slotId) => {
    try {
      const response = await getParkingSessionBySlot(slotId);
      const parkingSession = response;
      await checkOut(parkingSession.id);
      fetchSlots();
    } catch (error) {
      console.error('Failed to check-out', error);
    }
  };

  return (
    <div>
      <h1>Entry / Exit</h1>
      <div>
        <label>Select Vehicle:</label>
        <select onChange={(e) => setSelectedVehicle(e.target.value)} value={selectedVehicle}>
          <option value="">-- Select Vehicle --</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
            </option>
          ))}
        </select>
      </div>
      <div className="slots-container">
        {slots.map((slot) => (
          <div key={slot.id} className={`slot ${slot.status.toLowerCase()}`}>
            <p>{slot.location}</p>
            <p>{slot.status}</p>
            {slot.status === 'Available' && (
              <button onClick={() => handleCheckIn(slot.id)}>Check-in</button>
            )}
            {slot.status === 'Occupied' && (
              <button onClick={() => handleCheckOut(slot.id)}>Check-out</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EntryExitPage;
