const express = require('express');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const session = require('express-session');
const cors = require('cors');
const morgan = require('morgan');
const { logger } = require('./logger');
const connectDB = require('./config/db');
const cron = require('node-cron');
const axios = require('axios');
const cookieParser = require('cookie-parser');

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

// CSRF Protection - MUST come before any route handlers
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Debugging CSRF token
app.use((req, res, next) => {
  console.log('Generated CSRF Token:', req.csrfToken());
  next();
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per IP
  message: 'Too many requests, please try again later',
});
app.use(limiter);

// Database Connection
connectDB();

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: message => logger.info(message.trim())
  }
}));

// Routes
app.get('/get-csrf-token', (req, res) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  res.json({ csrfToken: req.csrfToken() });
});

app.post('/test-csrf', (req, res) => {
  res.send('CSRF token validated successfully.');
});

app.get('/', (req, res) => {
  res.send('Server is running and active!');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/feedback'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Cron job to keep the server awake
cron.schedule('*/20 * * * * *', async () => {
  try {
    console.log('Pinging server to keep it awake...');
    await axios.get('https://mutaengine-jatin.onrender.com/');
    console.log('Server pinged successfully');
  } catch (error) {
    console.error('Error pinging the server:', error.message);
  }
});

// Start the server
const PORT = process.env.PORT || 8002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
