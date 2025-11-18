// src/components/dashboards/SupervisorDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function SupervisorDashboard() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone_number: ''
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await axios.get('/api/auth/admins');
      setAdmins(res.data);
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/create-admin', formData);
      alert('Admin created successfully!');
      setFormData({ full_name: '', email: '', password: '', phone_number: '' });
      setShowCreateForm(false);
      fetchAdmins();
    } catch (err) {
      console.error('Error creating admin:', err);
      alert('Error: ' + (err.response?.data?.msg || 'Failed to create admin'));
    }
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fade-in">
      <div className="mb-5" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(74, 124, 89, 0.08) 0%, rgba(139, 154, 122, 0.08) 100%)', borderRadius: 'var(--radius-lg)' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>
              👔 Supervisor Dashboard
            </h2>
            <p className="text-muted mb-0">Welcome, {user?.full_name} - Manage admin accounts</p>
          </div>
          <button
            className="btn btn-primary btn-lg mt-3 mt-md-0"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? '❌ Cancel' : '➕ Create Admin'}
          </button>
        </div>
      </div>

      {/* Create Admin Form */}
      {showCreateForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Create New Admin Account</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateAdmin}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="full_name"
                    value={formData.full_name}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={onChange}
                    minLength="6"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                Create Admin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admins List */}
      {admins.length > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Created Admin Accounts</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin._id}>
                      <td>{admin.full_name}</td>
                      <td>{admin.email}</td>
                      <td>{admin.phone_number}</td>
                      <td>{new Date(admin.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Supervisor Information</h5>
        </div>
        <div className="card-body">
          <p><strong>Role:</strong> Supervisor</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Name:</strong> {user?.full_name}</p>
          <hr />
          <p className="text-muted">
            As a supervisor, you can create admin accounts. Admins can then create worker accounts.
            Only 5 supervisor accounts are allowed in the system.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SupervisorDashboard;

