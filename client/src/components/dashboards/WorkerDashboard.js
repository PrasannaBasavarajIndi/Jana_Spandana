// src/components/dashboards/WorkerDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ReportMap from '../ReportMap';

function WorkerDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [formData, setFormData] = useState({
    assigned_workforce: '',
    assigned_budget: '',
    status: 'PENDING'
  });
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [modelStats, setModelStats] = useState(null);

  useEffect(() => {
    fetchReports();
    fetchModelStats();
  }, []);

  const fetchModelStats = async () => {
    try {
      const res = await axios.get('/api/reports/ai/model-stats');
      setModelStats(res.data);
    } catch (err) {
      console.error('Error fetching model stats:', err);
    }
  };

  const fetchAISuggestions = async (reportId) => {
    setLoadingSuggestions(true);
    try {
      const res = await axios.get(`/api/reports/${reportId}/ai-suggestions`);
      setAiSuggestions(res.data);
      // Auto-fill form with AI suggestions
      setFormData(prev => ({
        ...prev,
        assigned_workforce: res.data.predictedWorkforce || prev.assigned_workforce,
        assigned_budget: res.data.predictedBudget || prev.assigned_budget
      }));
    } catch (err) {
      console.error('Error fetching AI suggestions:', err);
      alert('Error getting AI suggestions: ' + (err.response?.data?.msg || 'Failed to get suggestions'));
    } finally {
      setLoadingSuggestions(false);
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

  const handleAssign = async (reportId) => {
    try {
      const payload = {
        assigned_workforce: parseInt(formData.assigned_workforce) || 0,
        assigned_budget: parseFloat(formData.assigned_budget) || 0,
        status: formData.status
      };

      await axios.put(`/api/reports/${reportId}/assign`, payload);
      alert('Report updated successfully!');
      setSelectedReport(null);
      setFormData({ assigned_workforce: '', assigned_budget: '', status: 'PENDING' });
      fetchReports();
    } catch (err) {
      console.error('Error updating report:', err);
      alert('Error: ' + (err.response?.data?.msg || 'Failed to update report'));
    }
  };

  const openAssignModal = (report) => {
    setSelectedReport(report);
    setFormData({
      assigned_workforce: report.assigned_workforce || '',
      assigned_budget: report.assigned_budget || '',
      status: report.status || 'PENDING'
    });
    setAiSuggestions(null); // Clear previous suggestions
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'warning';
      case 'WORKING': return 'primary';
      case 'CLEARED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div>
      <div className="mb-5 scale-in" data-aos="fade-down" style={{ padding: '2.5rem', background: 'var(--bg-gradient-soft)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>
          🔧 Worker Dashboard
        </h2>
        <p className="text-muted mb-0">Welcome, {user?.full_name} - Manage and assign resources to reports</p>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4 g-4">
        <div className="col-md-3" data-aos="zoom-in" data-aos-delay="100">
          <div className="card text-center h-100 hover-lift" style={{ border: 'none', background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 183, 77, 0.15) 100%)' }}>
            <div className="card-body" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⏳</div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--warning-amber)', marginBottom: '0.5rem' }}>
                {reports.filter(r => r.status === 'PENDING').length}
              </h3>
              <p className="card-text text-muted mb-0" style={{ fontWeight: '600' }}>Pending</p>
            </div>
          </div>
        </div>
        <div className="col-md-3" data-aos="zoom-in" data-aos-delay="200">
          <div className="card text-center h-100 hover-lift" style={{ border: 'none', background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(100, 181, 246, 0.15) 100%)' }}>
            <div className="card-body" style={{ padding: '2rem' }}>
              <div className="float" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔨</div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--info-sky)', marginBottom: '0.5rem' }}>
                {reports.filter(r => r.status === 'WORKING').length}
              </h3>
              <p className="card-text text-muted mb-0" style={{ fontWeight: '600' }}>Working</p>
            </div>
          </div>
        </div>
        <div className="col-md-3" data-aos="zoom-in" data-aos-delay="300">
          <div className="card text-center h-100 hover-lift" style={{ border: 'none', background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(111, 207, 114, 0.15) 100%)' }}>
            <div className="card-body" style={{ padding: '2rem' }}>
              <div className="float" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--success-emerald)', marginBottom: '0.5rem' }}>
                {reports.filter(r => r.status === 'CLEARED').length}
              </h3>
              <p className="card-text text-muted mb-0" style={{ fontWeight: '600' }}>Cleared</p>
            </div>
          </div>
        </div>
        <div className="col-md-3" data-aos="zoom-in" data-aos-delay="400">
          <div className="card text-center h-100 hover-lift" style={{ border: 'none', background: 'linear-gradient(135deg, rgba(45, 134, 89, 0.15) 0%, rgba(107, 157, 122, 0.15) 100%)' }}>
            <div className="card-body" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📊</div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>
                {reports.length}
              </h3>
              <p className="card-text text-muted mb-0" style={{ fontWeight: '600' }}>Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="card mb-4" style={{ border: 'none', overflow: 'hidden' }}>
        <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--primary-indigo) 0%, var(--primary-indigo-dark) 100%)', color: 'white' }}>
          <h5 className="mb-0" style={{ color: 'white', fontWeight: '700' }}>🗺️ Reports Map</h5>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ padding: '1rem' }}>
            <ReportMap reports={reports} />
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="card" style={{ border: 'none' }}>
        <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--primary-indigo) 0%, var(--primary-indigo-dark) 100%)', color: 'white' }}>
          <h5 className="mb-0" style={{ color: 'white', fontWeight: '700' }}>📋 All Reports</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Priority</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Workforce</th>
                  <th>Budget</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td>
                      {report.media_urls && report.media_urls.length > 0 ? (
                        <img
                          src={report.media_urls[0]}
                          alt={report.title}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-muted">No image</span>
                      )}
                    </td>
                    <td>
                      {report.priority_score !== undefined && (
                        <span className={`badge ${report.priority_score >= 70 ? 'bg-danger' : report.priority_score >= 50 ? 'bg-warning' : 'bg-info'}`}>
                          {report.priority_score}
                        </span>
                      )}
                    </td>
                    <td>{report.title}</td>
                    <td><span className="badge bg-secondary">{report.report_type}</span></td>
                    <td>
                      <span className={`badge bg-${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td>{report.assigned_workforce || '-'}</td>
                    <td>{report.assigned_budget ? `₹${report.assigned_budget}` : '-'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => openAssignModal(report)}
                      >
                        Assign/Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {selectedReport && (
        <div className="modal show d-block fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedReport(null)}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ border: 'none', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, var(--primary-indigo) 0%, var(--primary-indigo-dark) 100%)', borderBottom: 'none' }}>
                <h5 className="modal-title" style={{ color: 'white', fontWeight: '700', fontSize: '1.5rem' }}>
                  🔧 Assign Resources - {selectedReport.title}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedReport(null)}></button>
              </div>
              <div className="modal-body" style={{ padding: '2rem', maxHeight: '80vh', overflowY: 'auto' }}>
                {/* Display Images */}
                {selectedReport.media_urls && selectedReport.media_urls.length > 0 && (
                  <div className="mb-3">
                    <strong>Report Images:</strong>
                    <div className="row mt-2">
                      {selectedReport.media_urls.map((url, idx) => (
                        <div key={idx} className="col-md-6 mb-2">
                          <img
                            src={url}
                            alt={`Report image ${idx + 1}`}
                            className="img-fluid rounded"
                            style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Suggestions Section */}
                <div className="card mb-3" style={{ 
                  background: 'linear-gradient(135deg, rgba(74, 124, 89, 0.08) 0%, rgba(139, 154, 122, 0.08) 100%)', 
                  border: '2px solid var(--primary-indigo)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0" style={{ fontWeight: '700', color: 'var(--primary-indigo)', fontSize: '1.1rem' }}>
                        🤖 AI-Powered Suggestions
                      </h6>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => fetchAISuggestions(selectedReport._id)}
                        disabled={loadingSuggestions}
                        style={{ minWidth: '150px' }}
                      >
                        {loadingSuggestions ? '⏳ Loading...' : '✨ Get AI Suggestions'}
                      </button>
                    </div>
                    {modelStats && (
                      <small className="text-muted d-block mb-2">
                        Model Status: {modelStats.trained ? '✓ Trained' : '⚠ Not Trained'} | 
                        Confidence: {Math.round(modelStats.confidence * 100)}%
                      </small>
                    )}
                    {aiSuggestions && (
                      <div className="mt-2">
                        <div className="alert alert-info mb-2">
                          <strong>Suggested Workforce:</strong> {aiSuggestions.predictedWorkforce} workers
                          <br />
                          <strong>Suggested Budget:</strong> ₹{aiSuggestions.predictedBudget.toLocaleString()}
                          <br />
                          <small>Confidence: {Math.round(aiSuggestions.confidence * 100)}%</small>
                        </div>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              assigned_workforce: aiSuggestions.predictedWorkforce,
                              assigned_budget: aiSuggestions.predictedBudget
                            }));
                          }}
                        >
                          Use AI Suggestions
                        </button>
                        {aiSuggestions.reasoning && (
                          <details className="mt-2">
                            <summary className="text-muted small" style={{ cursor: 'pointer' }}>View Reasoning</summary>
                            <div className="mt-2 small">
                              <p><strong>Report Type:</strong> {aiSuggestions.reasoning.factors.reportType}</p>
                              <p><strong>Priority Score:</strong> {aiSuggestions.reasoning.factors.priorityScore}</p>
                              <p><strong>Nearby Reports:</strong> {aiSuggestions.reasoning.factors.nearbyReports}</p>
                            </div>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Assigned Workforce</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.assigned_workforce}
                    onChange={(e) => setFormData({ ...formData, assigned_workforce: e.target.value })}
                    min="0"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Assigned Budget (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.assigned_budget}
                    onChange={(e) => setFormData({ ...formData, assigned_budget: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="WORKING">Working</option>
                    <option value="CLEARED">Cleared</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div className="mt-3">
                  <p><strong>Description:</strong> {selectedReport.description}</p>
                  <p><strong>Address:</strong> {selectedReport.address_text || 'N/A'}</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedReport(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleAssign(selectedReport._id)}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkerDashboard;

