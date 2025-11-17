// routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Import the User model we created
const User = require('../models/User');

// ---
// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
// ---
router.post('/signup', async (req, res) => {
  
  // 1. Get data from the request body
  const { full_name, email, password, phone_number } = req.body;

  try {
    // 2. Check if user (email) already exists
    let user = await User.findOne({ email: email });
    if (user) {
      // 400 = Bad Request
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // 3. If user is new, create a new User instance (only CITIZEN can sign up directly)
    user = new User({
      full_name,
      email,
      phone_number,
      role: 'CITIZEN', // Only citizens can sign up directly
      // We will set the password_hash next
    });

    // 4. Hash the password
    const salt = await bcrypt.genSalt(10); // Generate a "salt"
    user.password_hash = await bcrypt.hash(password, salt); // Hash the password

    // 5. Save the new user to the database
    await user.save();

    // 6. (Optional but recommended) Create and return a JSON Web Token (JWT)
    // This logs the user in immediately after they sign up.

    const payload = {
      user: {
        id: user.id, // This 'id' is from the MongoDB document
        role: user.role
      }
    };
    
    // We'll need a "JWT_SECRET" in our .env file
    jwt.sign(
      payload,
      process.env.JWT_SECRET || "a_default_secret_key", // Use a real secret in .env
      { expiresIn: '30d' }, // Token expires in 30 days
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token }); // 201 = Created
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error'); // 500 = Internal Server Error
  }
});

// ---
// @route   POST /api/auth/create-admin
// @desc    Supervisor creates an admin account
// @access  Private (Supervisor only)
// ---
router.post('/create-admin', auth, async (req, res) => {
  try {
    // Check if user is supervisor
    const supervisor = await User.findById(req.user.id);
    if (!supervisor || supervisor.role !== 'SUPERVISOR') {
      return res.status(403).json({ msg: 'Only supervisors can create admin accounts' });
    }

    const { full_name, email, password, phone_number } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // Create admin user
    user = new User({
      full_name,
      email,
      phone_number,
      role: 'ADMIN',
      created_by: supervisor._id
    });

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(password, salt);
    await user.save();

    res.status(201).json({ msg: 'Admin account created successfully', user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ---
// @route   POST /api/auth/create-worker
// @desc    Admin creates a worker account
// @access  Private (Admin only)
// ---
router.post('/create-worker', auth, async (req, res) => {
  try {
    // Check if user is admin
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'ADMIN') {
      return res.status(403).json({ msg: 'Only admins can create worker accounts' });
    }

    const { full_name, email, password, phone_number } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // Create worker user
    user = new User({
      full_name,
      email,
      phone_number,
      role: 'WORKER',
      created_by: admin._id
    });

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(password, salt);
    await user.save();

    res.status(201).json({ msg: 'Worker account created successfully', user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ---
// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
// ---
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ---
// @route   GET /api/auth/admins
// @desc    Get all admin users (Supervisor only)
// @access  Private (Supervisor only)
// ---
router.get('/admins', auth, async (req, res) => {
  try {
    const supervisor = await User.findById(req.user.id);
    if (!supervisor || supervisor.role !== 'SUPERVISOR') {
      return res.status(403).json({ msg: 'Only supervisors can view admin list' });
    }

    const admins = await User.find({ role: 'ADMIN' })
      .select('-password_hash')
      .populate('created_by', 'full_name email');
    
    res.json(admins);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ---
// @route   POST /api/auth/login
// @desc    Authenticate a user and get a token
// @access  Public
// ---
router.post('/login', async (req, res) => {
  console.log('Login attempt:', { email: req.body.email });
  
  // 1. Get email and password from the request body
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('Missing credentials');
    return res.status(400).json({ 
      success: false, 
      msg: 'Please provide both email and password' 
    });
  }

  try {
    // 2. Check if the user exists
    console.log('Looking for user with email:', email);
    let user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ 
        success: false, 
        msg: 'Invalid credentials' 
      });
    }

    console.log('User found, checking password...');
    
    // 3. Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({ 
        success: false, 
        msg: 'Invalid credentials' 
      });
    }

    // 4. If user exists and password is correct, create a token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Use JWT_SECRET from environment or fallback to a default value
    const jwtSecret = process.env.JWT_SECRET || 'janaspandana-super-secret-key-that-no-one-will-guess';
    
    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '30d' },
      (err, token) => {
        if (err) {
          console.error('JWT Sign Error:', err);
          return res.status(500).json({ msg: 'Error generating token' });
        }
        res.json({ token }); // Send the token to the user
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router; // This line should already be at the bottom