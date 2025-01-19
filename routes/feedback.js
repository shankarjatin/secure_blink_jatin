const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

const feedbackController = require('../controllers/feedBackController');
const { verifyToken } = require('../middleware/authMiddleware'); // The middleware you just created

// Route to submit feedback (protected route, requires Bearer token)
router.post('/submit-feedback', verifyToken, feedbackController.submitFeedback);

module.exports = router;
