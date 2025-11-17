// middleware/auth.js

const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Get the token from the header
  const token = req.header('x-auth-token');

  // 2. Check if no token is present
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. If token exists, verify it
  try {
    // Use JWT_SECRET from environment or fallback to the same default value
    const jwtSecret = process.env.JWT_SECRET || 'janaspandana-super-secret-key-that-no-one-will-guess';
    
    const decoded = jwt.verify(token, jwtSecret);

    // 4. Add the user's ID from the token to the request object
    // This lets our protected routes know *who* is making the request
    req.user = decoded.user;
    
    // 5. Call 'next()' to proceed to the actual route
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    res.status(401).json({ msg: 'Token is not valid', error: err.message });
  }
};