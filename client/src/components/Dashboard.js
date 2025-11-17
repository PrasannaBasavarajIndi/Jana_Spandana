// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ReportMap from './ReportMap'; // We'll use this (it's already created)

function Dashboard() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // This is the only code that should be in useEffect
    const getReports = async () => {
      try {
        // Use the full URL
        const res = await axios.get('http://localhost:5000/api/reports');
        setReports(res.data);
      } catch (err) {
        console.error('Error fetching reports:', err);
      }
    };
    
    getReports();
  }, []); // The empty array [] ensures this runs ONLY ONCE

  return (
    <div>
      <h2 className="mb-4">Live Report Dashboard</h2>
      
      <div className="mb-3">
        <Link to="/submit-report" className="btn btn-primary">
          Submit a New Report
        </Link>
      </div>

      {/* --- Map Component --- */}
      {reports.length > 0 ? (
        <ReportMap reports={reports} />
      ) : (
        <p>Loading map or no reports found...</p>
      )}

      {/* --- List Component --- */}
      <h3 className="mt-4">All Reports (List)</h3>
      <div className="list-group">
        {reports.map((report) => (
          <div key={report._id} className="list-group-item list-group-item-action flex-column align-items-start mb-2 shadow-sm">
            <div className="d-flex w-100 justify-content-between">
              <h5 className="mb-1">{report.title}</h5>
              <small>Status: <span className="badge bg-warning text-dark">{report.status}</span></small>
            </div>
            <p className="mb-1">{report.description}</p>
            <small className="text-muted">Type: {report.report_type}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;