import React, { useState, useEffect } from 'react';
import { getAllPaymentInvoices, getPaymentStatistics } from '../services/api';
import '../styles/custom-admin.css';
import { getVehicleIcon, formatVehicleType } from '../components/VehicleIcons';

const InvoiceIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const AdminPaymentHistory = () => {
  const [paymentInvoices, setPaymentInvoices] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const [invoicesData, statsData] = await Promise.all([
        getAllPaymentInvoices(),
        getPaymentStatistics()
      ]);
      setPaymentInvoices(invoicesData);
      setStatistics(statsData);
      setError('');
    } catch (err) {
      setError('Failed to load payment data. Please try again.');
    } finally {
      setLoading(false);
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

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const filteredInvoices = paymentInvoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.slotLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const closeInvoiceModal = () => {
    setSelectedInvoice(null);
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner-modern"></div>
          <span className="loading-text">Loading payment history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Error</h3>
          <p className="error-message">{error}</p>
          <button onClick={fetchPaymentData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="homepage-header">
        <div className="header-content">
          <h1 className="homepage-title">
            <span className="title-icon">🧾</span>
            Payment History
          </h1>
          <p className="homepage-subtitle">
            View and manage payment invoices
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3 className="stat-value">{statistics.totalRevenue || 0} Taka</h3>
            <p className="stat-label">Total Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3 className="stat-value">{statistics.totalInvoices || 0}</h3>
            <p className="stat-label">Total Invoices</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3 className="stat-value">{statistics.todayRevenue || 0} Taka</h3>
            <p className="stat-label">Today's Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🧾</div>
          <div className="stat-content">
            <h3 className="stat-value">{statistics.todayInvoices || 0}</h3>
            <p className="stat-label">Today's Invoices</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="admin-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by invoice, user, vehicle, or slot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Payment Invoices Table */}
      <div className="admin-card">
        <div className="overflow-x-auto w-full">
          <table className="admin-table min-w-full bg-white rounded-lg overflow-hidden shadow text-center mx-auto">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>User</th>
                <th>Vehicle</th>
                <th>Slot</th>
                <th>Duration</th>
                <th>Amount</th>
                <th>Payment Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    {searchTerm ? 'No invoices match your search.' : 'No payment invoices found.'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="font-semibold text-gray-800">{invoice.invoiceNumber}</td>
                    <td>
                      <div className="flex flex-col items-center">
                        <div className="font-medium text-gray-800">{invoice.userName}</div>
                        <div className="text-sm text-gray-500">{invoice.userEmail}</div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col items-center">
                        <div className="font-medium text-gray-800">{invoice.vehiclePlate}</div>
                        <div className="flex items-center text-sm text-gray-500">
                          {getVehicleIcon(invoice.vehicleType, 'w-4 h-4 mr-1')}
                          {formatVehicleType(invoice.vehicleType)}
                        </div>
                      </div>
                    </td>
                    <td className="font-medium text-gray-800">{invoice.slotLocation}</td>
                    <td className="text-sm text-gray-600">{formatDuration(invoice.duration)}</td>
                    <td className="font-semibold text-green-600">{invoice.totalAmount} Taka</td>
                    <td className="text-sm text-gray-600">{formatDateTime(invoice.paymentDate)}</td>
                    <td>
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className="slot-modal-btn primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', width: 'auto' }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="slot-modal-overlay" onClick={closeInvoiceModal}>
          <div className="slot-modal-card" onClick={e => e.stopPropagation()}>
            <button onClick={closeInvoiceModal} className="slot-modal-close" aria-label="Close modal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="slot-modal-content">
              <div className="slot-modal-header">
                <div className="slot-modal-icon-wrapper" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', boxShadow: '0 8px 16px rgba(59,130,246,0.2)' }}>
                  <InvoiceIcon />
                </div>
                <h3 className="slot-modal-title">Payment Invoice</h3>
                <p className="slot-modal-subtitle">Details of the selected payment</p>
              </div>
              <div className="invoice-details">
                <div className="invoice-header-info">
                  <h3>Invoice #{selectedInvoice.invoiceNumber}</h3>
                  <p>Payment Date: {formatDateTime(selectedInvoice.paymentDate)}</p>
                </div>
                <div className="invoice-section">
                  <h4>User Details</h4>
                  <p><strong>Name:</strong> {selectedInvoice.userName}</p>
                  <p><strong>Email:</strong> {selectedInvoice.userEmail}</p>
                  {selectedInvoice.userContact && (
                    <p><strong>Contact:</strong> {selectedInvoice.userContact}</p>
                  )}
                </div>
                <div className="invoice-section">
                  <h4>Vehicle Details</h4>
                  <p><strong>License Plate:</strong> {selectedInvoice.vehiclePlate}</p>
                  <p><strong>Model:</strong> {selectedInvoice.vehicleModel}</p>
                  <p><strong>Type:</strong> {formatVehicleType(selectedInvoice.vehicleType)}</p>
                </div>
                <div className="invoice-section">
                  <h4>Parking Details</h4>
                  <p><strong>Slot Location:</strong> {selectedInvoice.slotLocation}</p>
                  <p><strong>Check-in:</strong> {formatDateTime(selectedInvoice.checkInTime)}</p>
                  <p><strong>Check-out:</strong> {formatDateTime(selectedInvoice.checkOutTime)}</p>
                  <p><strong>Duration:</strong> {formatDuration(selectedInvoice.duration)}</p>
                </div>
                <div className="invoice-section">
                  <h4>Payment Breakdown</h4>
                  <div className="fee-breakdown">
                    <div className="fee-row">
                      <span>Parking Fee ({selectedInvoice.hourlyRate} Taka/hour):</span>
                      <span>{selectedInvoice.parkingFee} Taka</span>
                    </div>
                    <div className="fee-row">
                      <span>Online Reservation Fee:</span>
                      <span>{selectedInvoice.onlineReservationFee} Taka</span>
                    </div>
                    {selectedInvoice.penaltyFee > 0 && (
                      <div className="fee-row text-red-600 font-semibold">
                        <span>Violation Fee:</span>
                        <span>{selectedInvoice.penaltyFee} Taka</span>
                      </div>
                    )}
                    <div className="fee-row total">
                      <span><strong>Total Amount:</strong></span>
                      <span><strong>{selectedInvoice.totalAmount} Taka</strong></span>
                    </div>
                  </div>
                </div>
                <div className="invoice-section">
                  <h4>Payment Information</h4>
                  <p><strong>Payment Method:</strong> {selectedInvoice.paymentMethod}</p>
                  <p><strong>Payment Status:</strong> <span className="status-paid">{selectedInvoice.paymentStatus}</span></p>
                </div>
              </div>
              <div className="slot-modal-actions" style={{ marginTop: '2rem' }}>
                <button
                  className="slot-modal-btn primary"
                  onClick={() => alert(`Admin: Downloading invoice for ${selectedInvoice.id}`)}
                >
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentHistory;