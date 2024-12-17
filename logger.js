const winston = require('winston');

// Create a winston logger
const logger = winston.createLogger({
  level: 'info', // Set the default log level
  format: winston.format.combine(
    winston.format.timestamp(), // Include timestamp in logs
    winston.format.simple() // Simple text format
  ),
  transports: [
    // Log to the console
    new winston.transports.Console({ format: winston.format.simple() }),
    // Log to a file (security logs, user activities)
    new winston.transports.File({ filename: 'logs/app.log' })
  ],
});

// For security-related events, log to a separate file
const securityLogger = winston.createLogger({
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/security.log' }),
  ],
});

module.exports = { logger, securityLogger };
