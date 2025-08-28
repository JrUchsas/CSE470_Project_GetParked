import React, { useState, useEffect, useMemo } from 'react';
import { getAllFeedback } from '../services/api';
import '../styles/custom-admin.css';

const StarRating = ({ rating }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const data = await getAllFeedback();
        setFeedback(data);
      } catch (err) {
        setError('Failed to load feedback.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  const sortedFeedback = useMemo(() => {
    let sortableItems = [...feedback];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [feedback, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  if (loading) return <div className="text-center p-10">Loading feedback...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div className="admin-dashboard-container">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">User Feedback</h2>
      <div className="admin-card">
        <div className="overflow-x-auto w-full">
          <table className="admin-table min-w-full bg-white">
            <thead>
              <tr>
                <th onClick={() => requestSort('rating')}>Rating{getSortIndicator('rating')}</th>
                <th>Comment</th>
                <th onClick={() => requestSort('user')}>User{getSortIndicator('user')}</th>
                <th onClick={() => requestSort('createdAt')}>Date{getSortIndicator('createdAt')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedFeedback.map((item) => (
                <tr key={item.id}>
                  <td><StarRating rating={item.rating} /></td>
                  <td className="text-left">{item.comment || <span className="text-gray-400">No comment</span>}</td>
                  <td>{item.user?.name || 'N/A'}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedback;
