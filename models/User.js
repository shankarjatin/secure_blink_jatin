const mongoose = require("mongoose");

// Define User Schema
const userSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Unique identifier for each user
  name: { type: String, required: true }, // Full name of the user
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
});

module.exports = mongoose.model("User", userSchema);
