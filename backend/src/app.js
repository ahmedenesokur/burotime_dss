// Express application setup
const express = require('express');
const cors = require('cors');

// Import routes
const urunlerRoutes = require('./routes/urunlerRoutes');
const satisRoutes = require('./routes/satisRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const tahminRoutes = require('./routes/tahminRoutes');
const parametrelerRoutes = require('./routes/parametrelerRoutes');

const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/urunler', urunlerRoutes);
app.use('/api/satis', satisRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tahmin', tahminRoutes);
app.use('/api/parametreler', parametrelerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BüroTime KDS API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
