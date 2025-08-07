import React, { useState, useEffect } from 'react';
import { getSlots } from '../services/api';
import Slot from '../components/Slot';

const HomePage = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="flex flex-col items-center justify-center w-full text-center mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Real-Time Parking Availability</h2>
      {loading && <p className="text-center">Loading slots...</p>}
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 w-full justify-center mx-auto">
        {slots.map((slot) => (
          <Slot key={slot._id} slot={slot} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;