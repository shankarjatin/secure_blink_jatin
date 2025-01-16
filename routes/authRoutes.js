const express = require('express');
const { signup, login, forgotPassword, resetPassword } = require('../controllers/authController');
const csrf = require('csurf');
const router = express.Router();

// CSRF protection middleware


// Middleware to send CSRF token to the client after login

// Normal signup and login routes
router.post('/signup', signup); // User registration
router.post('/login', login,); // Login and generate CSRF token

// Forgot and reset password routes (with CSRF protection)
router.post('/forgot-password',  forgotPassword); // Request reset link
router.post('/reset-password',  resetPassword);   // Reset password with token

module.exports = router;
