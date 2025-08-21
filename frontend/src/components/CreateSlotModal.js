import React, { useState, useEffect } from 'react'; // Import useEffect
import { getVehicleIcon } from './VehicleIcons';
import { createSlot, getSlots } from '../services/api'; // Import getSlots

// Icon component for better visual appeal
const PlusIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const LocationIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const CreateSlotModal = ({ onClose, onCreateSlot }) => {
  const [slotData, setSlotData] = useState({
    location: '', // Maps to backend 'location'
    vehicleType: 'car', // Maps to backend 'vehicleType'
  });
  const [formError, setFormError] = useState('');
  const [existingSlotLocations, setExistingSlotLocations] = useState([]);

  // Fetch existing slots when the modal opens
  useEffect(() => {
    const fetchExistingSlots = async () => {
      try {
        const response = await getSlots();
        setExistingSlotLocations(response.map(slot => slot.location));
      } catch (error) {
        console.error('Error fetching existing slots:', error);
        // Optionally, set a form error here if fetching fails
      }
    };
    fetchExistingSlots();
    setFormError(''); // Clear previous errors when modal opens
  }, []); // Empty dependency array means this runs once on mount

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSlotData({
      ...slotData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setFormError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation for duplicate slot location
    if (existingSlotLocations.includes(slotData.location)) {
      setFormError('A slot with this location already exists. Please choose a different one.');
      return;
    }

    // Basic validation for required fields
    if (!slotData.location || !slotData.vehicleType) {
      setFormError('Please fill in all required fields.');
      return;
    }

    // Prepare data for backend
    const dataToSend = {
      ...slotData,
    };

    // Call the onCreateSlot prop, which is now connected to the actual API call
    onCreateSlot(dataToSend);
    // Reset form and close modal after successful submission (handled by AdminDashboard)
    setSlotData({
      location: '',
      vehicleType: 'car',
    });
    onClose(); // Close modal after submission
  };

  return (
    <div className="slot-modal-overlay" onClick={onClose}>
      <div className="slot-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="slot-modal-close"
          aria-label="Close modal"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="slot-modal-content">
          {/* Header Section */}
          <div className="slot-modal-header">
            <div className="slot-modal-icon-wrapper">
              <PlusIcon />
            </div>
            <h3 className="slot-modal-title">Create New Slot</h3>
            <p className="slot-modal-subtitle">Add a new parking slot to the system</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="slot-modal-form">
            {formError && <p className="text-danger" style={{ marginBottom: '1rem' }}>{formError}</p>} {/* Display error message */}

            <div className="form-group">
              <label htmlFor="location" className="slot-modal-label">
                <LocationIcon />
                Slot Location
              </label>
              <input
                type="text"
                id="location"
                name="location" // Add name attribute
                value={slotData.location}
                onChange={handleChange}
                className="slot-modal-input"
                placeholder="e.g., A-01, B-15, C-03"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="vehicleType" className="slot-modal-label"> {/* Change htmlFor and name */}
                <span style={{
                  width: '1.2em',
                  height: '1.2em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginRight: '0.5rem'
                }}>
                  {getVehicleIcon(slotData.vehicleType || 'car', 'w-full h-full')} {/* Use slotData.vehicleType */}
                </span>
                Vehicle Type
              </label>
              <select
                id="vehicleType" // Change id
                name="vehicleType" // Add name attribute
                value={slotData.vehicleType}
                onChange={handleChange}
                className="slot-modal-input"
                required
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="suv">SUV</option>
                <option value="van">Van</option>
                <option value="minibus">Minibus</option>
              </select>
            </div>

            

            {/* Action Buttons */}
            <div className="slot-modal-actions">
              <div className="action-buttons-group">
                <button type="submit" className="slot-modal-btn primary">
                  Create Slot
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="slot-modal-btn disabled"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
);
};

export default CreateSlotModal;