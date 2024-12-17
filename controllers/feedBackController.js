const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
  try {
    const user_id = req.user.id; // Extracted from the verified token by middleware

    // Create new feedback with user ID
    const feedback = new Feedback({
      user: user_id,
      rating: req.body.rating,
      review: req.body.review,
      feedbackType: req.body.feedbackType,
    });

    // Save the feedback to the database
    await feedback.save();

    // Return success response
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
};

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