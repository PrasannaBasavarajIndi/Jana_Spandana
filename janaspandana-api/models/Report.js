// models/Report.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// --- Sub-schema for GeoJSON Location ---
// This ensures data is stored in the correct format for geospatial queries
const LocationSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [Longitude, Latitude]
    required: true
  }
});

// --- Sub-schema for the Updates Log ---
// This will be an array embedded inside the Report document
const UpdateLogSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  comment: {
    type: String,
    required: true
  },
  status_change: {
    type: String,
    default: null
  }
});

// --- Main Report Schema ---
const ReportSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'WORKING', 'CLEARED', 'REJECTED'],
    default: 'PENDING'
  },
  report_type: {
    type: String,
    required: true // e.g., "Pothole", "Garbage", "Water Leak"
  },
  submitted_by_user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assigned_to_department_id: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  location: {
    type: LocationSchema, // Embed the location schema
    required: true
  },
  address_text: {
    type: String
  },
  media_urls: {
    type: [String], // An array of strings (URLs to images)
    default: []
  },
  updates_log: {
    type: [UpdateLogSchema], // An array of update log entries
    default: []
  },
  likes: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  comments: [{
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  assigned_workforce: {
    type: Number,
    default: 0
  },
  assigned_budget: {
    type: Number,
    default: 0
  },
  assigned_to_worker_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // AI/ML Generated Fields
  priority_score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  ai_tags: {
    type: [String],
    default: []
  },
  is_duplicate: {
    type: Boolean,
    default: false
  },
  duplicate_of: {
    type: Schema.Types.ObjectId,
    ref: 'Report',
    default: null
  },
  ai_classification: {
    predicted_type: String,
    confidence: Number
  },
  sentiment_analysis: {
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral'
    },
    score: {
      type: Number,
      default: 0
    }
  }
});

// --- Geospatial Index ---
// This is CRITICAL for fast "near me" queries.
ReportSchema.index({ location: '2dsphere' });

// This creates the 'reports' collection in your MongoDB
module.exports = mongoose.model('Report', ReportSchema);