// src/components/ReportForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Import useAuth

function ReportForm() {
  const navigate = useNavigate();
  const { token } = useAuth(); // 2. Get the token

  // Create a separate state for the image file
  const [file, setFile] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Fetching location...');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    report_type: 'Pothole',
    address_text: '',
    location: {
      type: 'Point',
      coordinates: [],
    },
  });

  const { title, description, report_type, address_text, location } = formData;

  // --- 1. AUTOMATIC LOCATION ON LOAD ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prevState) => ({
            ...prevState,
            location: {
              type: 'Point',
              coordinates: [
                position.coords.longitude,
                position.coords.latitude,
              ],
            },
          }));
          setLocationStatus(
            `Long: ${position.coords.longitude.toFixed(
              5
            )}, Lat: ${position.coords.latitude.toFixed(5)}`
          );
        },
        (err) => {
          setLocationStatus('Error: '.concat(err.message));
        }
      );
    } else {
      setLocationStatus('Geolocation is not supported by this browser.');
    }
  }, []);

  // --- 2. Handle Text & File Input Changes ---
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // --- 3. Handle Form Submission with FormData ---
  const onSubmit = async (e) => {
    e.preventDefault();
    if (location.coordinates.length === 0) {
      return alert('Please wait for location to be captured.');
    }
    if (!file) {
      return alert('Please upload an image for the report.');
    }

    const data = new FormData();
    data.append('image', file);
    data.append('title', title);
    data.append('description', description);
    data.append('report_type', report_type);
    data.append('address_text', address_text);
    data.append('location', JSON.stringify(location));

    try {
      // 3. Create config to add the token
      const config = {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data',
        },
      };

      // 4. Use the full URL and pass the config
      const res = await axios.post(
        'http://localhost:5000/api/reports',
        data,
        config
      );

      console.log(res.data);
      alert('Report Submitted Successfully!');
      navigate('/'); // Redirect to homepage
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.msg) {
        alert('Error submitting report: ' + err.response.data.msg);
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="row">
      <div className="col-md-8 mx-auto" data-aos="fade-up">
        <div className="card hover-lift" style={{ border: 'none', boxShadow: 'var(--shadow-xl)' }}>
          <div className="card-body" style={{ padding: '3.5rem' }}>
            <div className="text-center mb-4">
              <div className="float pulse-animation" style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>📝</div>
              <h2 className="card-title mb-2 text-gradient" style={{ fontSize: '3rem', fontWeight: '900' }}>
                Submit a New Report
              </h2>
              <p className="text-muted" style={{ fontSize: '1.1rem' }}>Help improve your community by reporting civic issues</p>
            </div>
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Title
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={title}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="report_type" className="form-label">
                  Report Type
                </label>
                <select
                  className="form-select"
                  id="report_type"
                  name="report_type"
                  value={report_type}
                  onChange={onChange}
                >
                  <option value="Pothole">Pothole</option>
                  <option value="Garbage">Garbage</option>
                  <option value="Street Light">Street Light</option>
                  <option value="Water Leak">Water Leak</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows="3"
                  value={description}
                  onChange={onChange}
                  required
                ></textarea>
              </div>

              <div className="mb-3">
                <label htmlFor="address_text" className="form-label">
                  Address or Landmark
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="address_text"
                  name="address_text"
                  value={address_text}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="image" className="form-label">
                  Upload Image (Required)
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="image"
                  name="image"
                  accept="image/*"
                  capture="environment"
                  onChange={onFileChange}
                  required
                />
                <div className="form-text">
                  You can upload a file or use 'capture' to open your camera.
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={locationStatus}
                  disabled
                />
              </div>

              <div className="d-grid">
                <input
                  type="submit"
                  value="Submit Report"
                  className="btn btn-primary"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportForm;