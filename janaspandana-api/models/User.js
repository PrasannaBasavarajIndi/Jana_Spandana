// models/User.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  full_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // No two users can have the same email
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  phone_number: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['CITIZEN', 'SUPERVISOR', 'ADMIN', 'WORKER'], // Define allowed roles
    default: 'CITIZEN'
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null // Supervisor creates admin, admin creates worker
  },
  department_id: {
    type: Schema.Types.ObjectId,
    ref: 'Department', // This links to the Department model
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// This creates the 'users' collection in your MongoDB
module.exports = mongoose.model('User', UserSchema);