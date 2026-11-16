const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Security headers
app.use(helmet());

// CORS configuration - restricted to client origin
app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true
}));

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP logger (disabled in test environment)
if (config.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Mount API routes
app.use('/api', apiRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
