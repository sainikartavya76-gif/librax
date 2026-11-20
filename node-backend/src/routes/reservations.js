const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

// GET /reservations - List reservations
router.get('/', authenticate, (req, res) => {
  const { book_id, user_id, status, mine } = req.query;

  let query = `
    SELECT r.*,
           b.title as book_title, b.author as book_author, b.isbn as book_isbn,
           u.full_name as user_name, u.email as user_email
    FROM reservations r
    JOIN books b ON r.book_id = b.id
    JOIN users u ON r.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (mine === 'true') {
    query += ' AND r.user_id = ?';
    params.push(req.user.id);
  } else if (user_id) {
    query += ' AND r.user_id = ?';
    params.push(parseInt(user_id, 10));
  }

  if (book_id) {
    query += ' AND r.book_id = ?';
    params.push(parseInt(book_id, 10));
  }

  if (status) {
    query += ' AND r.status = ?';
    params.push(status);
  }

  query += ' ORDER BY r.reserved_at DESC';
  const reservations = db.prepare(query).all(...params);
  return res.json(reservations);
});

// POST /reservations - Reserve a book
router.post('/', authenticate, validateBody(['book_id']), (req, res) => {
  const { book_id } = req.body;
  const userId = req.user.id;

  const book = db.prepare(`SELECT * FROM books WHERE id = ?`).get(book_id);
  if (!book) {
    return res.status(404).json({ detail: 'Book not found' });
  }

  // Check if user already has an active reservation for this book
  const existing = db.prepare(`SELECT id FROM reservations WHERE book_id = ? AND user_id = ? AND status = 'PENDING'`).get(book_id, userId);
  if (existing) {
    return res.status(400).json({ detail: 'You already have a pending reservation for this book' });
  }

  // Calculate queue position
  const countRow = db.prepare(`SELECT COUNT(*) as count FROM reservations WHERE book_id = ? AND status = 'PENDING'`).get(book_id);
  const queuePos = (countRow ? countRow.count : 0) + 1;

  const result = db.prepare(`
    INSERT INTO reservations (book_id, user_id, status, queue_position)
    VALUES (?, ?, 'PENDING', ?)
  `).run(book_id, userId, queuePos);

  db.prepare(`
    INSERT INTO activity_logs (user_id, action, description, entity_type, entity_id)
    VALUES (?, 'RESERVE_BOOK', ?, 'RESERVATION', ?)
  `).run(userId, `Reserved book: ${book.title}`, result.lastInsertRowid);

  const reservation = db.prepare(`
    SELECT r.*, b.title as book_title, u.full_name as user_name
    FROM reservations r
    JOIN books b ON r.book_id = b.id
    JOIN users u ON r.user_id = u.id
    WHERE r.id = ?
  `).get(result.lastInsertRowid);

  return res.status(201).json(reservation);
});

// DELETE /reservations/:id - Cancel reservation
router.delete('/:id', authenticate, (req, res) => {
  const reservationId = parseInt(req.params.id, 10);
  const resRecord = db.prepare(`SELECT * FROM reservations WHERE id = ?`).get(reservationId);

  if (!resRecord) {
    return res.status(404).json({ detail: 'Reservation not found' });
  }

  const isPrivileged = req.user.role === 'ADMIN' || req.user.role === 'LIBRARIAN';
  if (!isPrivileged && resRecord.user_id !== req.user.id) {
    return res.status(403).json({ detail: 'Forbidden' });
  }

  db.prepare(`UPDATE reservations SET status = 'CANCELLED' WHERE id = ?`).run(reservationId);

  // Re-adjust queue positions for other pending reservations on this book
  const remaining = db.prepare(`SELECT id FROM reservations WHERE book_id = ? AND status = 'PENDING' ORDER BY queue_position ASC, reserved_at ASC`).all(resRecord.book_id);
  const updatePos = db.prepare(`UPDATE reservations SET queue_position = ? WHERE id = ?`);
  remaining.forEach((r, idx) => {
    updatePos.run(idx + 1, r.id);
  });

  return res.json({ message: 'Reservation cancelled successfully' });
});

module.exports = router;
