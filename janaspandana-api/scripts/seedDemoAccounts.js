// scripts/seedDemoAccounts.js
// Run this script to create all demo accounts (Supervisors, Admin, Worker, Citizen)
// Usage: node scripts/seedDemoAccounts.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const demoAccounts = {
  supervisors: [
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
  ],
  admin: {
    full_name: 'Demo Admin',
    email: 'admin@janaspandana.com',
    password: 'Admin123!',
    phone_number: '1234567800',
    role: 'ADMIN'
  },
  worker: {
    full_name: 'Demo Worker',
    email: 'worker@janaspandana.com',
    password: 'Worker123!',
    phone_number: '1234567801',
    role: 'WORKER'
  },
  citizen: {
    full_name: 'Demo User',
    email: 'user@example.com',
    password: 'User123!',
    phone_number: '1234567802',
    role: 'CITIZEN'
  }
};

async function seedDemoAccounts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Seed Supervisors
    console.log('\n📋 Seeding Supervisors...');
    for (const supervisorData of demoAccounts.supervisors) {
      const existingUser = await User.findOne({ email: supervisorData.email });
      if (existingUser) {
        console.log(`   ⏭️  Supervisor ${supervisorData.email} already exists. Skipping.`);
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
      console.log(`   ✅ Created supervisor: ${supervisorData.email}`);
    }

    // Seed Admin (created by first supervisor)
    console.log('\n📋 Seeding Admin...');
    const firstSupervisor = await User.findOne({ role: 'SUPERVISOR' });
    if (!firstSupervisor) {
      console.log('   ⚠️  No supervisor found. Admin must be created by a supervisor.');
    } else {
      const existingAdmin = await User.findOne({ email: demoAccounts.admin.email });
      if (existingAdmin) {
        console.log(`   ⏭️  Admin ${demoAccounts.admin.email} already exists. Skipping.`);
      } else {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(demoAccounts.admin.password, salt);

        const admin = new User({
          full_name: demoAccounts.admin.full_name,
          email: demoAccounts.admin.email,
          password_hash,
          phone_number: demoAccounts.admin.phone_number,
          role: demoAccounts.admin.role,
          created_by: firstSupervisor._id
        });

        await admin.save();
        console.log(`   ✅ Created admin: ${demoAccounts.admin.email}`);
      }
    }

    // Seed Worker (created by admin)
    console.log('\n📋 Seeding Worker...');
    const adminUser = await User.findOne({ role: 'ADMIN' });
    if (!adminUser) {
      console.log('   ⚠️  No admin found. Worker must be created by an admin.');
    } else {
      const existingWorker = await User.findOne({ email: demoAccounts.worker.email });
      if (existingWorker) {
        console.log(`   ⏭️  Worker ${demoAccounts.worker.email} already exists. Skipping.`);
      } else {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(demoAccounts.worker.password, salt);

        const worker = new User({
          full_name: demoAccounts.worker.full_name,
          email: demoAccounts.worker.email,
          password_hash,
          phone_number: demoAccounts.worker.phone_number,
          role: demoAccounts.worker.role,
          created_by: adminUser._id
        });

        await worker.save();
        console.log(`   ✅ Created worker: ${demoAccounts.worker.email}`);
      }
    }

    // Seed Citizen
    console.log('\n📋 Seeding Citizen...');
    const existingCitizen = await User.findOne({ email: demoAccounts.citizen.email });
    if (existingCitizen) {
      console.log(`   ⏭️  Citizen ${demoAccounts.citizen.email} already exists. Skipping.`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(demoAccounts.citizen.password, salt);

      const citizen = new User({
        full_name: demoAccounts.citizen.full_name,
        email: demoAccounts.citizen.email,
        password_hash,
        phone_number: demoAccounts.citizen.phone_number,
        role: demoAccounts.citizen.role
      });

      await citizen.save();
      console.log(`   ✅ Created citizen: ${demoAccounts.citizen.email}`);
    }

    console.log('\n✅ Demo account seeding completed!');
    console.log('\n📝 Demo Credentials:');
    console.log('   Supervisor: supervisor1@janaspandana.com / Supervisor123!');
    console.log('   Admin: admin@janaspandana.com / Admin123!');
    console.log('   Worker: worker@janaspandana.com / Worker123!');
    console.log('   Citizen: user@example.com / User123!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo accounts:', error);
    process.exit(1);
  }
}

seedDemoAccounts();


