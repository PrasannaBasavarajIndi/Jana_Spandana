// src/components/dashboards/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ReportMap from '../ReportMap';
import AIInsights from './AIInsights';

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAIInsights, setShowAIInsights] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchReports();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/reports/stats/admin');
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await axios.get('/api/reports');
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  if (loading) {
    return <div className="text-center p-5">Loading...</div>;
  }

  if (!stats) {
    return <div className="text-center p-5">Error loading statistics</div>;
  }

  // Simple bar chart component
  const BarChart = ({ data, label, color }) => {
    const max = Math.max(...data.map(d => d.count), 1);
    return (
      <div className="mt-3">
        <h6 className="mb-2">{label}</h6>
        {data.map((item, idx) => (
          <div key={idx} className="mb-2">
            <div className="d-flex justify-content-between mb-1">
              <span>{item._id}</span>
              <span>{item.count}</span>
            </div>
            <div className="progress" style={{ height: '25px' }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: `${(item.count / max) * 100}%`,
                  backgroundColor: color
                }}
              >
                {item.count}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div className="mb-5" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(74, 124, 89, 0.08) 0%, rgba(139, 154, 122, 0.08) 100%)', borderRadius: 'var(--radius-lg)' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-green)', marginBottom: '0.5rem' }}>
              🛡️ Admin Dashboard
            </h2>
            <p className="text-muted mb-0">Welcome, {user?.full_name} - Manage your civic operations</p>
          </div>
          <div className="mt-3 mt-md-0">
            <button
              className="btn btn-secondary me-2 mb-2"
              onClick={() => setShowAIInsights(!showAIInsights)}
            >
              {showAIInsights ? '🙈 Hide' : '🤖 Show'} AI Insights
            </button>
            <button
              className="btn btn-info me-2 mb-2"
              onClick={async () => {
                try {
                  const res = await axios.post('/api/reports/ai/train-model');
                  alert(res.data.message || 'Model training completed');
                } catch (err) {
                  alert('Error training model: ' + (err.response?.data?.msg || err.message));
                }
              }}
            >
              🧠 Train ML Model
            </button>
            <Link to="/create-worker" className="btn btn-primary mb-2">
              👷 Create Worker
            </Link>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      {showAIInsights && (
        <div className="mb-4">
          <AIInsights />
        </div>
      )}

      {/* Summary Cards */}
      <div className="row mb-4 g-4">
        <div className="col-md-3">
          <div className="card text-center h-100" style={{ border: 'none', background: 'linear-gradient(135deg, rgba(74, 124, 89, 0.1) 0%, rgba(107, 157, 122, 0.1) 100%)' }}>
            <div className="card-body" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📋</div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-green)', marginBottom: '0.5rem' }}>
                {stats.summary.total}
              </h3>
              <p className="card-text text-muted mb-0" style={{ fontWeight: '600' }}>Total Reports</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center h-100" style={{ border: 'none', background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(232, 193, 154, 0.1) 100%)' }}>
            <div className="card-body" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⏳</div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--warning-amber)', marginBottom: '0.5rem' }}>
                {stats.summary.pending}
              </h3>
              <p className="card-text text-muted mb-0" style={{ fontWeight: '600' }}>Pending</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center h-100" style={{ border: 'none', background: 'linear-gradient(135deg, rgba(90, 143, 199, 0.1) 0%, rgba(122, 168, 217, 0.1) 100%)' }}>
            <div className="card-body" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔨</div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--info-blue)', marginBottom: '0.5rem' }}>
                {stats.summary.working}
              </h3>
              <p className="card-text text-muted mb-0" style={{ fontWeight: '600' }}>Working</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center h-100" style={{ border: 'none', background: 'linear-gradient(135deg, rgba(90, 138, 90, 0.1) 0%, rgba(122, 176, 122, 0.1) 100%)' }}>
            <div className="card-body" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--success-green)', marginBottom: '0.5rem' }}>
                {stats.summary.cleared}
              </h3>
              <p className="card-text text-muted mb-0" style={{ fontWeight: '600' }}>Cleared</p>
            </div>
          </div>
        </div>
      </div>

      {/* Efficiency Metrics */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Resolution Rate</h5>
            </div>
            <div className="card-body text-center">
              <h2 className="text-success">{stats.summary.resolutionRate}%</h2>
              <p className="text-muted">Reports Resolved</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Total Budget</h5>
            </div>
            <div className="card-body text-center">
              <h4>₹{stats.totalBudget.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Total Workforce</h5>
            </div>
            <div className="card-body text-center">
              <h4>{stats.totalWorkforce}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Reports by Type</h5>
            </div>
            <div className="card-body">
              <BarChart data={stats.byType} label="Report Types" color="#4a7c59" />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Status Distribution</h5>
            </div>
            <div className="card-body">
              <div className="mt-3">
                <div className="mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Pending</span>
                    <span>{stats.summary.pending}</span>
                  </div>
                  <div className="progress" style={{ height: '25px' }}>
                    <div
                      className="progress-bar bg-warning"
                      role="progressbar"
                      style={{
                        width: `${(stats.summary.pending / stats.summary.total) * 100}%`
                      }}
                    >
                      {stats.summary.pending}
                    </div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Working</span>
                    <span>{stats.summary.working}</span>
                  </div>
                  <div className="progress" style={{ height: '25px' }}>
                    <div
                      className="progress-bar bg-info"
                      role="progressbar"
                      style={{
                        width: `${(stats.summary.working / stats.summary.total) * 100}%`
                      }}
                    >
                      {stats.summary.working}
                    </div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Cleared</span>
                    <span>{stats.summary.cleared}</span>
                  </div>
                  <div className="progress" style={{ height: '25px' }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{
                        width: `${(stats.summary.cleared / stats.summary.total) * 100}%`
                      }}
                    >
                      {stats.summary.cleared}
                    </div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Rejected</span>
                    <span>{stats.summary.rejected}</span>
                  </div>
                  <div className="progress" style={{ height: '25px' }}>
                    <div
                      className="progress-bar bg-danger"
                      role="progressbar"
                      style={{
                        width: `${(stats.summary.rejected / stats.summary.total) * 100}%`
                      }}
                    >
                      {stats.summary.rejected}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="card mb-4" style={{ border: 'none', overflow: 'hidden' }}>
        <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%)', color: 'white' }}>
          <h5 className="mb-0" style={{ color: 'white', fontWeight: '700' }}>🗺️ Reports Map</h5>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ padding: '1rem' }}>
            <ReportMap reports={reports} />
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="card" style={{ border: 'none' }}>
        <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%)', color: 'white' }}>
          <h5 className="mb-0" style={{ color: 'white', fontWeight: '700' }}>📋 Recent Reports</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Workforce</th>
                  <th>Budget</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reports.slice(0, 10).map((report) => (
                  <tr key={report._id}>
                    <td>
                      {report.media_urls && report.media_urls.length > 0 ? (
                        <img
                          src={report.media_urls[0]}
                          alt={report.title}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
                          onClick={() => window.open(report.media_urls[0], '_blank')}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-muted">No image</span>
                      )}
                    </td>
                    <td>{report.title}</td>
                    <td><span className="badge bg-secondary">{report.report_type}</span></td>
                    <td>
                      <span className={`badge bg-${report.status === 'PENDING' ? 'warning' : report.status === 'WORKING' ? 'info' : report.status === 'CLEARED' ? 'success' : 'danger'}`}>
                        {report.status}
                      </span>
                    </td>
                    <td>{report.assigned_workforce || '-'}</td>
                    <td>{report.assigned_budget ? `₹${report.assigned_budget}` : '-'}</td>
                    <td>{new Date(report.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

