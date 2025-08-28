import React, { useState, useEffect } from 'react';
import { getAdminStatistics } from '../services/api';
import '../styles/custom-admin.css';

const AdminBookingStatistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Month is 1-indexed for display
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getAdminStatistics(selectedMonth, selectedYear); // Pass month and year
        setStats(data);
        setError('');
      } catch (err) {
        setError('Failed to fetch booking statistics. You may not have permission.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedMonth, selectedYear]); // Add dependencies

  if (loading) {
    return <div className="text-center p-10">Loading booking statistics...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  if (!stats || !stats.bookingsThisMonth) return null; // Ensure bookingsThisMonth exists

  return (
    <div className="admin-dashboard-container">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Monthly Booking Statistics</h2>
      <div className="flex justify-center items-center space-x-4 mb-6">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="p-2 border rounded-md"
        >
          {[...Array(12).keys()].map((monthIndex) => (
            <option key={monthIndex + 1} value={monthIndex + 1}>
              {new Date(0, monthIndex).toLocaleString('en-US', { month: 'long' })}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="p-2 border rounded-md w-24 text-center"
          min="2020" // Adjust as needed
          max={new Date().getFullYear() + 5} // Adjust as needed
        />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Monthly Summary */}
        {stats.bookingsThisMonth.length > 0 && ( // Check length here too
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-bold text-gray-800">
              {new Date(selectedYear, selectedMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <p className="text-lg text-gray-600">
              Total Bookings: {stats.bookingsThisMonth.reduce((acc, day) => acc + day.count, 0)}
            </p>
          </div>
        )}
        <h3 className="text-lg font-semibold mb-4">Calendar View</h3>
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

export default AdminBookingStatistics;
