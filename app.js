const express = require('express');
const dotenv = require('dotenv');
// const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const connectDB = require('./config/db');
// require('./config/passport');
const cron = require('node-cron');
const axios = require('axios');

const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(cookieParser());


connectDB();

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/feedback'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.get('/', (req, res) => {
    res.send('Server is running and active!');
  });

  cron.schedule('**/20 * * * * *', async () => {
    try {
      console.log('Pinging server to keep it awake...');
      // Change this to your actual server's public URL
      await axios.get('https://mutaengine-jatin.onrender.com/');
      console.log('Server pinged successfully');
    } catch (error) {
      console.error('Error pinging the server:', error.message);
    }
  });



const PORT = process.env.PORT || 8002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
