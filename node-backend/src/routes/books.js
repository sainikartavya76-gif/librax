const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate, requireRoles } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

// GET /books - List/Search/Filter books
router.get('/', (req, res) => {
  const { search, category, available_only, page = 1, limit = 50 } = req.query;

  let query = 'SELECT * FROM books WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (available_only === 'true' || available_only === '1') {
    query += ' AND available_copies > 0';
  }

  query += ' ORDER BY title ASC';

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit, 10), offset);

  const books = db.prepare(query).all(...params);
  return res.json(books);
});

// GET /books/categories - List distinct categories
router.get('/categories', (req, res) => {
  const rows = db.prepare(`SELECT DISTINCT category FROM books ORDER BY category ASC`).all();
  return res.json(rows.map(r => r.category));
});

// GET /books/:id - Book detail
router.get('/:id', (req, res) => {
  const book = db.prepare(`SELECT * FROM books WHERE id = ?`).get(req.params.id);
  if (!book) {
    return res.status(404).json({ detail: 'Book not found' });
  }
  return res.json(book);
});

// POST /books - Add book
router.post('/', authenticate, validateBody(['title', 'author', 'isbn']), (req, res) => {
  const {
    title, author, isbn, category = 'General', publisher,
    publication_year, description, cover_url, total_copies = 1,
    shelf_location, language = 'English', pages
  } = req.body;

  const existing = db.prepare(`SELECT id FROM books WHERE isbn = ?`).get(isbn.trim());
  if (existing) {
    return res.status(400).json({ detail: 'A book with this ISBN already exists' });
  }

  const copies = parseInt(total_copies, 10) || 1;
  const insert = db.prepare(`
    INSERT INTO books (
      title, author, isbn, category, publisher, publication_year,
      description, cover_url, total_copies, available_copies,
      shelf_location, language, pages
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    title.trim(), author.trim(), isbn.trim(), category,
    publisher || null, publication_year || null, description || null,
    cover_url || null, copies, copies, shelf_location || null,
    language, pages || null
  );

  const newBook = db.prepare(`SELECT * FROM books WHERE id = ?`).get(result.lastInsertRowid);

  db.prepare(`
    INSERT INTO activity_logs (user_id, action, description, entity_type, entity_id)
    VALUES (?, 'ADD_BOOK', ?, 'BOOK', ?)
  `).run(req.user.id, `Added new book: ${newBook.title}`, newBook.id);

  return res.status(201).json(newBook);
});

// PUT /books/:id - Update book
router.put('/:id', authenticate, (req, res) => {
  const existing = db.prepare(`SELECT * FROM books WHERE id = ?`).get(req.params.id);
  if (!existing) {
    return res.status(404).json({ detail: 'Book not found' });
  }

  const {
    title, author, isbn, category, publisher,
    publication_year, description, cover_url, total_copies,
    available_copies, shelf_location, language, pages
  } = req.body;

  if (isbn && isbn !== existing.isbn) {
    const duplicate = db.prepare(`SELECT id FROM books WHERE isbn = ? AND id != ?`).get(isbn, req.params.id);
    if (duplicate) {
      return res.status(400).json({ detail: 'Another book already uses this ISBN' });
    }
  }

  const update = db.prepare(`
    UPDATE books SET
      title = COALESCE(?, title),
      author = COALESCE(?, author),
      isbn = COALESCE(?, isbn),
      category = COALESCE(?, category),
      publisher = COALESCE(?, publisher),
      publication_year = COALESCE(?, publication_year),
      description = COALESCE(?, description),
      cover_url = COALESCE(?, cover_url),
      total_copies = COALESCE(?, total_copies),
      available_copies = COALESCE(?, available_copies),
      shelf_location = COALESCE(?, shelf_location),
      language = COALESCE(?, language),
      pages = COALESCE(?, pages),
      updated_at = datetime('now')
    WHERE id = ?
  `);

  update.run(
    title, author, isbn, category, publisher,
    publication_year, description, cover_url, total_copies,
    available_copies, shelf_location, language, pages,
    req.params.id
  );

  const updatedBook = db.prepare(`SELECT * FROM books WHERE id = ?`).get(req.params.id);

  db.prepare(`
    INSERT INTO activity_logs (user_id, action, description, entity_type, entity_id)
    VALUES (?, 'UPDATE_BOOK', ?, 'BOOK', ?)
  `).run(req.user.id, `Updated book: ${updatedBook.title}`, updatedBook.id);

  return res.json(updatedBook);
});

// DELETE /books/:id - Delete book
router.delete('/:id', authenticate, (req, res) => {
  const book = db.prepare(`SELECT * FROM books WHERE id = ?`).get(req.params.id);
  if (!book) {
    return res.status(404).json({ detail: 'Book not found' });
  }

  const activeIssues = db.prepare(`SELECT COUNT(*) as count FROM transactions WHERE book_id = ? AND status = 'ACTIVE'`).get(book.id);
  if (activeIssues.count > 0) {
    return res.status(400).json({ detail: 'Cannot delete book with active issued copies' });
  }

  db.prepare(`DELETE FROM books WHERE id = ?`).run(req.params.id);

  db.prepare(`
    INSERT INTO activity_logs (user_id, action, description, entity_type, entity_id)
    VALUES (?, 'DELETE_BOOK', ?, 'BOOK', ?)
  `).run(req.user.id, `Deleted book: ${book.title}`, book.id);

  return res.json({ message: 'Book deleted successfully' });
});

module.exports = router;
