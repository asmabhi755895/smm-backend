const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 00.00 }, // Generous sign-up bonus
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);