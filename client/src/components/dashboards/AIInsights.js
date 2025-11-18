// src/components/dashboards/AIInsights.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function AIInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const res = await axios.get('/api/reports/ai/insights');
      setInsights(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching AI insights:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-5">Loading AI Insights...</div>;
  }

  if (!insights) {
    return <div className="text-center p-5">Error loading AI insights</div>;
  }

  return (
    <div className="fade-in">
      <div className="mb-4" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(74, 124, 89, 0.1) 0%, rgba(139, 154, 122, 0.1) 100%)', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>
          🤖 AI-Powered Insights
        </h2>
        <p className="text-muted mb-0">Advanced analytics and predictions powered by machine learning</p>
      </div>

      {/* AI Features Status */}
      <div className="card mb-4" style={{ border: 'none' }}>
        <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--primary-indigo) 0%, var(--primary-indigo-dark) 100%)', color: 'white' }}>
          <h5 className="mb-0" style={{ color: 'white', fontWeight: '700' }}>⚙️ AI Features Status</h5>
        </div>
        <div className="card-body">
          <div className="row">
            {Object.entries(insights.aiFeatures).map(([feature, status]) => (
              <div key={feature} className="col-md-4 mb-2">
                <div className="d-flex align-items-center">
                  <span className="badge bg-success me-2">✓</span>
                  <span>{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High Priority Reports */}
      <div className="card mb-4" style={{ border: 'none' }}>
        <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--error-rose) 0%, var(--error-rose-light) 100%)', color: 'white' }}>
          <h5 className="mb-0" style={{ color: 'white', fontWeight: '700' }}>🔴 High Priority Reports (AI-Sorted)</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {insights.highPriorityReports.map((report) => (
                  <tr key={report._id}>
                    <td>
                      <span className={`badge ${report.priority_score >= 70 ? 'bg-danger' : report.priority_score >= 50 ? 'bg-warning' : 'bg-info'}`}>
                        {report.priority_score}
                      </span>
                    </td>
                    <td>{report.title}</td>
                    <td><span className="badge bg-secondary">{report.report_type}</span></td>
                    <td>
                      <span className={`badge bg-${report.status === 'PENDING' ? 'warning' : report.status === 'WORKING' ? 'info' : 'success'}`}>
                        {report.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${report.sentiment_analysis?.sentiment === 'positive' ? 'success' : report.sentiment_analysis?.sentiment === 'negative' ? 'danger' : 'secondary'}`}>
                        {report.sentiment_analysis?.sentiment || 'neutral'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Risk Areas */}
      {insights.riskAreas && insights.riskAreas.length > 0 && (
        <div className="card mb-4" style={{ border: 'none' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--warning-amber) 0%, var(--warning-amber-light) 100%)', color: 'white' }}>
            <h5 className="mb-0" style={{ color: 'white', fontWeight: '700' }}>⚠️ High-Risk Areas (Predictive Analytics)</h5>
          </div>
          <div className="card-body">
            <div className="row">
              {insights.riskAreas.map((area, idx) => (
                <div key={idx} className="col-md-6 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h6>Risk Area #{idx + 1}</h6>
                      <p className="mb-1"><strong>Risk Score:</strong> {area.riskScore}</p>
                      <p className="mb-1"><strong>Reports:</strong> {area.count}</p>
                      <p className="mb-1"><strong>Location:</strong> {area.location.lat.toFixed(4)}, {area.location.lng.toFixed(4)}</p>
                      <div className="mt-2">
                        <strong>Report Types:</strong>
                        {Object.entries(area.types).map(([type, count]) => (
                          <span key={type} className="badge bg-secondary ms-1">{type}: {count}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sentiment Analysis */}
      <div className="row mb-4 g-4">
        <div className="col-md-6">
          <div className="card" style={{ border: 'none' }}>
            <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--info-sky) 0%, var(--info-sky-light) 100%)', color: 'white' }}>
              <h5 className="mb-0" style={{ color: 'white', fontWeight: '700' }}>💬 Sentiment Analysis</h5>
            </div>
            <div className="card-body">
              <div className="mb-2">
                <div className="d-flex justify-content-between mb-1">
                  <span>Positive</span>
                  <span>{insights.sentimentAnalysis.positive}</span>
                </div>
                <div className="progress" style={{ height: '25px' }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{
                      width: `${(insights.sentimentAnalysis.positive / (insights.sentimentAnalysis.positive + insights.sentimentAnalysis.negative + insights.sentimentAnalysis.neutral)) * 100}%`
                    }}
                  >
                    {insights.sentimentAnalysis.positive}
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <div className="d-flex justify-content-between mb-1">
                  <span>Negative</span>
                  <span>{insights.sentimentAnalysis.negative}</span>
                </div>
                <div className="progress" style={{ height: '25px' }}>
                  <div
                    className="progress-bar bg-danger"
                    role="progressbar"
                    style={{
                      width: `${(insights.sentimentAnalysis.negative / (insights.sentimentAnalysis.positive + insights.sentimentAnalysis.negative + insights.sentimentAnalysis.neutral)) * 100}%`
                    }}
                  >
                    {insights.sentimentAnalysis.negative}
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <div className="d-flex justify-content-between mb-1">
                  <span>Neutral</span>
                  <span>{insights.sentimentAnalysis.neutral}</span>
                </div>
                <div className="progress" style={{ height: '25px' }}>
                  <div
                    className="progress-bar bg-secondary"
                    role="progressbar"
                    style={{
                      width: `${(insights.sentimentAnalysis.neutral / (insights.sentimentAnalysis.positive + insights.sentimentAnalysis.negative + insights.sentimentAnalysis.neutral)) * 100}%`
                    }}
                  >
                    {insights.sentimentAnalysis.neutral}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card" style={{ border: 'none' }}>
            <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--secondary-purple) 0%, var(--secondary-purple-light) 100%)', color: 'white' }}>
              <h5 className="mb-0" style={{ color: 'white', fontWeight: '700' }}>📊 AI Statistics</h5>
            </div>
            <div className="card-body">
              <p><strong>Duplicate Reports Detected:</strong> {insights.duplicateReports}</p>
              <p><strong>High Priority Reports:</strong> {insights.highPriorityReports.length}</p>
              <p><strong>Risk Areas Identified:</strong> {insights.riskAreas.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIInsights;

