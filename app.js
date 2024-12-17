const express = require('express');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const session = require('express-session');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { logger } = require('./logger');

dotenv.config();
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
}));

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Logging
app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) }
}));

// Connect to DB
connectDB();

// Routes
app.get('/get-csrf-token', (req, res) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  res.json({ csrfToken: req.csrfToken() });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

module.exports = app; // Export app without listening
