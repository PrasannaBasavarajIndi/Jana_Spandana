// src/components/layout/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AppNavbar() {
  const { token, user, logout, isSupervisor, isAdmin, isWorker, isCitizen } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (isSupervisor) return '/supervisor-dashboard';
    if (isAdmin) return '/admin-dashboard';
    if (isWorker) return '/worker-dashboard';
    return '/user-dashboard';
  };

  const authLinks = (
    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
      <li className="nav-item">
        <Link className="nav-link" to={getDashboardLink()}>
          Dashboard
        </Link>
      </li>
      {isCitizen && (
        <li className="nav-item">
          <Link className="nav-link" to="/submit-report">New Report</Link>
        </li>
      )}
      {isAdmin && (
        <li className="nav-item">
          <Link className="nav-link" to="/create-worker">Create Worker</Link>
        </li>
      )}
      <li className="nav-item">
        <span className="nav-link text-light">
          {user?.full_name || 'User'} ({user?.role || 'CITIZEN'})
        </span>
      </li>
      <li className="nav-item">
        <a onClick={handleLogout} className="nav-link" href="#!" style={{ cursor: 'pointer' }}>
          Logout
        </a>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
      <li className="nav-item">
        <Link className="nav-link" to="/signup">Sign Up</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/login">Login</Link>
      </li>
    </ul>
  );

  // Navbar styles to prevent interference
  const navStyles = {
    position: 'relative',
    zIndex: 100, // Lower than the login form's z-index
    backgroundColor: 'var(--primary-green)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={navStyles}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/" style={{ fontSize: '1.75rem', fontWeight: '800' }}>
          <span style={{ marginRight: '0.5rem' }}>🌱</span>
          <span>Janaspandana</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ border: 'none', padding: '0.5rem' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          {token ? authLinks : guestLinks}
        </div>
      </div>
    </nav>
  );
}

export default AppNavbar;