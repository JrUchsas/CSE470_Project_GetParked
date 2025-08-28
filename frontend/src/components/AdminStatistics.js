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
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <p className="stat-label">{title}</p>
      <p className="stat-value">{value}</p>
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

  return (
    <div className="p-4 md:p-8 space-y-8">
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner-modern"></div>
          <span className="loading-text">Loading statistics...</span>
        </div>
      )}

      {error && (
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3 className="error-title">Error loading statistics</h3>
          <p className="error-message">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && stats && stats.bookingsThisMonth ? (
        <>
          <div className="admin-card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          
        </>
      ) : (
        !loading && !error && (
          <div className="admin-card">
            <p className="text-center text-gray-600">No statistics data available.</p>
          </div>
        )
      )}
    </div>
  );
};

export default AdminStatistics;
