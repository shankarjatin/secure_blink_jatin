const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
// CSRF protection middleware
const csrfProtection = csrf({ cookie: true });

const { LOCAL_API_URL, PROD_API_URL } = require("../utils/constants");
const apiUrl =
  process.env.NODE_ENV === "development" ? PROD_API_URL : LOCAL_API_URL;
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Secure connection using SSL
  secure: true,
  auth: {
    user: "shankarjatin1005@gmail.com",
    pass: "tgqf dbfg idrd nxhj",
  },
});

// reCAPTCHA verification function

exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Verify reCAPTCHA token

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check for referral ID in cookies

    // Create new user with referral ID if available
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
};
exports.login = async (req, res) => {
  const { email, password } = req.body;
 
  try {
      // Find the user by email
      
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

      // Generate JWT token
      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Generate CSRF token
      // const csrfToken = req.csrfToken();  // Generate CSRF token

      // Set CSRF token as an HTTP-only cookie
//       res.cookie('csrfToken', csrfToken, { httpOnly: true, secure: true });
// console.log(csrfToken,token)
      // Send both JWT and CSRF tokens in the response
    // Generate CSRF token

// Set CSRF token as an HTTP-only cookie
      res.json({
          token,
          // csrfToken,
          email: user.email,
          role: user.role
      });
  } catch (error) {
    console.log(error);
      res.status(500).send('Server error');
  }
};

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

