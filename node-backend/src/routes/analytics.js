const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate, requireRoles } = require('../middleware/auth');

// GET /analytics/dashboard
router.get('/dashboard', authenticate, requireRoles('ADMIN', 'LIBRARIAN'), (req, res) => {
  const totalBooks = db.prepare(`SELECT COALESCE(SUM(total_copies), 0) as count FROM books`).get().count;
  const availableBooks = db.prepare(`SELECT COALESCE(SUM(available_copies), 0) as count FROM books`).get().count;
  const activeIssues = db.prepare(`SELECT COUNT(*) as count FROM transactions WHERE status = 'ACTIVE'`).get().count;
  const totalMembers = db.prepare(`SELECT COUNT(*) as count FROM users WHERE role = 'STUDENT'`).get().count;

  const todayStr = new Date().toISOString().substring(0, 10);
  const booksIssuedToday = db.prepare(`
    SELECT COUNT(*) as count FROM transactions
    WHERE date(issue_date) = ?
  `).get(todayStr).count;

  // Overdue count & list
  const overdueRows = db.prepare(`
    SELECT t.*, b.title as book_title, u.full_name as user_name, u.email as user_email
    FROM transactions t
    JOIN books b ON t.book_id = b.id
    JOIN users u ON t.user_id = u.id
    WHERE t.status = 'ACTIVE' AND datetime(t.due_date) < datetime('now')
    ORDER BY t.due_date ASC
  `).all();

  const overdueCount = overdueRows.length;

  const recentActivity = db.prepare(`
    SELECT a.*, u.full_name as user_name
    FROM activity_logs a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT 5
  `).all();

  return res.json({
    total_books: totalBooks,
    available_books: availableBooks,
    active_issues: activeIssues,
    overdue_count: overdueCount,
    total_members: totalMembers,
    books_issued_today: booksIssuedToday,
    recent_activity: recentActivity,
    overdue_books: overdueRows
  });
});

// GET /analytics/issuance?days=30
router.get('/issuance', authenticate, requireRoles('ADMIN', 'LIBRARIAN'), (req, res) => {
  const days = parseInt(req.query.days || '30', 10);
  const result = [];

  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().substring(0, 10);

    const issuedCount = db.prepare(`
      SELECT COUNT(*) as count FROM transactions
      WHERE date(issue_date) = ?
    `).get(dateStr).count;

    const returnedCount = db.prepare(`
      SELECT COUNT(*) as count FROM transactions
      WHERE date(return_date) = ?
    `).get(dateStr).count;

    result.push({
      date: dateStr,
      issued: issuedCount,
      returned: returnedCount
    });
  }

  return res.json(result);
});

// GET /analytics/categories
router.get('/categories', authenticate, requireRoles('ADMIN', 'LIBRARIAN'), (req, res) => {
  const rows = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM books
    GROUP BY category
    ORDER BY count DESC
  `).all();

  return res.json(rows);
});

// GET /analytics/popular
router.get('/popular', authenticate, requireRoles('ADMIN', 'LIBRARIAN'), (req, res) => {
  const rows = db.prepare(`
    SELECT b.id, b.title, b.author, b.category, b.cover_url, COUNT(t.id) as borrow_count
    FROM books b
    LEFT JOIN transactions t ON b.id = t.book_id
    GROUP BY b.id
    ORDER BY borrow_count DESC
    LIMIT 10
  `).all();

  return res.json(rows);
});

// GET /analytics/overdue-rate
router.get('/overdue-rate', authenticate, requireRoles('ADMIN', 'LIBRARIAN'), (req, res) => {
  const totalCompleted = db.prepare(`SELECT COUNT(*) as count FROM transactions WHERE status = 'RETURNED'`).get().count;
  const overdueCompleted = db.prepare(`SELECT COUNT(*) as count FROM transactions WHERE status = 'RETURNED' AND datetime(return_date) > datetime(due_date)`).get().count;

  const totalFines = db.prepare(`SELECT COALESCE(SUM(amount), 0) as sum FROM fines`).get().sum;

  const durations = db.prepare(`
    SELECT AVG(julianday(return_date) - julianday(issue_date)) as avg_days
    FROM transactions
    WHERE status = 'RETURNED'
  `).get().avg_days;

  const overdueRate = totalCompleted > 0 ? Number(((overdueCompleted / totalCompleted) * 100).toFixed(2)) : 0;

  return res.json({
    overdue_rate: overdueRate,
    avg_duration_days: durations ? Number(durations.toFixed(1)) : 0,
    total_fines_amount: totalFines
  });
});

module.exports = router;
