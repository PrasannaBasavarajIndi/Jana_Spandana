// src/components/dashboards/UserDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ReportMap from '../ReportMap';

function UserDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [nearbyReports, setNearbyReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchReports();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          fetchNearbyReports(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.error('Error getting location:', err);
        }
      );
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

  const fetchNearbyReports = async (lat, lng) => {
    try {
      const res = await axios.get(`/api/reports/nearby?lat=${lat}&lng=${lng}&radius=5000`);
      setNearbyReports(res.data);
    } catch (err) {
      console.error('Error fetching nearby reports:', err);
    }
  };

  const handleLike = async (reportId) => {
    try {
      await axios.post(`/api/reports/${reportId}/like`);
      fetchReports();
      if (selectedReport && selectedReport._id === reportId) {
        const res = await axios.get(`/api/reports/${reportId}`);
        setSelectedReport(res.data);
      }
    } catch (err) {
      console.error('Error liking report:', err);
      alert('Error: ' + (err.response?.data?.msg || 'Failed to like report'));
    }
  };

  const handleComment = async (reportId) => {
    if (!commentText.trim()) return;
    
    try {
      await axios.post(`/api/reports/${reportId}/comment`, { text: commentText });
      setCommentText('');
      fetchReports();
      if (selectedReport && selectedReport._id === reportId) {
        const res = await axios.get(`/api/reports/${reportId}`);
        setSelectedReport(res.data);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Error: ' + (err.response?.data?.msg || 'Failed to add comment'));
    }
  };

  const isLiked = (report) => {
    if (!user || !report.likes) return false;
    return report.likes.some(like => {
      const likeId = typeof like === 'object' ? (like._id || like) : like;
      return likeId.toString() === user._id.toString();
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-5 scale-in" data-aos="fade-down" style={{ padding: '2.5rem', background: 'var(--bg-gradient-soft)', borderRadius: 'var(--radius-xl)', marginBottom: '2rem', boxShadow: 'var(--shadow-lg)' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>
            Welcome, {user?.full_name || 'User'}! 👋
          </h2>
          <p className="text-muted mb-0">Manage your reports and stay connected with your community</p>
        </div>
        <Link to="/submit-report" className="btn btn-primary btn-lg">
          ➕ Submit New Report
        </Link>
      </div>

      {/* Map Section */}
      <div className="card mb-4" style={{ border: 'none', overflow: 'hidden' }}>
        <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--primary-indigo) 0%, var(--primary-indigo-dark) 100%)', color: 'white' }}>
          <h5 className="mb-0" style={{ color: 'white', fontWeight: '700' }}>🗺️ Reports Map</h5>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ padding: '1rem' }}>
            <ReportMap reports={reports} center={userLocation ? [userLocation.lat, userLocation.lng] : null} />
          </div>
        </div>
      </div>

      {/* Nearby Reports Section */}
      {nearbyReports.length > 0 && (
        <div className="card mb-4" style={{ border: 'none' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--secondary-purple) 0%, var(--accent-violet) 100%)', color: 'white' }}>
            <h5 className="mb-0" style={{ color: 'white', fontWeight: '700' }}>📍 Nearby Reports (within 5km)</h5>
          </div>
          <div className="card-body">
            <div className="row">
              {nearbyReports.slice(0, 6).map((report) => (
                <div key={report._id} className="col-md-6 mb-3">
                  <div className="card h-100">
                    {report.media_urls && report.media_urls.length > 0 && (
                      <img
                        src={report.media_urls[0]}
                        className="card-img-top"
                        alt={report.title}
                        style={{ height: '150px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="card-body">
                      <h6 className="card-title">{report.title}</h6>
                      <p className="card-text text-muted small">{report.description}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className={`badge badge-${report.status.toLowerCase()}`}>
                          {report.status}
                        </span>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setSelectedReport(report)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Reports List */}
      <div className="card" style={{ border: 'none' }}>
        <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--primary-indigo) 0%, var(--primary-indigo-dark) 100%)', color: 'white' }}>
          <h5 className="mb-0" style={{ color: 'white', fontWeight: '700' }}>📋 All Reports</h5>
        </div>
        <div className="card-body">
          <div className="list-group">
            {reports.map((report) => (
              <div key={report._id} className="list-group-item">
                <div className="d-flex w-100 justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex gap-3">
                      {/* Report Image Thumbnail */}
                      {report.media_urls && report.media_urls.length > 0 && (
                        <div style={{ minWidth: '120px', maxWidth: '120px' }}>
                          <img
                            src={report.media_urls[0]}
                            alt={report.title}
                            className="img-fluid rounded"
                            style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{report.title}</h6>
                        <p className="mb-1 text-muted">{report.description}</p>
                        <div className="d-flex gap-2 align-items-center flex-wrap">
                      <span className={`badge badge-${report.status.toLowerCase()}`}>
                        {report.status}
                      </span>
                      <span className="badge bg-secondary">{report.report_type}</span>
                      {report.likes && (
                        <span className="text-muted small">
                          👍 {report.likes.length} likes
                        </span>
                      )}
                      {report.comments && (
                        <span className="text-muted small">
                          💬 {report.comments.length} comments
                        </span>
                      )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className={`btn btn-sm ${isLiked(report) ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleLike(report._id)}
                    >
                      👍 {report.likes?.length || 0}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setSelectedReport(report)}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="modal show d-block fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedReport(null)}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ border: 'none', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, var(--primary-indigo) 0%, var(--primary-indigo-dark) 100%)', borderBottom: 'none' }}>
                <h5 className="modal-title" style={{ color: 'white', fontWeight: '700', fontSize: '1.5rem' }}>{selectedReport.title}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedReport(null)}></button>
              </div>
              <div className="modal-body" style={{ padding: '2rem' }}>
                {/* Display Images */}
                {selectedReport.media_urls && selectedReport.media_urls.length > 0 && (
                  <div className="mb-3">
                    <strong>Images:</strong>
                    <div className="row mt-2">
                      {selectedReport.media_urls.map((url, idx) => (
                        <div key={idx} className="col-md-6 mb-2">
                          <img
                            src={url}
                            alt={`Report image ${idx + 1}`}
                            className="img-fluid rounded"
                            style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p><strong>Type:</strong> {selectedReport.report_type}</p>
                <p><strong>Status:</strong> <span className={`badge badge-${selectedReport.status.toLowerCase()}`}>{selectedReport.status}</span></p>
                <p><strong>Description:</strong> {selectedReport.description}</p>
                {selectedReport.address_text && (
                  <p><strong>Address:</strong> {selectedReport.address_text}</p>
                )}
                
                <div className="mt-3">
                  <button
                    className={`btn ${isLiked(selectedReport) ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleLike(selectedReport._id)}
                  >
                    👍 Like ({selectedReport.likes?.length || 0})
                  </button>
                </div>

                <div className="mt-4">
                  <h6>Comments</h6>
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button
                      className="btn btn-primary btn-sm mt-2"
                      onClick={() => handleComment(selectedReport._id)}
                    >
                      Post Comment
                    </button>
                  </div>
                  <div className="list-group">
                    {selectedReport.comments?.map((comment, idx) => (
                      <div key={idx} className="list-group-item">
                        <strong>{comment.user_id?.full_name || 'Anonymous'}</strong>
                        <p className="mb-0">{comment.text}</p>
                        <small className="text-muted">
                          {new Date(comment.created_at).toLocaleString()}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;

