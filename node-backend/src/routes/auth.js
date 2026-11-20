const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { authenticate, SECRET_KEY } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

// POST /auth/login
router.post('/login', validateBody(['email', 'password']), (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email.toLowerCase().trim());

  if (!user) {
    return res.status(401).json({ detail: 'Incorrect email or password' });
  }

  if (!user.is_active) {
    return res.status(403).json({ detail: 'User account is deactivated' });
  }

  const isValid = bcrypt.compareSync(password, user.hashed_password);
  if (!isValid) {
    return res.status(401).json({ detail: 'Incorrect email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    SECRET_KEY,
    { expiresIn: '24h' }
  );

  const { hashed_password, ...safeUser } = user;
  return res.json({
    access_token: token,
    token_type: 'bearer',
    user: safeUser
  });
});

// POST /auth/register
router.post('/register', validateBody(['full_name', 'email', 'password']), (req, res) => {
  const { full_name, email, password, phone, student_id } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // Role: default STUDENT, never ADMIN via public registration
  let role = 'STUDENT';
  if (req.body.role && req.body.role.toUpperCase() === 'LIBRARIAN') {
    role = 'LIBRARIAN';
  }

  const existing = db.prepare(`SELECT id FROM users WHERE email = ?`).get(normalizedEmail);
  if (existing) {
    return res.status(400).json({ detail: 'Email is already registered' });
  }

  if (student_id) {
    const existingStudentId = db.prepare(`SELECT id FROM users WHERE student_id = ?`).get(student_id);
    if (existingStudentId) {
      return res.status(400).json({ detail: 'Student ID is already registered' });
    }
  }

  const hashedPassword = bcrypt.hashSync(password, 12);
  const result = db.prepare(`
    INSERT INTO users (full_name, email, hashed_password, role, phone, student_id, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(full_name, normalizedEmail, hashedPassword, role, phone || null, student_id || null);

  const newUser = db.prepare(`SELECT id, full_name, email, role, is_active, phone, student_id, created_at, updated_at FROM users WHERE id = ?`).get(result.lastInsertRowid);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    SECRET_KEY,
    { expiresIn: '24h' }
  );

  return res.status(201).json({
    access_token: token,
    token_type: 'bearer',
    user: newUser
  });
});

// GET /auth/me
router.get('/me', authenticate, (req, res) => {
  return res.json(req.user);
});

module.exports = router;
