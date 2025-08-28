import React, { useState, useEffect, useRef } from 'react';
import { acceptShareRequest, rejectShareRequest, sendShareMessage, getShareMessages } from '../services/api';

const ShareRequestDetailsModal = ({ request, user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const isOriginalUser = request.originalUserId === user.id;
  const isRequester = request.requesterId === user.id;

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const msgs = await getShareMessages(request.id);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to load messages.');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll for new messages every 5 seconds
    return () => clearInterval(interval);
  }, [request.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      await sendShareMessage(request.id, { content: newMessage });
      setNewMessage('');
      fetchMessages(); // Refresh messages after sending
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await acceptShareRequest(request.id);
      alert('Share request accepted!');
      onClose(); // Close modal and refresh parent list
    } catch (err) {
      console.error('Failed to accept request:', err);
      setError(err.response?.data?.message || 'Failed to accept request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await rejectShareRequest(request.id);
      alert('Share request rejected.');
      onClose(); // Close modal and refresh parent list
    } catch (err) {
      console.error('Failed to reject request:', err);
      setError(err.response?.data?.message || 'Failed to reject request.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl m-4 flex flex-col" style={{ maxHeight: '90vh' }}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Share Request Details</h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl">&times;</button>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

        <div className="mb-4 p-4 border rounded-md bg-gray-50">
          <p><strong>Slot:</strong> {request.slot?.location || 'N/A'}</p>
          <p><strong>Original User:</strong> {request.originalUser?.name || 'N/A'}</p>
          <p><strong>Requester:</strong> {request.requester?.name || 'N/A'}</p>
          <p><strong>Requested Time:</strong> {formatDateTime(request.requestedStartTime)} - {formatDateTime(request.requestedEndTime)}</p>
          <p><strong>Status:</strong> <span className={`font-semibold ${request.status === 'PENDING' ? 'text-yellow-600' : request.status === 'ACCEPTED' ? 'text-green-600' : 'text-red-600'}`}>{request.status}</span></p>
          {request.initialMessage && <p><strong>Initial Message:</strong> {request.initialMessage}</p>}
        </div>

        {/* Chat Section */}
        <div className="flex-grow overflow-y-auto border rounded-md p-4 mb-4 bg-gray-50" style={{ minHeight: '200px' }}>
          {loadingMessages ? (
            <div className="text-center text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">No messages yet.</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`mb-2 ${msg.senderId === user.id ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-2 rounded-lg ${msg.senderId === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'}`}>
                  <strong>{msg.sender?.name || 'Unknown'}:</strong> {msg.content}
                </span>
                <div className="text-xs text-gray-500 mt-1">{formatDateTime(msg.createdAt)}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        {(request.status === 'PENDING' || request.status === 'ACCEPTED') && (
          <form onSubmit={handleSendMessage} className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={sendingMessage}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              disabled={sendingMessage}
            >
              {sendingMessage ? 'Sending...' : 'Send'}
            </button>
          </form>
        )}

        {/* Action Buttons (for Original User only) */}
        {isOriginalUser && request.status === 'PENDING' && (
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleReject}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
              disabled={actionLoading}
            >
              {actionLoading ? 'Rejecting...' : 'Reject'}
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
              disabled={actionLoading}
            >
              {actionLoading ? 'Accepting...' : 'Accept'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareRequestDetailsModal;
