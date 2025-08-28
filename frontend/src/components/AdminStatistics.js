import React, { useState, useEffect } from 'react';
import { getAdminStatistics } from '../services/api'; // We will add this to api.js next
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
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

  const chartData = stats.bookingsLast7Days.map(item => ({
      name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
      Bookings: item.count
  }));

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
        <h3 className="text-lg font-semibold mb-4">Bookings This Week</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Bookings" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminStatistics;
