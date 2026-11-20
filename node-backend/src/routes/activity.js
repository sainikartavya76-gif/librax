const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate, requireRoles } = require('../middleware/auth');

// GET /activity - Get activity logs
router.get('/', authenticate, requireRoles('ADMIN', 'LIBRARIAN'), (req, res) => {
  const { limit = 50, user_id, action } = req.query;

  let query = `
    SELECT a.*, u.full_name as user_name, u.email as user_email
    FROM activity_logs a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (user_id) {
    query += ' AND a.user_id = ?';
    params.push(parseInt(user_id, 10));
  }

  if (action) {
    query += ' AND a.action = ?';
    params.push(action);
  }

  query += ' ORDER BY a.created_at DESC LIMIT ?';
  params.push(parseInt(limit, 10));

  const logs = db.prepare(query).all(...params);
  return res.json(logs);
});

// POST /activity/reset-seed - Reset demo database to pristine state
router.post('/reset-seed', (req, res) => {
  try {
    const seedDatabase = require('../database/seed');
    seedDatabase();
    return res.json({ message: 'Database reset to initial demo state with pristine sample data' });
  } catch (err) {
    return res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
