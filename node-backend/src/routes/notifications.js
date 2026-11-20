const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate } = require('../middleware/auth');

// GET /notifications - List user's notifications
router.get('/', authenticate, (req, res) => {
  const { unread_only } = req.query;
  let query = 'SELECT * FROM notifications WHERE user_id = ?';
  const params = [req.user.id];

  if (unread_only === 'true' || unread_only === '1') {
    query += ' AND is_read = 0';
  }

  query += ' ORDER BY created_at DESC';
  const notifications = db.prepare(query).all(...params);
  return res.json(notifications);
});

// PATCH /notifications/:id/read - Mark notification as read
router.patch('/:id/read', authenticate, (req, res) => {
  const notificationId = parseInt(req.params.id, 10);
  const notif = db.prepare(`SELECT * FROM notifications WHERE id = ?`).get(notificationId);

  if (!notif) {
    return res.status(404).json({ detail: 'Notification not found' });
  }

  if (notif.user_id !== req.user.id) {
    return res.status(403).json({ detail: 'Forbidden' });
  }

  db.prepare(`UPDATE notifications SET is_read = 1 WHERE id = ?`).run(notificationId);
  const updated = db.prepare(`SELECT * FROM notifications WHERE id = ?`).get(notificationId);
  return res.json(updated);
});

// POST /notifications/read-all - Mark all notifications as read
router.post('/read-all', authenticate, (req, res) => {
  db.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`).run(req.user.id);
  return res.json({ message: 'All notifications marked as read' });
});

module.exports = router;
