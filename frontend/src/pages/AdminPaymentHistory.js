import React, { useState, useEffect } from 'react';
import { getAllPaymentInvoices, getPaymentStatistics } from '../services/api';
import '../styles/custom-admin.css';
import { getVehicleIcon } from '../components/VehicleIcons'; // Import getVehicleIcon

// Icon component for invoice modal header
const InvoiceIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const formatVehicleType = (type) => {
  let formattedType = type;
  switch (type) {
    case 'car':
      formattedType = 'Car';
      break;
    case 'bike':
      formattedType = 'Bike';
      break;
    case 'suv':
      formattedType = 'SUV';
      break;
    case 'van':
      formattedType = 'Van';
      break;
    case 'minibus':
      formattedType = 'Minibus';
      break;
    default:
      formattedType = type.charAt(0).toUpperCase() + type.slice(1);
  }
  return formattedType;
};

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
      console.error('Error fetching payment data:', err);
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
      <div className="modern-homepage-container"> {/* Changed class */}
        <div className="loading-container">
          <div className="loading-spinner-modern"></div> {/* Changed class */}
          <span className="loading-text">Loading payment history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-homepage-container"> {/* Changed class */}
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
    <div className="modern-homepage-container"> {/* Changed class */}
      <div className="homepage-header"> {/* Changed class */}
        <div className="header-content"> {/* Added div */}
          <h1 className="homepage-title"> {/* Changed class */}
            <span className="title-icon">🧾</span> {/* Changed class and icon */}
            Payment History
          </h1>
          <p className="homepage-subtitle"> {/* Changed class */}
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
            placeholder="Search by invoice number, user name, vehicle plate, or slot location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Payment Invoices Table */}
      <div className="admin-table-container">
        <table className="admin-table">
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
                  <td className="invoice-number">{invoice.invoiceNumber}</td>
                  <td>
                    <div className="user-info">
                      <div className="user-name">{invoice.userName}</div>
                      <div className="user-email">{invoice.userEmail}</div>
                    </div>
                  </td>
                  <td>
                    <div className="vehicle-info">
                      <div className="vehicle-plate">{invoice.vehiclePlate}</div>
                      <div className="vehicle-details">
                        {getVehicleIcon(invoice.vehicleType, 'w-4 h-4 mr-1')} {/* Added icon */}
                        {formatVehicleType(invoice.vehicleType)} {/* Used formatVehicleType */}
                      </div>
                    </div>
                  </td>
                  <td className="slot-location">{invoice.slotLocation}</td>
                  <td className="duration">{formatDuration(invoice.duration)}</td>
                  <td className="amount">{invoice.totalAmount} Taka</td>
                  <td className="payment-date">{formatDateTime(invoice.paymentDate)}</td>
                  <td>
                    <button
                      onClick={() => handleViewInvoice(invoice)}
                      className="action-button view-button"
                    >
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="slot-modal-overlay"> {/* Changed class */}
          <div className="slot-modal-card" onClick={(e) => e.stopPropagation()}> {/* Changed class */}
            <button onClick={closeInvoiceModal} className="slot-modal-close">×</button> {/* Changed class */}
            <div className="slot-modal-header"> {/* Changed class */}
              <div className="slot-modal-icon-wrapper"> {/* Added div */}
                <InvoiceIcon /> {/* Added icon */}
              </div>
              <h3 className="slot-modal-title">Payment Invoice</h3> {/* Changed class */}
              <p className="slot-modal-subtitle">Details of the selected payment</p> {/* Added subtitle */}
            </div>
            <div className="slot-modal-form"> {/* Changed class */}
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
                  <p><strong>Type:</strong> {formatVehicleType(selectedInvoice.vehicleType)}</p> {/* Used formatVehicleType */}
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
              <div className="modal-footer">
                <button
                  className="download-invoice-button"
                  onClick={() => alert(`Admin: Downloading invoice for ${selectedInvoice.id}`)} // Placeholder
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
