// src/components/Home.js
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const { token, user, loading, isSupervisor, isAdmin, isWorker } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && user && !loading) {
      if (isSupervisor) {
        navigate('/supervisor-dashboard');
      } else if (isAdmin) {
        navigate('/admin-dashboard');
      } else if (isWorker) {
        navigate('/worker-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    }
  }, [token, user, loading, isSupervisor, isAdmin, isWorker, navigate]);

  if (loading) {
    return <div className="text-center p-5">Loading...</div>;
  }

  const guestHomePage = (
    <div>
      {/* Hero Section */}
      <div className="text-center mb-5" style={{ padding: '5rem 0', background: 'var(--bg-gradient-soft)', borderRadius: 'var(--radius-xl)', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
        <div className="container" data-aos="fade-in-up">
          <h1 className="display-3 mb-3 text-gradient-rainbow float" style={{ fontSize: '4rem', fontWeight: '900' }}>
            🌱 Janaspandana
          </h1>
          <p className="lead" style={{ fontSize: '1.5rem', color: 'var(--text-medium)', maxWidth: '700px', margin: '0 auto 2rem' }}>
            Your one-stop solution for reporting and resolving civic issues in your area
          </p>
          <p className="text-muted mb-4" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Join our community to make your neighborhood a better place. Report issues, track progress, and engage with your community.
          </p>
          <div className="mt-4">
            <Link className="btn btn-primary btn-lg m-2" to="/login" role="button" style={{ minWidth: '150px' }}>
              🔐 Login
            </Link>
            <Link className="btn btn-secondary btn-lg m-2" to="/signup" role="button" style={{ minWidth: '150px' }}>
              ✨ Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container">
        <h2 className="text-center mb-5" style={{ fontSize: '2.5rem', fontWeight: '700' }}>Why Choose Janaspandana?</h2>
        <div className="row g-4 mt-3">
          <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
            <div className="card h-100 text-center hover-lift" style={{ border: 'none', padding: '2.5rem', background: 'var(--bg-white)' }}>
              <div className="float" style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>📝</div>
              <h4 style={{ color: 'var(--primary-green)', marginBottom: '1rem', fontWeight: '800' }}>Submit Reports</h4>
              <p className="text-muted">Report civic issues with photos and precise location tracking. Make your voice heard.</p>
            </div>
          </div>
          <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
            <div className="card h-100 text-center hover-lift" style={{ border: 'none', padding: '2.5rem', background: 'var(--bg-white)' }}>
              <div className="float" style={{ fontSize: '5rem', marginBottom: '1.5rem', animationDelay: '0.5s' }}>🗺️</div>
              <h4 style={{ color: 'var(--primary-green)', marginBottom: '1rem', fontWeight: '800' }}>View Nearby Issues</h4>
              <p className="text-muted">See what's happening in your area. Stay informed about local civic matters.</p>
            </div>
          </div>
          <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
            <div className="card h-100 text-center hover-lift" style={{ border: 'none', padding: '2.5rem', background: 'var(--bg-white)' }}>
              <div className="float" style={{ fontSize: '5rem', marginBottom: '1.5rem', animationDelay: '1s' }}>💬</div>
              <h4 style={{ color: 'var(--primary-green)', marginBottom: '1rem', fontWeight: '800' }}>Engage & Connect</h4>
              <p className="text-muted">Like and comment on reports. Build a stronger community together.</p>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="row g-4 mt-4">
          <div className="col-md-6" data-aos="slide-in-right" data-aos-delay="400">
            <div className="card h-100 hover-lift glow" style={{ border: 'none', padding: '2.5rem', background: 'var(--bg-gradient-soft)' }}>
              <div className="d-flex align-items-center mb-3">
                <div className="pulse-animation" style={{ fontSize: '3rem', marginRight: '1.5rem' }}>🤖</div>
                <h5 style={{ margin: 0, color: 'var(--primary-green)', fontWeight: '800' }}>AI-Powered Insights</h5>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>Advanced AI helps prioritize issues and predict resource needs for faster resolution.</p>
            </div>
          </div>
          <div className="col-md-6" data-aos="slide-in-left" data-aos-delay="500">
            <div className="card h-100 hover-lift glow" style={{ border: 'none', padding: '2.5rem', background: 'var(--bg-gradient-soft)' }}>
              <div className="d-flex align-items-center mb-3">
                <div className="pulse-animation" style={{ fontSize: '3rem', marginRight: '1.5rem', animationDelay: '0.5s' }}>⚡</div>
                <h5 style={{ margin: 0, color: 'var(--accent-earth)', fontWeight: '800' }}>Real-Time Updates</h5>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>Track the status of your reports in real-time. Get notified when issues are resolved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return guestHomePage;
}

export default Home;