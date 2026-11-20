const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { authenticate, requireRoles } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

// GET /users/me
router.get('/me', authenticate, (req, res) => {
  return res.json(req.user);
});

// GET /users - List users
router.get('/', authenticate, (req, res) => {
  const { role, search } = req.query;
  let query = 'SELECT id, full_name, email, role, is_active, phone, student_id, created_at, updated_at FROM users WHERE 1=1';
  const params = [];

  if (role) {
    query += ' AND role = ?';
    params.push(role);
  }

  if (search) {
    query += ' AND (full_name LIKE ? OR email LIKE ? OR student_id LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY created_at DESC';
  const users = db.prepare(query).all(...params);
  return res.json(users);
});

// GET /users/:id - User details (ADMIN, LIBRARIAN or Self)
router.get('/:id', authenticate, (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (req.user.role !== 'ADMIN' && req.user.role !== 'LIBRARIAN' && req.user.id !== userId) {
    return res.status(403).json({ detail: 'Forbidden' });
  }

  const user = db.prepare(`SELECT id, full_name, email, role, is_active, phone, student_id, created_at, updated_at FROM users WHERE id = ?`).get(userId);
  if (!user) {
    return res.status(404).json({ detail: 'User not found' });
  }
  return res.json(user);
});

// POST /users - Create user (ADMIN)
router.post('/', authenticate, requireRoles('ADMIN'), validateBody(['full_name', 'email', 'password', 'role']), (req, res) => {
  const { full_name, email, password, role, phone, student_id } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = db.prepare(`SELECT id FROM users WHERE email = ?`).get(normalizedEmail);
  if (existing) {
    return res.status(400).json({ detail: 'Email is already registered' });
  }

  const hashedPassword = bcrypt.hashSync(password, 12);
  const result = db.prepare(`
    INSERT INTO users (full_name, email, hashed_password, role, phone, student_id, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(full_name, normalizedEmail, hashedPassword, role, phone || null, student_id || null);

  const createdUser = db.prepare(`SELECT id, full_name, email, role, is_active, phone, student_id, created_at, updated_at FROM users WHERE id = ?`).get(result.lastInsertRowid);

  db.prepare(`
    INSERT INTO activity_logs (user_id, action, description, entity_type, entity_id)
    VALUES (?, 'CREATE_USER', ?, 'USER', ?)
  `).run(req.user.id, `Created user: ${createdUser.email} (${createdUser.role})`, createdUser.id);

  return res.status(201).json(createdUser);
});

// PUT /users/:id - Update user (ADMIN or Self for basic info)
router.put('/:id', authenticate, (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const isAdmin = req.user.role === 'ADMIN';

  if (!isAdmin && req.user.id !== userId) {
    return res.status(403).json({ detail: 'Forbidden' });
  }

  const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId);
  if (!user) {
    return res.status(404).json({ detail: 'User not found' });
  }

  const { full_name, phone, student_id, role, is_active, password } = req.body;

  let newHashedPassword = user.hashed_password;
  if (password) {
    newHashedPassword = bcrypt.hashSync(password, 12);
  }

  const newRole = isAdmin && role ? role : user.role;
  const newActive = isAdmin && is_active !== undefined ? (is_active ? 1 : 0) : user.is_active;

  db.prepare(`
    UPDATE users SET
      full_name = COALESCE(?, full_name),
      phone = COALESCE(?, phone),
      student_id = COALESCE(?, student_id),
      role = ?,
      is_active = ?,
      hashed_password = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    full_name || null,
    phone !== undefined ? phone : null,
    student_id !== undefined ? student_id : null,
    newRole,
    newActive,
    newHashedPassword,
    userId
  );

  const updatedUser = db.prepare(`SELECT id, full_name, email, role, is_active, phone, student_id, created_at, updated_at FROM users WHERE id = ?`).get(userId);
  return res.json(updatedUser);
});

// DELETE /users/:id - Delete user (ADMIN)
router.delete('/:id', authenticate, requireRoles('ADMIN'), (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (req.user.id === userId) {
    return res.status(400).json({ detail: 'You cannot delete your own admin account' });
  }

  const user = db.prepare(`SELECT id, full_name, email FROM users WHERE id = ?`).get(userId);
  if (!user) {
    return res.status(404).json({ detail: 'User not found' });
  }

  db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);

  db.prepare(`
    INSERT INTO activity_logs (user_id, action, description, entity_type, entity_id)
    VALUES (?, 'DELETE_USER', ?, 'USER', ?)
  `).run(req.user.id, `Deleted user: ${user.email}`, userId);

  return res.json({ message: 'User deleted successfully' });
});

// POST /users/:id/activate - Activate user
router.post('/:id/activate', authenticate, (req, res) => {
  const userId = parseInt(req.params.id, 10);
  db.prepare(`UPDATE users SET is_active = 1, updated_at = datetime('now') WHERE id = ?`).run(userId);
  const updatedUser = db.prepare(`SELECT id, full_name, email, role, is_active, phone, student_id, created_at, updated_at FROM users WHERE id = ?`).get(userId);
  return res.json(updatedUser);
});

// POST /users/:id/deactivate - Deactivate user
router.post('/:id/deactivate', authenticate, (req, res) => {
  const userId = parseInt(req.params.id, 10);
  db.prepare(`UPDATE users SET is_active = 0, updated_at = datetime('now') WHERE id = ?`).run(userId);
  const updatedUser = db.prepare(`SELECT id, full_name, email, role, is_active, phone, student_id, created_at, updated_at FROM users WHERE id = ?`).get(userId);
  return res.json(updatedUser);
});

module.exports = router;
