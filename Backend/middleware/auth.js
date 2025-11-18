const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists and get current role
    const userResult = await db.query(
      'SELECT id, name, role, email FROM users WHERE id = $1 AND email = $2',
      [decoded.userId, decoded.email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token - user not found' 
      });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Flatten roles array (handle both authorizeRoles('JR', 'SR') and authorizeRoles(['JR', 'SR']))
    const flatRoles = roles.flat();
    
    // Normalize role comparison (trim whitespace and handle case)
    const userRole = req.user.role ? req.user.role.trim() : null;
    const normalizedRoles = flatRoles.map(r => typeof r === 'string' ? r.trim() : r);
    
    // Check if user role matches any of the allowed roles (case-insensitive)
    const hasAccess = normalizedRoles.some(role => 
      userRole && userRole.toLowerCase() === role.toLowerCase()
    );

    if (!hasAccess) {
      console.error(`[Authorization] User role "${userRole}" not in allowed roles: [${normalizedRoles.join(', ')}]`);
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required roles: ${normalizedRoles.join(', ')}. Your role: ${userRole || 'unknown'}` 
      });
    }

    next();
  };
};

// Specific role middlewares
const requireAdmin = authorizeRoles('Admin');
const requireMWO = authorizeRoles('Psychiatric Welfare Officer');
const requireDoctor = authorizeRoles('Faculty', 'Resident');
const requireMWOOrDoctor = authorizeRoles('Psychiatric Welfare Officer', 'Faculty', 'Resident');

// Optional authentication (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userResult = await db.query(
        'SELECT id, name, role, email FROM users WHERE id = $1 AND email = $2',
        [decoded.userId, decoded.email]
      );

      if (userResult.rows.length > 0) {
        req.user = userResult.rows[0];
      }
    }
    
    next();
  } catch (error) {
    // If token is invalid, continue without user context
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  requireAdmin,
  requireMWO,
  requireDoctor,
  requireMWOOrDoctor,
  optionalAuth
};
