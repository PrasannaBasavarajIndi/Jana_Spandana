// models/Department.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DepartmentSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  zone: {
    type: String
  },
  contact_email: {
    type: String
  }
});

// This creates the 'departments' collection in your MongoDB
module.exports = mongoose.model('Department', DepartmentSchema);