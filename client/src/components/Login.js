// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; 

function Login() {
  const { setAuthToken } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState('CITIZEN'); // CITIZEN, SUPERVISOR, ADMIN, WORKER
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Demo credentials for each role
  const demoCredentials = {
    CITIZEN: {
      email: 'user@example.com',
      password: 'User123!',
      note: 'Sign up as a new citizen or use existing account'
    },
    SUPERVISOR: {
      email: 'supervisor1@janaspandana.com',
      password: 'Supervisor123!',
      note: 'Demo Supervisor Account (1-5 available)'
    },
    ADMIN: {
      email: 'admin@janaspandana.com',
      password: 'Admin123!',
      note: 'Create admin account via supervisor login'
    },
    WORKER: {
      email: 'worker@janaspandana.com',
      password: 'Worker123!',
      note: 'Create worker account via admin login'
    }
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    // Auto-fill demo credentials when switching
    if (demoCredentials[type]) {
      setFormData({
        email: demoCredentials[type].email,
        password: demoCredentials[type].password
      });
    }
  };

  const fillDemoCredentials = () => {
    if (demoCredentials[userType]) {
      setFormData({
        email: demoCredentials[userType].email,
        password: demoCredentials[userType].password
      });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('/api/auth/login', formData);

      // Use the context function to save the token
      await setAuthToken(res.data.token); 

      // Redirect based on role
      const userRes = await axios.get('/api/auth/me', {
        headers: { 'x-auth-token': res.data.token }
      });
      
      const role = userRes.data.role;
      if (role === 'SUPERVISOR') {
        navigate('/supervisor-dashboard');
      } else if (role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else if (role === 'WORKER') {
        navigate('/worker-dashboard');
      } else {
        navigate('/user-dashboard');
      }
      
    } catch (err) {
      console.error(err.response?.data);
      alert('Error: ' + (err.response?.data?.msg || 'Login failed'));
    }
  };

  // Add debug styles
  const debugStyles = {
    position: 'relative',
    zIndex: 1000, // Ensure it's above potential overlays
    pointerEvents: 'auto',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  // Debug function
  const handleClick = (e) => {
    console.log('Login container clicked', e);
    e.stopPropagation();
  };

  // Enhanced login container styles
  const loginContainerStyles = {
    ...debugStyles,
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1001
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <div className="row" onClick={handleClick} style={{ position: 'relative', width: '100%' }}>
        <div className="col-md-8 mx-auto" data-aos="zoom-in" style={loginContainerStyles}>
        <div className="card hover-lift" style={{ border: 'none', boxShadow: 'var(--shadow-xl)' }}>
          <div className="card-body" style={{ padding: '3.5rem' }}>
            <div className="text-center mb-4">
              <div className="float pulse-animation" style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🔐</div>
              <h2 className="card-title mb-2 text-gradient" style={{ fontSize: '3rem', fontWeight: '900' }}>Welcome Back</h2>
              <p className="text-muted" style={{ fontSize: '1.1rem' }}>Sign in to your account to continue</p>
            </div>
            
            {/* User Type Toggle */}
            <div className="mb-4">
              <label className="form-label fw-bold" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Login As:</label>
              <div className="btn-group w-100" role="group" style={{ boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <input
                  type="radio"
                  className="btn-check"
                  name="userType"
                  id="userTypeCitizen"
                  checked={userType === 'CITIZEN'}
                  onChange={() => handleUserTypeChange('CITIZEN')}
                />
                <label className="btn btn-outline-primary" htmlFor="userTypeCitizen">
                  👤 Citizen
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="userType"
                  id="userTypeSupervisor"
                  checked={userType === 'SUPERVISOR'}
                  onChange={() => handleUserTypeChange('SUPERVISOR')}
                />
                <label className="btn btn-outline-primary" htmlFor="userTypeSupervisor">
                  👔 Supervisor
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="userType"
                  id="userTypeAdmin"
                  checked={userType === 'ADMIN'}
                  onChange={() => handleUserTypeChange('ADMIN')}
                />
                <label className="btn btn-outline-primary" htmlFor="userTypeAdmin">
                  🛡️ Admin
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="userType"
                  id="userTypeWorker"
                  checked={userType === 'WORKER'}
                  onChange={() => handleUserTypeChange('WORKER')}
                />
                <label className="btn btn-outline-primary" htmlFor="userTypeWorker">
                  🔧 Worker
                </label>
              </div>
            </div>

            {/* Demo Credentials Display */}
            {demoCredentials[userType] && (
              <div className="alert alert-info mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Demo Credentials:</strong>
                    <div className="mt-2">
                      <small>
                        <strong>Email:</strong> {demoCredentials[userType].email}<br />
                        <strong>Password:</strong> {demoCredentials[userType].password}
                      </small>
                    </div>
                    <small className="text-muted d-block mt-2">
                      {demoCredentials[userType].note}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={fillDemoCredentials}
                  >
                    Fill Demo
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={onChange}
                  minLength="6"
                  required
                />
              </div>

              <div className="d-grid">
                <input type="submit" value="Login" className="btn btn-primary btn-lg" />
              </div>

              {userType === 'CITIZEN' && (
                <div className="text-center mt-3">
                  <small className="text-muted">
                    Don't have an account? <a href="/signup">Sign up here</a>
                  </small>
                </div>
              )}
            </form>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default Login;