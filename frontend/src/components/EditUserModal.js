import React, { useState, useEffect } from 'react';
import '../styles/custom-slotmodal.css'; // Import the custom styles

const EditUserModal = ({ user, onClose, onUpdate, actionLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    role: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        contact: user.contact || '',
        role: user.role || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ ...user, ...formData });
  };

  return (
    <div className="slot-modal-overlay" onClick={onClose}>
      <div className="slot-modal-card" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="slot-modal-close" aria-label="Close modal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="slot-modal-content">
          <h2 className="slot-modal-title">Edit User</h2>
          <form onSubmit={handleSubmit} className="slot-modal-form">
            <div className="form-group">
              <label htmlFor="name" className="slot-modal-label">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="slot-modal-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="slot-modal-label">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="slot-modal-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact" className="slot-modal-label">Contact</label>
              <input
                type="text"
                name="contact"
                id="contact"
                value={formData.contact}
                onChange={handleChange}
                className="slot-modal-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="role" className="slot-modal-label">Role</label>
              <select
                name="role"
                id="role"
                value={formData.role}
                onChange={handleChange}
                className="slot-modal-input"
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="slot-modal-actions">
              <button
                type="submit"
                className="slot-modal-btn primary"
                disabled={actionLoading}
              >
                {actionLoading ? 'Updating...' : 'Update User'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="slot-modal-btn secondary"
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;