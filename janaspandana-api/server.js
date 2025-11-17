const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const util = require('util');
require('dotenv').config(); // Loads environment variables from .env file

// --- App Setup ---
const app = express();
const PORT = process.env.PORT || 5000;

/// --- Middleware ---
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
})); 

// Increase the file size limit for JSON and URL-encoded payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("✅ Successfully connected to MongoDB Atlas!");
    
    // Auto-train ML model on startup if enough data exists
    try {
      const mlPredictor = require('./services/mlPredictor');
      const result = await mlPredictor.trainModel();
      if (result.trained) {
        console.log(`🤖 ML Model auto-trained on ${result.samples} samples`);
      } else {
        console.log(`⚠️  ML Model not trained: ${result.samples} samples (need at least 10)`);
      }
    } catch (err) {
      console.warn('ML Model auto-training skipped:', err.message);
    }
  })
  .catch(err => console.error("Error connecting to MongoDB:", err));

// --- Define API Routes ---
// This tells Express that any URL starting with "/api/auth"
// should be handled by the router in 'routes/auth.js'.
app.use('/api/auth', require('./routes/auth'));

// server.js

// ... (your existing app.use('/api/auth', ... ) line)

// This tells Express that any URL starting with "/api/reports"
// should be handled by the router in 'routes/reports.js'.
app.use('/api/reports', require('./routes/reports'));

// ... (your app.get('/') and app.listen() code)

// --- Basic Route ---
// A simple "home" route to test if the server is working
app.get('/', (req, res) => {
  res.send('Welcome to the Janaspandana API!');
});

// --- Global Error Handler ---
// This MUST be the last app.use() call
app.use((err, req, res, next) => {
  console.error('--- UNCAUGHT MIDDLEWARE ERROR ---');
  console.error(util.inspect(err, {showHidden: false, depth: null, colors: true}));
  console.error('--- END OF ERROR ---');

  // Send a generic error response
  res.status(500).json({ 
    msg: 'A middleware error occurred. Check the server logs.',
    error: err.message
  });
});


// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});