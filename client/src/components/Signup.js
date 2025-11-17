// src/components/Signup.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

function Signup() {
  // 1. Create 'state' to hold the form data
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: ''
  });

  // 2. A function to update state when user types
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. A function to handle the form submission
  const onSubmit = async (e) => {
    e.preventDefault(); // Prevents the browser from refreshing

    try {
      // 4. Send the data to our backend API
      // Because of the "proxy" we set in package.json,
      // we can just use "/api/auth/signup"
      const res = await axios.post('/api/auth/signup', formData);

      console.log('Success!', res.data); // res.data contains the { "token": "..." }
      //alert('Signup Successful!');
      navigate('/');
      // TODO: Save the token and redirect the user

    } catch (err) {
      console.error(err.response.data);
      alert('Error: ' + err.response.data.msg);
    }
  };

  // ... (all your existing code: useState, onChange, onSubmit...)

  return (
    <div className="row">
      <div className="col-md-6 mx-auto" data-aos="zoom-in">
        <div className="card hover-lift" style={{ border: 'none', boxShadow: 'var(--shadow-xl)' }}>
          <div className="card-body" style={{ padding: '3.5rem' }}>
            <div className="text-center mb-4">
              <div className="float pulse-animation" style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>✨</div>
              <h2 className="card-title mb-2 text-gradient" style={{ fontSize: '3rem', fontWeight: '900' }}>Join Janaspandana</h2>
              <p className="text-muted" style={{ fontSize: '1.1rem' }}>Create your account and start making a difference</p>
            </div>
            <form onSubmit={onSubmit}>
              
              <div className="mb-3">
                <label htmlFor="full_name" className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="full_name"
                  placeholder="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={onChange}
                  required
                />
              </div>

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
                <label htmlFor="phone_number" className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  id="phone_number"
                  placeholder="Phone Number"
                  name="phone_number"
                  value={formData.phone_number}
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
                <input type="submit" value="Sign Up" className="btn btn-primary" />
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;