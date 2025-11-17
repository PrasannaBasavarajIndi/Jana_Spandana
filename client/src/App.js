// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AOS from 'aos';

// Import Components
import AppNavbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import ReportForm from './components/ReportForm';

// Dashboard Components
import UserDashboard from './components/dashboards/UserDashboard';
import WorkerDashboard from './components/dashboards/WorkerDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import SupervisorDashboard from './components/dashboards/SupervisorDashboard';
import CreateWorker from './components/CreateWorker';

// Component to refresh AOS on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    AOS.refresh();
  }, [pathname]);

  return null;
}

function App() {
  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-in-out',
      offset: 100
    });
  }, []);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AppNavbar />
        <div className="container mt-4">
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            
            {/* --- Protected Routes --- */}
            <Route 
              path="/submit-report" 
              element={
                <ProtectedRoute>
                  <ReportForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user-dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/worker-dashboard" 
              element={
                <ProtectedRoute>
                  <WorkerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/supervisor-dashboard" 
              element={
                <ProtectedRoute>
                  <SupervisorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-worker" 
              element={
                <ProtectedRoute>
                  <CreateWorker />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;