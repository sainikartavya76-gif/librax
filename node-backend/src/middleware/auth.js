const jwt = require('jsonwebtoken');
const db = require('../database/db');

const SECRET_KEY = process.env.SECRET_KEY || 'librax-super-secret-jwt-key-2025-secure-token';

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Missing or invalid authorization token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = db.prepare(`SELECT id, full_name, email, role, is_active, student_id, phone FROM users WHERE id = ?`).get(decoded.id || decoded.sub);
    
    if (!user) {
      return res.status(401).json({ detail: 'User no longer exists' });
    }
    if (!user.is_active) {
      return res.status(403).json({ detail: 'User account is inactive' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ detail: 'Invalid or expired token' });
  }
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ detail: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ detail: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

module.exports = {
  authenticate,
  requireRoles,
  SECRET_KEY
};
