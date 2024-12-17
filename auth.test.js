const request = require('supertest');
const app = require('./app'); // Import your Express app
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
require('dotenv').config();

let userToken; // Store user JWT token
let adminToken; // Store admin JWT token
let csrfToken; // Store CSRF Token
let cookie; // Store cookies for CSRF validation

// Setup before all tests
beforeAll(async () => {
  // Connect to the database
  await connectDB();
  await User.deleteMany(); // Clear the database before testing

  // Fetch CSRF token and cookies for subsequent requests
  const csrfRes = await request(app).get('/get-csrf-token');
  csrfToken = csrfRes.body.csrfToken;
  cookie = csrfRes.headers['set-cookie'];

  // Hash passwords for test users
  const userPassword = await bcrypt.hash('Password123', 10);
  const adminPassword = await bcrypt.hash('AdminPassword123', 10);

  // Create a regular user
  const user = new User({
    name: 'Test User',
    email: 'user@example.com',
    password: userPassword,
    role: 'user',
  });
  await user.save();

  // Create an admin user
  const admin = new User({
    name: 'Admin User',
    email: 'admin@example.com',
    password: adminPassword,
    role: 'admin',
  });
  await admin.save();

  // Generate JWT tokens for test users
  userToken = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  adminToken = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication and Authorization Tests', () => {
  // Test: Register a new user
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .set('Cookie', cookie)
      .set('CSRF-Token', csrfToken)
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: 'user',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  // Test: Prevent duplicate user registration
  it('should not register a user with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .set('Cookie', cookie)
      .set('CSRF-Token', csrfToken)
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: 'user',
      });

    expect(res.status).toBe(400);
    expect(res.body.msg).toBe('User already exists');
  });

  // Test: Login existing user
  it('should log in an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Cookie', cookie)
      .set('CSRF-Token', csrfToken)
      .send({
        email: 'user@example.com',
        password: 'Password123',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  // Test: Prevent login with invalid credentials
  it('should not log in with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Cookie', cookie)
      .set('CSRF-Token', csrfToken)
      .send({
        email: 'user@example.com',
        password: 'WrongPassword',
      });

    expect(res.status).toBe(400);
    expect(res.body.msg).toBe('Invalid credentials');
  });

  // Test: Forgot password functionality
  it('should send a reset password link', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .set('Cookie', cookie)
      .set('CSRF-Token', csrfToken)
      .send({
        email: 'user@example.com',
      });

    expect(res.status).toBe(200);
    expect(res.body.msg).toBe('Reset link sent to your email');
  });

  // Test: Deny access to admin route for non-admin users
  it('should deny access to admin route for non-admin users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Cookie', cookie)
      .set('CSRF-Token', csrfToken);

    expect(res.status).toBe(403);
    expect(res.body.msg).toBe('Access denied: Admins only');
  });

  // Test: Allow access to admin route for admin users
  it('should allow access to admin route for admin users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Cookie', cookie)
      .set('CSRF-Token', csrfToken);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('Users');
  });
});
