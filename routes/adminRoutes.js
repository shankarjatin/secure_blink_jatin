const express = require('express');
const { getAllUser } = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const feedbackController = require('../controllers/feedBackController');
const csrf = require('csurf');
const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.get('/users', verifyAdmin ,  getAllUser);
router.get('/feedback',verifyAdmin, feedbackController.getAllFeedback);

module.exports = router;