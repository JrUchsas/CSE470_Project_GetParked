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
        <div className="overflow-x-auto w-full mx-auto">
          <table className="admin-table min-w-full bg-white rounded-lg overflow-hidden shadow text-center mx-auto">
            <thead>
              <tr>
                <th className="py-2 px-4">License Plate</th>
                <th className="py-2 px-4">Slot Location</th>
                <th className="py-2 px-4">Check-in Time</th>
                <th className="py-2 px-4">Check-out Time</th>
                <th className="py-2 px-4">Duration (minutes)</th>
                <th className="py-2 px-4">Fee ($)</th>
              </tr>
            </thead>
            <tbody>
              {parkingSessions.map((session) => (
                <tr key={session.id}>
                  <td className="py-2 px-4">{session.vehicle.licensePlate}</td>
                  <td className="py-2 px-4">{session.slot.location}</td>
                  <td className="py-2 px-4">{new Date(session.checkInTime).toLocaleString()}</td>
                  <td className="py-2 px-4">{session.checkOutTime ? new Date(session.checkOutTime).toLocaleString() : 'N/A'}</td>
                  <td className="py-2 px-4">{session.duration || 'N/A'}</td>
                  <td className="py-2 px-4">{session.fee || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReservationHistoryPage;
