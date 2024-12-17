
const User = require('../models/User');
exports.getAllUser = async (req, res) => {
    try {
        const Users = await User.find(); // Fetch all products from the database
        return res.status(200).json({ Users });
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ msg: 'Server error' });
    }
};
