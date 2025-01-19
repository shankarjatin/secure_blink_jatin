const Feedback = require('../models/Feedback');

const { check, validationResult } = require('express-validator');

// Feedback validation rules
exports.validateFeedback = [
    check('rating', 'Rating must be an integer between 1 and 5')
        .isInt({ min: 1, max: 5 }), // Ensure the rating is an integer within the specified range
    check('review', 'Review cannot be empty and must be less than 300 characters')
        .not().isEmpty()
        .isLength({ max: 300 }), // Check for non-empty and max length
    check('feedbackType', 'Feedback should be either a complaint, suggestion, or compliment')
        .not().isEmpty()
         // Validate feedback type against a list of acceptable values
];

// Middleware to check validation results
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Updated feedback submission endpoint using validation
exports.submitFeedback = [
    exports.validateFeedback,
    exports.validate,
    async (req, res) => {
        try {
            const user_id = req.user.id; // Extracted from the verified token by middleware

            const feedback = new Feedback({
                user: user_id,
                rating: req.body.rating,
                review: req.body.review,
                feedbackType: req.body.feedbackType,
            });

            await feedback.save();

            res.status(201).json({
                message: 'Feedback submitted successfully!',
                feedback,
            });
        } catch (error) {
            res.status(500).json({
                message: 'An error occurred while submitting feedback',
                error: error.message,
            });
        }
    }
];

exports.getAllFeedback = async (req, res) => {
  try {
    // Find all feedback and populate user information (name and email)
    const feedback = await Feedback.find().populate('user', 'name email').setOptions({ strictPopulate: false });

    
    res.status(200).json({
      message: 'All feedback retrieved successfully!',
      feedback,
    });
  } catch (error) {
    res.status(500).json({
      message: 'An error occurred while fetching feedback',
      error: error.message,
    });
  }
};