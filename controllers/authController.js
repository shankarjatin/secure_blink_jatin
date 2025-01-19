const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const { check, validationResult } = require('express-validator');

// User validation rules
exports.validateUser = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('role', 'Role must be either user or admin')
    .not().isEmpty()
    .isIn(['user', 'admin']),
    // You can add more rules here based on your requirements
];

// Middleware to check validation results
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// CSRF protection middleware
const csrfProtection = csrf({ cookie: true });

const { LOCAL_API_URL, PROD_API_URL } = require("../utils/constants");
const apiUrl = process.env.NODE_ENV === "development" ? PROD_API_URL : LOCAL_API_URL;
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Secure connection using SSL
  secure: true,
  auth: {
    user: "shankarjatin1005@gmail.com",
    pass: "tgqf dbfg idrd nxhj",
  },
});

// Email validation function
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.signup =[
exports.validateUser,
exports.validate, async (req, res) => {
  const { name, email, password, role } = req.body;

  // Verify if the email is valid
  if (!isValidEmail(email)) {
    return res.status(400).json({ msg: "Invalid email format" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      role,
      password: hashedPassword,
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
}];

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Verify if the email is valid
  if (!isValidEmail(email)) {
    return res.status(400).json({ msg: "Invalid email format" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};

// Other functions remain unchanged


exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ msg: 'User not found' });
  
      const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });  // Token valid for 15 minutes
      const resetURL = `${apiUrl}/api/auth/reset-password?token=${resetToken}`;  // Create reset URL with query parameter
  
      // Send reset link via email
      const mailOptions = {
        from: 'shankarjatin1005@gmail.com',
        to: user.email,
        subject: 'Password Reset Request',
        html: `<p>You have requested a password reset. Click the link below to reset your password:</p>
               <a href="${resetURL}">Reset Password</a>
               <p>If you did not request this, please ignore this email.</p>`
      };
  
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error('Error sending email:', err);
          return res.status(500).json({ msg: 'Error sending email', error: err });
        }
        res.json({ msg: 'Reset link sent to your email' });
      });
    } catch (error) {
      res.status(500).send('Server error');
    }
  };

  exports.resetPassword = async (req, res) => {
    const { token } = req.query;  // Get token from query parameter
    const { newPassword } = req.body;  // Get new password from request body
  
    try {
      // Verify the reset token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ msg: 'User not found' });
  
      // Hash the new password and update the user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      res.json({ msg: 'Password has been reset successfully' });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({ msg: 'Token has expired' });
      }
      res.status(500).send('Server error');
    }
  };

