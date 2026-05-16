import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Guard 1: Verify the user is logged in using their secret token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Decrypt the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SUPER_SECRET_KEY_CARD');
      
      // Attach the user information to the request so downstream routes can use it
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed!' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token found!' });
  }
};

// Guard 2: Verify the user has the specific role required (e.g., Admin)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role (${req.user?.role || 'Guest'}) is not allowed to access this resource.` });
    }
    next();
  };
};