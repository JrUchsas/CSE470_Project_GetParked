import React, { useState, useEffect } from 'react';
import { getShareRequests } from '../services/api';
import ShareRequestDetailsModal from './ShareRequestDetailsModal';
import PendingShareRequestsListModal from './PendingShareRequestsListModal';

const ShareRequestNotification = ({ user }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const fetchPendingRequests = async () => {
    if (!user || !user.id) return;
    setLoading(true);
    try {
      const requests = await getShareRequests();
      // Filter requests where current user is the original user and status is PENDING
      const filtered = requests.filter(
        (req) => req.originalUserId === user.id && req.status === 'PENDING'
      );
      setPendingRequests(filtered);
      if (filtered.length > 0 && !showNotificationPopup) {
        setNotificationMessage(`You have ${filtered.length} new share requests!`);
        setShowNotificationPopup(true);
        setTimeout(() => {
          setShowNotificationPopup(false);
        }, 5000); // Hide after 5 seconds
      }
    } catch (err) {
      setError('Failed to fetch share requests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
    // Poll for new requests every 30 seconds (adjust as needed)
    const interval = setInterval(fetchPendingRequests, 30000);
    return () => clearInterval(interval);
  }, [user, showNotificationPopup]);

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
  };

  const handleCloseDetailsModal = () => {
    setSelectedRequest(null);
    fetchPendingRequests(); // Refresh list after closing modal
  };

  if (loading) return null; // Or a small loading indicator
  if (error) return <div className="text-red-500 text-sm">Error: {error}</div>;

  return (
    <div className="relative">
      {showNotificationPopup && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-xs">
          <h3 className="text-lg font-bold mb-2">New Share Requests!</h3>
          <p className="text-gray-700 mb-4">{notificationMessage}</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowNotificationPopup(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                setIsListModalOpen(true);
                setShowNotificationPopup(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              View
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsListModalOpen(true)}
        className="relative p-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
        aria-label="Show pending share requests"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a6 6 0 00-6 0M12 20a2 2 0 100-4 2 2 0 000 4z"></path>
        </svg>
        {pendingRequests.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {pendingRequests.length}
          </span>
        )}
      </button>

      {selectedRequest && (
        <ShareRequestDetailsModal
          request={selectedRequest}
          user={user}
          onClose={handleCloseDetailsModal}
        />
      )}

      {isListModalOpen && (
        <PendingShareRequestsListModal
          requests={pendingRequests}
          onClose={() => setIsListModalOpen(false)}
          onViewDetails={(request) => {
            setSelectedRequest(request);
            setIsListModalOpen(false); // Close list modal
          }}
        />
      )}
    </div>
  );
};

export default ShareRequestNotification;
