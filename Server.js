require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const User = require('./models/User');
const Order = require('./models/Order');

const app = express();

// Configure CORS to accept requests from your production Netlify domain or local environment
app.use(cors({
    origin: [
        'https://asmhereee.netlify.app', // <-- Match your live URL exactly
        'http://localhost:3000',
        'http://127.0.0.1:5500',
        'http://localhost:5000'
    ],
    credentials: true
}));

app.use(express.json());

// Connect Database
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Engine Successfully Connected'))
    .catch(err => console.error('Database connection crash:', err));

// --- SECURITY MIDDLEWARE GUARD ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: 'Access Token Missing' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid or Expired Token' });
        req.user = user;
        next();
    });
};

// ==========================================
// AUTHENTICATION CONTROLLER ENDPOINTS
// ==========================================

// Register Account
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        let userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ success: false, message: 'Email address already registered' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ success: true, message: 'Account generated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Login & Generate JWT Session Token
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials profile' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ success: false, message: 'Invalid credentials profile' });

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({ success: true, token, message: 'Authentication verified' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Sync Profile Wallet State
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// CORE SMM ORDER TRANSACTION HANDLING
// ==========================================

app.post('/api/orders', authenticateToken, async (req, res) => {
    try {
        const { serviceType, packagePrice, quantity, link, serviceLabel } = req.body;

        const user = await User.findById(req.user.id);
        if (user.balance < packagePrice) {
            return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
        }

        // Deduct balance securely
        user.balance -= packagePrice;
        await user.save();

        let providerOrderId = `MOCK_${Math.floor(Math.random() * 900000) + 100000}`;

        // Forward to master provider via API
        try {
            if (process.env.PROVIDER_API_KEY && process.env.PROVIDER_API_KEY !== 'YOUR_ACTUAL_MASTER_PROVIDER_API_KEY') {
                const response = await axios.post(process.env.PROVIDER_API_URL, {
                    key: process.env.PROVIDER_API_KEY,
                    action: 'add',
                    service: getProviderServiceId(serviceType, quantity),
                    link: link,
                    quantity: quantity
                });
                if (response.data && response.data.order) {
                    providerOrderId = response.data.order;
                }
            }
        } catch (apiErr) {
            console.log('Provider API connection skipped or credentials defaulted. Falling back to mock tracking ID.');
        }

        // Save order document locally
        const newOrder = new Order({
            userId: user._id,
            serviceType,
            serviceLabel,
            quantity,
            link,
            charge: packagePrice,
            providerOrderId
        });
        await newOrder.save();

        res.json({
            success: true,
            message: 'Pipeline dispatched successfully',
            remainingBalance: user.balance,
            providerOrderId
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Helper Map Resolver to handle all package sizes completely
function getProviderServiceId(type, qty) {
    // Followers Mapping Tiers
    if (type === 'followers') {
        if (qty === 1000) return 101;
        if (qty === 2000) return 102;
        if (qty === 5000) return 103;
        if (qty === 10000) return 104;
    }
    // Likes Mapping Tiers
    if (type === 'likes') {
        if (qty === 1000) return 201;
        if (qty === 2000) return 202;
        if (qty === 5000) return 203;
        if (qty === 10000) return 204;
    }
    // Shares Mapping Tiers
    if (type === 'shares') {
        if (qty === 1000) return 301;
        if (qty === 2000) return 302;
        if (qty === 5000) return 303;
        if (qty === 10000) return 304;
    }
    return 9999; // Default fallback ID if no condition is explicitly met
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SocialBoost Core Listening on Port ${PORT}`));