const mongoose = require("mongoose");

// User model reference
// Assuming you have a User model in your project

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1, // Assuming ratings are on a scale from 1 to 5
    max: 5,
  },
  review: {
    type: String,
    maxlength: 1000, // Limit the review length if necessary
  },
  feedbackType: {
    type: String,
    enum: ["product", "service", "general"], // Example of feedback types, can be modified
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
