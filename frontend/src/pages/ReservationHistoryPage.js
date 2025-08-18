import React, { useState, useEffect } from 'react';
import { getParkingSessionsByUser } from '../services/api';

const ReservationHistoryPage = () => {
  const [parkingSessions, setParkingSessions] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
    }
  }, []);

  useEffect(() => {
    const fetchParkingSessions = async () => {
      if (user) {
        try {
          const response = await getParkingSessionsByUser(user.id);
          setParkingSessions(response || []);
        } catch (error) {
          console.error('Failed to fetch parking sessions', error);
          setParkingSessions([]);
        }
      }
    };

    fetchParkingSessions();
  }, [user]);

  return (
    <div>
      <h1>Reservation History</h1>
      {parkingSessions.length === 0 ? (
        <p>No past reservations found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>License Plate</th>
              <th>Slot Location</th>
              <th>Check-in Time</th>
              <th>Check-out Time</th>
              <th>Duration (minutes)</th>
              <th>Fee ($)</th>
            </tr>
          </thead>
          <tbody>
            {parkingSessions.map((session) => (
              <tr key={session.id}>
                <td>{session.vehicle.licensePlate}</td>
                <td>{session.slot.location}</td>
                <td>{new Date(session.checkInTime).toLocaleString()}</td>
                <td>{session.checkOutTime ? new Date(session.checkOutTime).toLocaleString() : 'N/A'}</td>
                <td>{session.duration || 'N/A'}</td>
                <td>{session.fee || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReservationHistoryPage;
