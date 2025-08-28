import React, { useState, useEffect } from 'react';
import { getAdminStatistics } from '../services/api'; // We will add this to api.js next

import { FaUsers, FaCar, FaDollarSign, FaChartPie } from 'react-icons/fa';

const StatCard = ({ icon, title, value, subValue }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className="bg-blue-500 text-white p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
    </div>
  </div>
);

const AdminStatistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getAdminStatistics();
        setStats(data);
        setError('');
      } catch (err) {
        setError('Failed to fetch statistics. You may not have permission.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Loading statistics...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  if (!stats) return null;

  

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<FaUsers size={24} />} title="Total Users" value={stats.totalUsers} />
        <StatCard icon={<FaCar size={24} />} title="Total Bookings" value={stats.totalBookings} />
        <StatCard icon={<FaDollarSign size={24} />} title="Total Revenue" value={`${stats.totalRevenue.toFixed(2)} Taka`} />
        <StatCard
          icon={<FaChartPie size={24} />}
          title="Slot Occupancy"
          value={`${stats.slotOccupancy.percentage}%`}
          subValue={`${stats.slotOccupancy.occupied} / ${stats.slotOccupancy.total} slots`}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Monthly Summary */}
        {stats.bookingsThisMonth && stats.bookingsThisMonth.length > 0 && (
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-bold text-gray-800">
              {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <p className="text-lg text-gray-600">
              Total Bookings: {stats.bookingsThisMonth.reduce((acc, day) => acc + day.count, 0)}
            </p>
          </div>
        )}
        <h3 className="text-lg font-semibold mb-4">Bookings This Month</h3>
        <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-gray-600 mb-2">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {/* Render empty cells for days before the 1st of the month */}
          {stats.bookingsThisMonth && stats.bookingsThisMonth.length > 0 && Array.from({ length: new Date(stats.bookingsThisMonth[0].date).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2"></div>
          ))}
          {stats.bookingsThisMonth.map((dayData) => (
            <div key={dayData.date} className="p-2 border rounded-md flex flex-col items-center justify-center"
                 style={{ backgroundColor: dayData.count > 0 ? '#DBEAFE' : '#F9FAFB', borderColor: dayData.count > 0 ? '#93C5FD' : '#E5E7EB' }}>
              <span className="text-xs text-gray-500">{new Date(dayData.date).getDate()}</span>
              {dayData.count > 0 && (
                <span className="font-bold text-lg text-blue-700">Booking: {dayData.count}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;
