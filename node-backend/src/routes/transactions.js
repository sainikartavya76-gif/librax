const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate, requireRoles } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

const MAX_BOOKS = parseInt(process.env.MAX_BOOKS || '3', 10);
const FINE_PER_DAY = parseFloat(process.env.FINE_PER_DAY || '2.0');
const RETURN_DAYS = parseInt(process.env.RETURN_DAYS || '14', 10);

// GET /transactions - List transactions
router.get('/', authenticate, (req, res) => {
  const { user_id, book_id, status, mine } = req.query;

  let query = `
    SELECT t.*, 
           b.title as book_title, b.author as book_author, b.isbn as book_isbn,
           u.full_name as user_name, u.email as user_email, u.student_id as user_student_id
    FROM transactions t
    JOIN books b ON t.book_id = b.id
    JOIN users u ON t.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (mine === 'true') {
    query += ' AND t.user_id = ?';
    params.push(req.user.id);
  } else if (user_id) {
    query += ' AND t.user_id = ?';
    params.push(parseInt(user_id, 10));
  }

  if (book_id) {
    query += ' AND t.book_id = ?';
    params.push(parseInt(book_id, 10));
  }

  if (status) {
    query += ' AND t.status = ?';
    params.push(status);
  }

  query += ' ORDER BY t.created_at DESC';
  const transactions = db.prepare(query).all(...params);
  return res.json(transactions);
});

// POST /transactions/issue - Issue book (Staff or self-borrow)
router.post('/issue', authenticate, (req, res) => {
  let { book_id, user_id, notes } = req.body;
  if (!user_id) {
    user_id = req.user.id;
  }
  if (!book_id) {
    return res.status(400).json({ detail: 'book_id is required' });
  }

  const book = db.prepare(`SELECT * FROM books WHERE id = ?`).get(book_id);
  if (!book) {
    return res.status(404).json({ detail: 'Book not found' });
  }

  if (book.available_copies <= 0) {
    return res.status(400).json({ detail: 'No copies available for issue' });
  }

  const targetUser = db.prepare(`SELECT * FROM users WHERE id = ?`).get(user_id);
  if (!targetUser) {
    return res.status(404).json({ detail: 'User not found' });
  }

  if (!targetUser.is_active) {
    return res.status(400).json({ detail: 'Target user account is inactive' });
  }

  // Check active borrowings limit
  const activeCount = db.prepare(`SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND status = 'ACTIVE'`).get(user_id);
  if (activeCount.count >= MAX_BOOKS) {
    return res.status(400).json({ detail: `User has already reached maximum borrowed books limit (${MAX_BOOKS})` });
  }

  // Check unpaid fines
  const unpaidFines = db.prepare(`SELECT COUNT(*) as count FROM fines WHERE user_id = ? AND paid = 0`).get(user_id);
  if (unpaidFines.count > 0) {
    return res.status(400).json({ detail: 'User has unpaid overdue fines' });
  }

  // Transaction execution
  const issueTx = db.transaction(() => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + RETURN_DAYS);
    const dueDateStr = dueDate.toISOString().replace('T', ' ').substring(0, 19);

    const insertTx = db.prepare(`
      INSERT INTO transactions (book_id, user_id, issued_by, due_date, status, notes)
      VALUES (?, ?, ?, ?, 'ACTIVE', ?)
    `);
    const txResult = insertTx.run(book_id, user_id, req.user.id, dueDateStr, notes || null);

    db.prepare(`UPDATE books SET available_copies = available_copies - 1, updated_at = datetime('now') WHERE id = ?`).run(book_id);

    // Cancel or fulfill any reservation this user had for this book
    db.prepare(`UPDATE reservations SET status = 'FULFILLED', fulfilled_at = datetime('now') WHERE book_id = ? AND user_id = ? AND status = 'PENDING'`).run(book_id, user_id);

    db.prepare(`
      INSERT INTO activity_logs (user_id, action, description, entity_type, entity_id)
      VALUES (?, 'ISSUE_BOOK', ?, 'TRANSACTION', ?)
    `).run(req.user.id, `Issued book "${book.title}" to ${targetUser.full_name}`, txResult.lastInsertRowid);

    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, 'Book Issued', ?, 'INFO')
    `).run(user_id, `You have successfully borrowed "${book.title}". Due date is ${dueDateStr.substring(0, 10)}.`);

    return db.prepare(`
      SELECT t.*, b.title as book_title, u.full_name as user_name
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).get(txResult.lastInsertRowid);
  });

  try {
    const created = issueTx();
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ detail: err.message });
  }
});

// POST /transactions/return/:id or /transactions/:id/return - Return book
router.post(['/return/:id', '/:id/return'], authenticate, (req, res) => {
  const transactionId = parseInt(req.params.id, 10);
  const txRecord = db.prepare(`SELECT * FROM transactions WHERE id = ?`).get(transactionId);

  if (!txRecord) {
    return res.status(404).json({ detail: 'Transaction not found' });
  }

  if (txRecord.status === 'RETURNED') {
    return res.status(400).json({ detail: 'Book is already returned' });
  }

  const book = db.prepare(`SELECT * FROM books WHERE id = ?`).get(txRecord.book_id);
  const targetUser = db.prepare(`SELECT * FROM users WHERE id = ?`).get(txRecord.user_id);

  // Compute overdue days
  const now = new Date();
  const dueDate = new Date(txRecord.due_date);
  const diffTime = now.getTime() - dueDate.getTime();
  const overdueDays = diffTime > 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0;
  const fineAmount = overdueDays > 0 ? overdueDays * FINE_PER_DAY : 0;

  const returnTx = db.transaction(() => {
    const nowStr = now.toISOString().replace('T', ' ').substring(0, 19);

    db.prepare(`
      UPDATE transactions
      SET status = 'RETURNED', return_date = ?
      WHERE id = ?
    `).run(nowStr, transactionId);

    db.prepare(`UPDATE books SET available_copies = available_copies + 1, updated_at = datetime('now') WHERE id = ?`).run(txRecord.book_id);

    let fineRecord = null;
    if (fineAmount > 0) {
      const fineResult = db.prepare(`
        INSERT INTO fines (transaction_id, user_id, amount, overdue_days, paid)
        VALUES (?, ?, ?, ?, 0)
      `).run(transactionId, txRecord.user_id, fineAmount, overdueDays);

      fineRecord = db.prepare(`SELECT * FROM fines WHERE id = ?`).get(fineResult.lastInsertRowid);

      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'Overdue Fine Assessed', ?, 'FINE')
      `).run(txRecord.user_id, `You have an overdue fine of $${fineAmount.toFixed(2)} for "${book.title}" (${overdueDays} days late).`);
    }

    // Process next pending reservation if any
    const nextReservation = db.prepare(`
      SELECT * FROM reservations
      WHERE book_id = ? AND status = 'PENDING'
      ORDER BY queue_position ASC, reserved_at ASC
      LIMIT 1
    `).get(txRecord.book_id);

    if (nextReservation) {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'Reserved Book Available', ?, 'RESERVATION')
      `).run(nextReservation.user_id, `"${book.title}" which you reserved is now available for pickup!`);
    }

    db.prepare(`
      INSERT INTO activity_logs (user_id, action, description, entity_type, entity_id)
      VALUES (?, 'RETURN_BOOK', ?, 'TRANSACTION', ?)
    `).run(req.user.id, `Returned book "${book.title}" from ${targetUser ? targetUser.full_name : 'user'}`, transactionId);

    const updatedTx = db.prepare(`
      SELECT t.*, b.title as book_title, u.full_name as user_name
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).get(transactionId);

    return { transaction: updatedTx, fine: fineRecord };
  });

  try {
    const outcome = returnTx();
    return res.json(outcome);
  } catch (err) {
    return res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
