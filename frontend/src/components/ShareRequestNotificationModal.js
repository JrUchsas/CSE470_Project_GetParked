import React, { useState } from 'react';
import { format } from 'date-fns';
import { acceptShareRequest, rejectShareRequest, sendShareMessage, getShareMessages } from '../services/api'; // Assuming these exist

const ShareRequestNotificationModal = ({ request, onClose, onUpdateRequests }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messages, setMessages] = useState([]);
  const [showChat, setShowChat] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    setError('');
    try {
      await acceptShareRequest(request.id);
      onUpdateRequests(); // Notify parent to refresh requests
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept request.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError('');
    try {
      await rejectShareRequest(request.id);
      onUpdateRequests(); // Notify parent to refresh requests
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const chatMessages = await getShareMessages(request.id);
      setMessages(chatMessages);
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      setError('Failed to load chat messages.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    try {
      await sendShareMessage(request.id, { content: messageContent });
      setMessageContent('');
      fetchMessages(); // Refresh messages after sending
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message.');
    }
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    if (!showChat && messages.length === 0) { // Fetch messages only when opening chat for the first time
      fetchMessages();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Share Request Received!</h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl">&times;</button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="mb-4">
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">From:</span> {request.requester?.name || 'Unknown User'}
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">For Slot:</span> {request.slot?.location || 'N/A'} ({request.slot?.type ? request.slot.type.charAt(0).toUpperCase() + request.slot.type.slice(1) : 'N/A'})
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Requested Time:</span>{' '}
            {format(new Date(request.requestedStartTime), 'MMM dd, yyyy hh:mm a')} -{' '}
            {format(new Date(request.requestedEndTime), 'hh:mm a')}
          </p>
          <p className="text-gray-700 mb-4">
            <span className="font-semibold">Message:</span> {request.initialMessage || 'No message provided.'}
          </p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={toggleChat}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {showChat ? 'Hide Chat' : 'Show Chat'}
          </button>
          <div className="flex space-x-4">
            <button
              onClick={handleAccept}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Accept'}
            </button>
            <button
              onClick={handleReject}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Reject'}
            </button>
          </div>
        </div>

        {showChat && (
          <div className="mt-4 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Chat</h3>
            <div className="chat-box h-40 overflow-y-auto border p-2 rounded-md bg-gray-50 mb-3">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center">No messages yet.</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`mb-1 ${msg.senderId === request.originalUserId ? 'text-right' : 'text-left'}`}>
                    <span className={`inline-block p-2 rounded-lg ${msg.senderId === request.originalUserId ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'}`}>
                      <strong>{msg.sender?.name || 'Unknown'}:</strong> {msg.content}
                    </span>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendMessage} className="flex">
              <input
                type="text"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:bg-blue-400"
                disabled={!messageContent.trim()}
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareRequestNotificationModal;
