import React, { useState } from 'react';

const CreateSlotModal = ({ onClose, onCreateSlot }) => {
  const [location, setLocation] = useState('');
  const [type, setType] = useState('car'); // Default type

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateSlot({ location, type });
    setLocation('');
    setType('car');
  };

  return (
    <div className="slot-modal-overlay">
      <div className="slot-modal-card">
        <button onClick={onClose} className="slot-modal-close">
          &times;
        </button>
        <h2>Create New Slot</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="location" className="slot-modal-label">Slot Location (e.g., A-01)</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="slot-modal-input"
            placeholder="Enter location"
            required
          />
          <label htmlFor="type" className="slot-modal-label">Slot Type</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="slot-modal-input"
            required
          >
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="suv">SUV</option>
            <option value="van">Van</option>
            <option value="minibus">Minibus</option>
          </select>
          <button type="submit" className="slot-modal-btn">Create Slot</button>
          <button type="button" onClick={onClose} className="slot-modal-btn" style={{ backgroundColor: '#ccc', marginTop: '10px' }}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default CreateSlotModal;
