const jwt = require('jsonwebtoken');

// Middleware to verify the token and attach user data to the request object
exports.verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');

  // Check if the authorization header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.split(' ')[1];

  try {
    // Verify token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach decoded token data to req.user
    next();  // Proceed to the next middleware
  } catch (error) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Middleware to verify if the user has the admin role
exports.verifyAdmin = (req, res, next) => {
  const authHeader = req.header('Authorization');

  // Check if the authorization header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.split(' ')[1];

  try {
    // Verify token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach decoded token data to req.user

    // Check if the user has the admin role
    console.log(req.user)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied: Admins only' });
    }

    next();  // Proceed to the next middleware
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ msg: 'Invalid token, authorization denied' });
  }
};
