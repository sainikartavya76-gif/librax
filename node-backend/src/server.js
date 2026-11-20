require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');
const reservationRoutes = require('./routes/reservations');
const fineRoutes = require('./routes/fines');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const activityRoutes = require('./routes/activity');
const dsaRoutes = require('./routes/dsa');

const app = express();
const PORT = process.env.PORT || 8000;

// Security & Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend static assets path
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount API Routes
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);
app.use('/reservations', reservationRoutes);
app.use('/fines', fineRoutes);
app.use('/notifications', notificationRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/activity', activityRoutes);
app.use('/dsa', dsaRoutes);

// SPA Fallback for all client routes (e.g. /app/dashboard, /login, etc.)
if (fs.existsSync(frontendDist)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'LibraX Backend API is active', version: '1.0.0' });
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    detail: err.message || 'An internal server error occurred'
  });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`LibraX Unified Fullstack Server running on port ${PORT}`);
    console.log(`Fullstack Website URL: http://localhost:${PORT}`);
  });
}

module.exports = app;
