const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate, requireRoles } = require('../middleware/auth');

// GET /fines - List fines
router.get('/', authenticate, (req, res) => {
  const { user_id, paid, mine } = req.query;

  let query = `
    SELECT f.*,
           u.full_name as user_name, u.email as user_email,
           b.title as book_title
    FROM fines f
    JOIN users u ON f.user_id = u.id
    LEFT JOIN transactions t ON f.transaction_id = t.id
    LEFT JOIN books b ON t.book_id = b.id
    WHERE 1=1
  `;
  const params = [];

  if (mine === 'true') {
    query += ' AND f.user_id = ?';
    params.push(req.user.id);
  } else if (user_id) {
    query += ' AND f.user_id = ?';
    params.push(parseInt(user_id, 10));
  }

  if (paid !== undefined) {
    query += ' AND f.paid = ?';
    params.push(paid === 'true' || paid === '1' ? 1 : 0);
  }

  query += ' ORDER BY f.created_at DESC';
  const fines = db.prepare(query).all(...params);
  return res.json(fines);
});

// POST /fines/:id/pay - Pay fine
router.post('/:id/pay', authenticate, (req, res) => {
  const fineId = parseInt(req.params.id, 10);
  const fine = db.prepare(`SELECT * FROM fines WHERE id = ?`).get(fineId);

  if (!fine) {
    return res.status(404).json({ detail: 'Fine not found' });
  }

  if (fine.paid) {
    return res.status(400).json({ detail: 'Fine is already paid' });
  }

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  db.prepare(`
    UPDATE fines
    SET paid = 1, paid_at = ?
    WHERE id = ?
  `).run(nowStr, fineId);

  db.prepare(`
    INSERT INTO activity_logs (user_id, action, description, entity_type, entity_id)
    VALUES (?, 'PAY_FINE', ?, 'FINE', ?)
  `).run(req.user.id, `Fine of $${fine.amount.toFixed(2)} settled for fine #${fine.id}`, fineId);

  db.prepare(`
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (?, 'Fine Payment Confirmed', ?, 'FINE')
  `).run(fine.user_id, `Your overdue fine payment of $${fine.amount.toFixed(2)} has been recorded.`);

  const updatedFine = db.prepare(`SELECT * FROM fines WHERE id = ?`).get(fineId);
  return res.json(updatedFine);
});

module.exports = router;
