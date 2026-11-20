const db = require('./db');
const bcrypt = require('bcryptjs');

function seedDatabase() {
  console.log('Seeding LibraX database with comprehensive data...');

  // Reset existing tables cleanly
  db.exec(`
    DELETE FROM activity_logs;
    DELETE FROM notifications;
    DELETE FROM fines;
    DELETE FROM reservations;
    DELETE FROM transactions;
    DELETE FROM books;
    DELETE FROM users;
  `);

  // 1. Seed users
  const users = [
    {
      full_name: 'Administrator',
      email: 'admin@librax.com',
      password: 'Admin@123',
      role: 'ADMIN',
      student_id: 'ADM001',
      phone: '+1-555-0100'
    },
    {
      full_name: 'Jane Smith',
      email: 'librarian@librax.com',
      password: 'Lib@123',
      role: 'LIBRARIAN',
      student_id: 'LIB001',
      phone: '+1-555-0101'
    },
    {
      full_name: 'Alex Johnson',
      email: 'student@librax.com',
      password: 'Student@123',
      role: 'STUDENT',
      student_id: 'STU1001',
      phone: '+1-555-0102'
    },
    {
      full_name: 'Elena Rostova',
      email: 'elena@librax.com',
      password: 'Student@123',
      role: 'STUDENT',
      student_id: 'STU1002',
      phone: '+1-555-0103'
    },
    {
      full_name: 'Marcus Vance',
      email: 'marcus@librax.com',
      password: 'Student@123',
      role: 'STUDENT',
      student_id: 'STU1003',
      phone: '+1-555-0104'
    }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (full_name, email, hashed_password, role, student_id, phone, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);

  for (const u of users) {
    const hashed = bcrypt.hashSync(u.password, 10);
    insertUser.run(u.full_name, u.email, hashed, u.role, u.student_id, u.phone);
  }
  console.log('Users seeded.');

  // 2. Seed books
  const sampleBooks = [
    {
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest',
      isbn: '978-0262033848',
      category: 'Technology',
      publisher: 'MIT Press',
      publication_year: 2009,
      description: 'Comprehensive textbook covering modern computer algorithms and data structures.',
      cover_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&auto=format&fit=crop&q=80',
      total_copies: 5,
      available_copies: 3,
      shelf_location: 'CS-A1-04',
      pages: 1312
    },
    {
      title: 'Clean Code: Handbook of Software Craftsmanship',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      category: 'Technology',
      publisher: 'Prentice Hall',
      publication_year: 2008,
      description: 'Best practices, principles, and patterns of writing readable and maintainable software.',
      cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      total_copies: 4,
      available_copies: 2,
      shelf_location: 'CS-A2-02',
      pages: 464
    },
    {
      title: 'Design Patterns: Elements of Reusable Software',
      author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
      isbn: '978-0201633610',
      category: 'Technology',
      publisher: 'Addison-Wesley',
      publication_year: 1994,
      description: 'The classic Gang of Four reference on standard architectural patterns.',
      cover_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
      total_copies: 3,
      available_copies: 2,
      shelf_location: 'CS-A2-05',
      pages: 395
    },
    {
      title: 'Structure and Interpretation of Computer Programs',
      author: 'Harold Abelson, Gerald Jay Sussman',
      isbn: '978-0262510875',
      category: 'Technology',
      publisher: 'MIT Press',
      publication_year: 1996,
      description: 'Foundational principles of computational processes and symbolic programming.',
      cover_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      total_copies: 3,
      available_copies: 2,
      shelf_location: 'CS-B1-02',
      pages: 657
    },
    {
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      isbn: '978-0553380163',
      category: 'Science',
      publisher: 'Bantam Books',
      publication_year: 1988,
      description: 'Explores cosmology, black holes, the Big Bang, and quantum mechanics.',
      cover_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
      total_copies: 4,
      available_copies: 3,
      shelf_location: 'SCI-B1-09',
      pages: 212
    },
    {
      title: 'The Selfish Gene',
      author: 'Richard Dawkins',
      isbn: '978-0199291151',
      category: 'Science',
      publisher: 'Oxford University Press',
      publication_year: 1976,
      description: 'A revolutionary look at evolution and natural selection centered on the gene.',
      cover_url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80',
      total_copies: 3,
      available_copies: 3,
      shelf_location: 'SCI-B2-03',
      pages: 360
    },
    {
      title: '1984',
      author: 'George Orwell',
      isbn: '978-0451524935',
      category: 'Fiction',
      publisher: 'Signet Classic',
      publication_year: 1949,
      description: 'A dystopian masterpiece depicting totalitarian surveillance and thought policing.',
      cover_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
      total_copies: 6,
      available_copies: 4,
      shelf_location: 'FIC-C1-01',
      pages: 328
    },
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '978-0060935467',
      category: 'Fiction',
      publisher: 'Harper Perennial',
      publication_year: 1960,
      description: 'Pulitzer Prize-winning novel of justice and morality in the American South.',
      cover_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80',
      total_copies: 5,
      available_copies: 5,
      shelf_location: 'FIC-C2-04',
      pages: 336
    },
    {
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      isbn: '978-0062316097',
      category: 'History',
      publisher: 'Harper',
      publication_year: 2014,
      description: 'Survey of human evolutionary history from ancient foragers to modern biotechnology.',
      cover_url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80',
      total_copies: 4,
      available_copies: 3,
      shelf_location: 'HIS-D1-01',
      pages: 443
    },
    {
      title: 'Guns, Germs, and Steel',
      author: 'Jared Diamond',
      isbn: '978-0393317558',
      category: 'History',
      publisher: 'W. W. Norton',
      publication_year: 1997,
      description: 'Geographic and environmental factors shaping world civilizations.',
      cover_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
      total_copies: 3,
      available_copies: 3,
      shelf_location: 'HIS-D2-07',
      pages: 494
    },
    {
      title: 'Meditations',
      author: 'Marcus Aurelius',
      isbn: '978-0140449334',
      category: 'Philosophy',
      publisher: 'Penguin Classics',
      publication_year: 2006,
      description: 'Personal reflections and Stoic exercises of Roman Emperor Marcus Aurelius.',
      cover_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
      total_copies: 4,
      available_copies: 3,
      shelf_location: 'PHI-E1-02',
      pages: 254
    },
    {
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      isbn: '978-0374533557',
      category: 'Economics',
      publisher: 'Farrar, Straus and Giroux',
      publication_year: 2011,
      description: 'Exploration of human cognitive biases, behavioral economics, and dual systems of thought.',
      cover_url: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600&auto=format&fit=crop&q=80',
      total_copies: 4,
      available_copies: 4,
      shelf_location: 'ECO-F1-03',
      pages: 499
    },
    {
      title: 'The Republic',
      author: 'Plato',
      isbn: '978-0140455113',
      category: 'Philosophy',
      publisher: 'Penguin Classics',
      publication_year: 2007,
      description: 'Socratic dialogue concerning justice, the ideal state, and the philosopher king.',
      cover_url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80',
      total_copies: 3,
      available_copies: 3,
      shelf_location: 'PHI-E2-01',
      pages: 448
    },
    {
      title: 'The Elements of Style',
      author: 'William Strunk Jr., E.B. White',
      isbn: '978-0205309023',
      category: 'General',
      publisher: 'Pearson',
      publication_year: 1999,
      description: 'The definitive American English writing style guide for clear and concise prose.',
      cover_url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
      total_copies: 5,
      available_copies: 5,
      shelf_location: 'GEN-G1-01',
      pages: 105
    }
  ];

  const insertBook = db.prepare(`
    INSERT INTO books (
      title, author, isbn, category, publisher, publication_year,
      description, cover_url, total_copies, available_copies, shelf_location, pages
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const b of sampleBooks) {
    insertBook.run(
      b.title,
      b.author,
      b.isbn,
      b.category,
      b.publisher,
      b.publication_year,
      b.description,
      b.cover_url,
      b.total_copies,
      b.available_copies,
      b.shelf_location,
      b.pages
    );
  }
  console.log('Books seeded.');

  // Grab IDs
  const adminUser = db.prepare(`SELECT id FROM users WHERE email = ?`).get('admin@librax.com');
  const librarianUser = db.prepare(`SELECT id FROM users WHERE email = ?`).get('librarian@librax.com');
  const student1 = db.prepare(`SELECT id FROM users WHERE email = ?`).get('student@librax.com');
  const student2 = db.prepare(`SELECT id FROM users WHERE email = ?`).get('elena@librax.com');
  const student3 = db.prepare(`SELECT id FROM users WHERE email = ?`).get('marcus@librax.com');

  const bAlgo = db.prepare(`SELECT id FROM books WHERE isbn = ?`).get('978-0262033848');
  const bClean = db.prepare(`SELECT id FROM books WHERE isbn = ?`).get('978-0132350884');
  const bPatterns = db.prepare(`SELECT id FROM books WHERE isbn = ?`).get('978-0201633610');
  const b1984 = db.prepare(`SELECT id FROM books WHERE isbn = ?`).get('978-0451524935');
  const bSapiens = db.prepare(`SELECT id FROM books WHERE isbn = ?`).get('978-0062316097');
  const bMeditations = db.prepare(`SELECT id FROM books WHERE isbn = ?`).get('978-0140449334');

  // 3. Seed Transactions
  const insertTx = db.prepare(`
    INSERT INTO transactions (book_id, user_id, issued_by, issue_date, due_date, return_date, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Active Loan 1 (Normal, due in 10 days)
  const now = new Date();
  const dDue1 = new Date(now);
  dDue1.setDate(dDue1.getDate() + 10);
  insertTx.run(bAlgo.id, student1.id, librarianUser.id, now.toISOString(), dDue1.toISOString(), null, 'ACTIVE', 'Semester algorithms project');

  // Active Loan 2 (Normal, due in 5 days)
  const dDue2 = new Date(now);
  dDue2.setDate(dDue2.getDate() + 5);
  insertTx.run(bClean.id, student2.id, librarianUser.id, now.toISOString(), dDue2.toISOString(), null, 'ACTIVE', 'Agile coursework reference');

  // Overdue Loan 1 (Due 4 days ago -> $8 fine!)
  const dIssueOverdue1 = new Date(now);
  dIssueOverdue1.setDate(dIssueOverdue1.getDate() - 18);
  const dDueOverdue1 = new Date(now);
  dDueOverdue1.setDate(dDueOverdue1.getDate() - 4);
  const txOverdue1 = insertTx.run(bPatterns.id, student1.id, librarianUser.id, dIssueOverdue1.toISOString(), dDueOverdue1.toISOString(), null, 'OVERDUE', 'Finals preparation');

  // Overdue Loan 2 (Due 2 days ago -> $4 fine!)
  const dIssueOverdue2 = new Date(now);
  dIssueOverdue2.setDate(dIssueOverdue2.getDate() - 16);
  const dDueOverdue2 = new Date(now);
  dDueOverdue2.setDate(dDueOverdue2.getDate() - 2);
  const txOverdue2 = insertTx.run(b1984.id, student3.id, librarianUser.id, dIssueOverdue2.toISOString(), dDueOverdue2.toISOString(), null, 'OVERDUE', 'Literature seminar reading');

  // Returned Loan 1 (Returned on time)
  const dIssueRet1 = new Date(now);
  dIssueRet1.setDate(dIssueRet1.getDate() - 20);
  const dDueRet1 = new Date(now);
  dDueRet1.setDate(dDueRet1.getDate() - 6);
  const dRet1 = new Date(now);
  dRet1.setDate(dRet1.getDate() - 7);
  insertTx.run(bSapiens.id, student2.id, librarianUser.id, dIssueRet1.toISOString(), dDueRet1.toISOString(), dRet1.toISOString(), 'RETURNED', 'Completed reading');

  // Returned Loan 2 (Returned)
  const dIssueRet2 = new Date(now);
  dIssueRet2.setDate(dIssueRet2.getDate() - 25);
  const dDueRet2 = new Date(now);
  dDueRet2.setDate(dDueRet2.getDate() - 11);
  const dRet2 = new Date(now);
  dRet2.setDate(dRet2.getDate() - 10);
  insertTx.run(bMeditations.id, student1.id, librarianUser.id, dIssueRet2.toISOString(), dDueRet2.toISOString(), dRet2.toISOString(), 'RETURNED', 'Returned on time');

  console.log('Transactions seeded.');

  // 4. Seed Fines
  const insertFine = db.prepare(`
    INSERT INTO fines (transaction_id, user_id, amount, overdue_days, paid, paid_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  // Unpaid fine for Student 1 ($8.00)
  insertFine.run(txOverdue1.lastInsertRowid, student1.id, 8.00, 4, 0, null);
  // Unpaid fine for Student 3 ($4.00)
  insertFine.run(txOverdue2.lastInsertRowid, student3.id, 4.00, 2, 0, null);

  console.log('Fines seeded.');

  // 5. Seed Reservations (FIFO queue for Introduction to Algorithms)
  const insertRes = db.prepare(`
    INSERT INTO reservations (book_id, user_id, status, queue_position, reserved_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `);
  insertRes.run(bAlgo.id, student2.id, 'PENDING', 1);
  insertRes.run(bAlgo.id, student3.id, 'PENDING', 2);
  insertRes.run(bClean.id, student1.id, 'PENDING', 1);

  console.log('Reservations seeded.');

  // 6. Seed Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);
  insertNotif.run(student1.id, 'Overdue Alert: Design Patterns', 'Your loan of "Design Patterns" is 4 days overdue. A late fee of $8.00 has been assessed.', 'OVERDUE', 0);
  insertNotif.run(student1.id, 'Due Date Reminder', '"Introduction to Algorithms" is due in 10 days.', 'INFO', 0);
  insertNotif.run(student2.id, 'Reservation Confirmed', 'You are #1 in the queue for "Introduction to Algorithms". You will be alerted when a copy is returned.', 'RESERVATION', 0);
  insertNotif.run(student3.id, 'Late Return Notice', '"1984" is 2 days past due date.', 'WARNING', 0);
  insertNotif.run(librarianUser.id, 'Circulation Milestone', '15 items processed this week across campus branches.', 'SYSTEM', 0);
  insertNotif.run(adminUser.id, 'System Status: All Engines Operational', 'Database WAL mode active, C DSA engine verified (154 tests passing).', 'SYSTEM', 0);

  // 7. Seed Activity Logs
  const insertLog = db.prepare(`
    INSERT INTO activity_logs (user_id, action, description, entity_type, entity_id, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);
  insertLog.run(librarianUser.id, 'ISSUE_BOOK', 'Issued "Introduction to Algorithms" to Alex Johnson', 'TRANSACTION', 1);
  insertLog.run(librarianUser.id, 'ISSUE_BOOK', 'Issued "Clean Code" to Elena Rostova', 'TRANSACTION', 2);
  insertLog.run(student1.id, 'RESERVE_HOLD', 'Joined hold queue for "Clean Code"', 'RESERVATION', 3);
  insertLog.run(librarianUser.id, 'RETURN_BOOK', 'Processed return of "Sapiens" from Elena Rostova', 'TRANSACTION', 5);
  insertLog.run(adminUser.id, 'SYSTEM_MAINTENANCE', 'Ran diagnostic verification on all database indexes and C DSA engine', 'SYSTEM', null);

  console.log('Seeding completed successfully with rich operational datasets!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
