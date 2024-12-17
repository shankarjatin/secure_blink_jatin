const express = require('express');
const { signup, login, forgotPassword, resetPassword,  } = require('../controllers/authController');

const router = express.Router();


// Normal signup and login routes
router.post('/signup',  signup);       // User registration
router.post('/login' , login);         // User login

// Forgot and reset password routes
router.post('/forgot-password', forgotPassword); // Request reset link
router.post('/reset-password', resetPassword);   // Reset password with token



module.exports = router;