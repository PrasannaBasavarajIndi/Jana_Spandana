// scripts/seedSupervisors.js
// Run this script to create 5 supervisor accounts
// Usage: node scripts/seedSupervisors.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const supervisors = [
  {
    full_name: 'Supervisor One',
    email: 'supervisor1@janaspandana.com',
    password: 'Supervisor123!',
    phone_number: '1234567890',
    role: 'SUPERVISOR'
  },
  {
    full_name: 'Supervisor Two',
    email: 'supervisor2@janaspandana.com',
    password: 'Supervisor123!',
    phone_number: '1234567891',
    role: 'SUPERVISOR'
  },
  {
    full_name: 'Supervisor Three',
    email: 'supervisor3@janaspandana.com',
    password: 'Supervisor123!',
    phone_number: '1234567892',
    role: 'SUPERVISOR'
  },
  {
    full_name: 'Supervisor Four',
    email: 'supervisor4@janaspandana.com',
    password: 'Supervisor123!',
    phone_number: '1234567893',
    role: 'SUPERVISOR'
  },
  {
    full_name: 'Supervisor Five',
    email: 'supervisor5@janaspandana.com',
    password: 'Supervisor123!',
    phone_number: '1234567894',
    role: 'SUPERVISOR'
  }
];

async function seedSupervisors() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if supervisors already exist
    const existingSupervisors = await User.countDocuments({ role: 'SUPERVISOR' });
    if (existingSupervisors >= 5) {
      console.log('Supervisors already exist. Skipping seed.');
      process.exit(0);
    }

    for (const supervisorData of supervisors) {
      const existingUser = await User.findOne({ email: supervisorData.email });
      if (existingUser) {
        console.log(`Supervisor ${supervisorData.email} already exists. Skipping.`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(supervisorData.password, salt);

      const supervisor = new User({
        full_name: supervisorData.full_name,
        email: supervisorData.email,
        password_hash,
        phone_number: supervisorData.phone_number,
        role: supervisorData.role
      });

      await supervisor.save();
      console.log(`Created supervisor: ${supervisorData.email}`);
    }

    console.log('Supervisor seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding supervisors:', error);
    process.exit(1);
  }
}

seedSupervisors();


