// src/components/CreateWorker.js
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function CreateWorker() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone_number: ''
  });
  const [message, setMessage] = useState('');

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/create-worker', formData);
      setMessage('Worker created successfully!');
      setFormData({ full_name: '', email: '', password: '', phone_number: '' });
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.msg || 'Failed to create worker'));
    }
  };

  return (
    <div className="row fade-in">
      <div className="col-md-6 mx-auto">
        <div className="card" style={{ border: 'none', boxShadow: 'var(--shadow-lg)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--primary-indigo) 0%, var(--primary-indigo-dark) 100%)', color: 'white' }}>
            <h5 className="mb-0" style={{ color: 'white', fontWeight: '700', fontSize: '1.5rem' }}>
              👷 Create Worker Account
            </h5>
          </div>
          <div className="card-body">
            {message && (
              <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
                {message}
              </div>
            )}
            <form onSubmit={onSubmit}>
              <div className="mb-3">
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
              <div className="mb-3">
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
              <div className="mb-3">
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
              <div className="mb-3">
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
              <div className="d-grid">
                <button type="submit" className="btn btn-primary">
                  Create Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateWorker;

