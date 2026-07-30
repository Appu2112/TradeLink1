const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header (usually sent as "Authorization: Bearer <token>")
  const authHeader = req.header('Authorization');

  // Check if no token
  if (!authHeader) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // The header looks like "Bearer <token>", so we split it to get just the token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey_changelater');
    
    // Add the user ID from the token to the request object so our routes can use it
    req.user = decoded; 
    
    // Move on to the next function (the trade route)
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};