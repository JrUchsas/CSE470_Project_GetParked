import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUser, deleteUser } from '../services/api';
import EditUserModal from '../components/EditUserModal'; // Will create this component
import '../styles/custom-admin.css';

const AdminUserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Could not fetch users.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async (updatedUser) => {
    setActionLoading(true);
    setError('');
    try {
      await updateUser(updatedUser.id, updatedUser);
      setEditingUser(null);
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'An error occurred while updating user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setActionLoading(true);
      setError('');
      try {
        await deleteUser(id);
        fetchUsers(); // Refresh list
      } catch (err) {
        console.error('Error deleting user:', err);
        setError(err.response?.data?.message || 'An error occurred while deleting user.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  return (
    <div className="admin-dashboard-container">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Manage Users</h2>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <div className="admin-card">
          <p className="text-center text-gray-600">No users found.</p>
        </div>
      ) : (
        <div className="admin-card">
          <div className="overflow-x-auto w-full">
            <table className="admin-table min-w-full bg-white rounded-lg overflow-hidden shadow text-center mx-auto">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.contact || 'N/A'}</td>
                    <td>{user.role}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEdit(user)}
                          className="slot-modal-btn primary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', width: 'auto' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="slot-modal-btn danger"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', width: 'auto' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdate={handleUpdateUser}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default AdminUserManagementPage;